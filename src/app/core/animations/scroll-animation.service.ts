import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, NgZone, PLATFORM_ID, inject, signal } from '@angular/core';
import type { gsap as GsapNamespace } from 'gsap';
import type { ScrollTrigger as ScrollTriggerClass } from 'gsap/ScrollTrigger';
import type { SplitText as SplitTextClass } from 'gsap/SplitText';
import type Lenis from 'lenis';

import { EASES, INTRO_DURATION_MS, REDUCED_MOTION_MQ, lenisEasing } from './motion';

export interface MotionLib {
  readonly gsap: typeof GsapNamespace;
  readonly ScrollTrigger: typeof ScrollTriggerClass;
  readonly SplitText: typeof SplitTextClass;
}

export type MotionSetup = (lib: MotionLib, ctx: gsap.Context) => void | (() => void);

export interface ScopeOptions {
  /** Roda no lugar do setup quando o usuário prefere movimento reduzido (ou o JS de animação falhou). */
  readonly reduced?: () => void;
}

/**
 * Ponto único de inicialização das animações (port de initLenis/initScripts do clone).
 *
 * - SSR-safe: nada aqui toca `window`/`document` no servidor; GSAP e Lenis são importados
 *   dinamicamente só no navegador (ficam fora do bundle inicial e não atrasam o LCP).
 * - Tudo roda fora da zona do Angular.
 * - `scope()` cria um `gsap.context()` por diretiva/componente e chama `ctx.revert()` no destroy.
 */
@Injectable({ providedIn: 'root' })
export class ScrollAnimationService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  readonly isBrowser = isPlatformBrowser(this.platformId);
  /** `true` com prefers-reduced-motion: reduce. Atualiza se a preferência mudar. */
  readonly reducedMotion = signal(false);

  private libPromise: Promise<MotionLib> | null = null;
  private startPromise: Promise<void> | null = null;
  private lib: MotionLib | null = null;
  private lenis: Lenis | null = null;
  private lockCount = 0;
  private readonly startedAt = this.isBrowser ? performance.now() : 0;

  constructor() {
    if (!this.isBrowser) return;
    const mq = this.document.defaultView?.matchMedia(REDUCED_MOTION_MQ);
    if (mq) {
      this.reducedMotion.set(mq.matches);
      mq.addEventListener('change', (e) => this.reducedMotion.set(e.matches));
    }
  }

  /** Reveals (estado inicial escondido) só valem com a classe js-anim ativa e sem movimento reduzido. */
  get animateReveals(): boolean {
    return (
      this.isBrowser &&
      !this.reducedMotion() &&
      this.document.documentElement.classList.contains('js-anim')
    );
  }

  /** Segundos que faltam para o loader terminar (0 se não houve loader nesta visita). */
  introRemaining(): number {
    if (!this.isBrowser || !this.document.documentElement.classList.contains('has-intro')) return 0;
    const elapsed = performance.now() - this.startedAt;
    return Math.max(0, (INTRO_DURATION_MS * 0.7 - elapsed) / 1000);
  }

  /** Carrega GSAP + plugins + Lenis uma única vez. */
  load(): Promise<MotionLib> {
    if (!this.isBrowser) return new Promise<MotionLib>(() => undefined);
    this.libPromise ??= this.zone.runOutsideAngular(async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }, { CustomEase }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
        import('gsap/CustomEase'),
      ]);
      gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);
      for (const [name, curve] of Object.entries(EASES)) CustomEase.create(name, curve);
      ScrollTrigger.config({ ignoreMobileResize: true });

      const lib: MotionLib = { gsap, ScrollTrigger, SplitText };
      this.lib = lib;

      if (!this.reducedMotion()) await this.initLenis(lib);
      this.watchRefresh(lib);
      this.document.documentElement.classList.add('anim-ready');
      return lib;
    });
    return this.libPromise;
  }

  /**
   * Executa `setup` dentro de um `gsap.context` ligado a `host`, fora da zona do Angular,
   * e reverte tudo (tweens, ScrollTriggers, SplitText) quando o `destroyRef` for destruído.
   * Deve ser chamado dentro de `afterNextRender`.
   */
  scope(
    host: HTMLElement,
    destroyRef: DestroyRef,
    setup: MotionSetup,
    options: ScopeOptions = {},
  ): void {
    if (!this.isBrowser) return;
    let destroyed = false;
    let ctx: gsap.Context | null = null;
    let cleanup: (() => void) | void;

    destroyRef.onDestroy(() => {
      destroyed = true;
      ctx?.revert();
      cleanup?.();
    });

    if (this.reducedMotion()) {
      options.reduced?.();
      return;
    }

    this.whenStart()
      .then(() => this.load())
      .then((lib) => {
        if (destroyed) return;
        this.zone.runOutsideAngular(() => {
          ctx = lib.gsap.context((self) => {
            cleanup = setup(lib, self);
          }, host);
        });
      });
  }

  /**
   * Adia o carregamento do GSAP/Lenis para não competir com o LCP e a hidratação:
   * começa na primeira interação (scroll, toque, tecla) ou quando o navegador fica ocioso
   * depois do evento load, o que vier primeiro.
   */
  private whenStart(): Promise<void> {
    this.startPromise ??= new Promise<void>((resolve) => {
      const win = this.document.defaultView;
      if (!win) return;
      const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'] as const;
      let done = false;
      const go = () => {
        if (done) return;
        done = true;
        events.forEach((e) => win.removeEventListener(e, go));
        resolve();
      };
      events.forEach((e) => win.addEventListener(e, go, { passive: true }));
      const idle = () =>
        'requestIdleCallback' in win
          ? win.requestIdleCallback(go, { timeout: 1200 })
          : setTimeout(go, 200);
      if (this.document.readyState === 'complete') idle();
      else win.addEventListener('load', idle, { once: true });
    });
    return this.startPromise;
  }

  refresh(): void {
    this.lib?.ScrollTrigger.refresh();
  }

  /** Assina a velocidade do scroll (Lenis). Retorna a função para cancelar. */
  onScroll(cb: (velocity: number, direction: number) => void): () => void {
    const lenis = this.lenis;
    if (!lenis) return () => undefined;
    const handler = (l: Lenis) => cb(l.velocity, l.direction);
    return lenis.on('scroll', handler);
  }

  /** Trava o scroll (menu/modal), compensando a largura da barra de rolagem. */
  lock(): void {
    if (!this.isBrowser) return;
    this.lockCount++;
    if (this.lockCount > 1) return;
    const html = this.document.documentElement;
    const win = this.document.defaultView;
    const scrollbar = (win?.innerWidth ?? 0) - html.clientWidth;
    html.style.setProperty('--scrollbar-width', `${scrollbar}px`);
    html.classList.add('is-locked');
    this.lenis?.stop();
  }

  unlock(): void {
    if (!this.isBrowser || this.lockCount === 0) return;
    this.lockCount--;
    if (this.lockCount > 0) return;
    const html = this.document.documentElement;
    html.classList.remove('is-locked');
    html.style.removeProperty('--scrollbar-width');
    this.lenis?.start();
  }

  /**
   * Rola até uma seção compensando o header fixo e move o foco para ela (acessibilidade).
   * Com smooth scroll ativo usa o Lenis; sem ele, o scroll nativo.
   */
  scrollTo(target: string | HTMLElement, options: { focus?: boolean } = {}): void {
    if (!this.isBrowser) return;
    const el =
      typeof target === 'string' ? this.document.getElementById(target.replace(/^#/, '')) : target;
    if (!el) return;

    const headerH =
      parseFloat(getComputedStyle(this.document.documentElement).getPropertyValue('--header-h')) *
        parseFloat(getComputedStyle(this.document.documentElement).fontSize) || 0;

    const focus = () => {
      if (options.focus === false) return;
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    };

    if (this.lenis && !this.reducedMotion()) {
      this.lenis.scrollTo(el, { offset: -headerH, duration: 1.4, onComplete: focus });
    } else {
      const top =
        el.getBoundingClientRect().top + (this.document.defaultView?.scrollY ?? 0) - headerH;
      this.document.defaultView?.scrollTo({
        top,
        behavior: this.reducedMotion() ? 'auto' : 'smooth',
      });
      focus();
    }
  }

  private async initLenis(lib: MotionLib): Promise<void> {
    const { default: LenisCtor } = await import('lenis');
    const lenis = new LenisCtor({
      duration: 1.2,
      easing: lenisEasing,
      smoothWheel: true,
      touchMultiplier: 2,
      autoRaf: false,
    });
    lenis.on('scroll', lib.ScrollTrigger.update);
    lib.gsap.ticker.add((time) => lenis.raf(time * 1000));
    lib.gsap.ticker.lagSmoothing(0);
    this.lenis = lenis;

    // Se o usuário passar a preferir movimento reduzido, desliga o smooth scroll.
    const destroyOnReduce = () => {
      if (this.reducedMotion()) {
        lenis.destroy();
        this.lenis = null;
      }
    };
    this.document.defaultView
      ?.matchMedia(REDUCED_MOTION_MQ)
      .addEventListener('change', destroyOnReduce, { once: true });
  }

  /** Recalcula os gatilhos depois que fontes e imagens carregam. */
  private watchRefresh(lib: MotionLib): void {
    const win = this.document.defaultView;
    if (!win) return;
    const refresh = () => lib.ScrollTrigger.refresh();
    this.document.fonts?.ready.then(refresh);
    if (this.document.readyState !== 'complete')
      win.addEventListener('load', refresh, { once: true });
    // Imagens lazy que carregam depois mudam alturas: refresh com debounce.
    let t: ReturnType<typeof setTimeout> | undefined;
    this.document.addEventListener(
      'load',
      (e) => {
        if (!(e.target instanceof HTMLImageElement)) return;
        clearTimeout(t);
        t = setTimeout(refresh, 150);
      },
      true,
    );
  }
}

/** Marca um elemento com estado inicial aplicado (remove o visibility:hidden do CSS). */
export function markAnimReady(el: Element | null | undefined): void {
  el?.setAttribute('data-anim-ready', '');
}
