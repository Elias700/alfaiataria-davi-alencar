import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  afterNextRender,
  inject,
  input,
  signal,
} from '@angular/core';

import type { Theme } from '../data/site-content';

/**
 * Troca de tema de elementos fixos (A11, initThemeChange do clone).
 * Cada seção declara `data-bg="dark|light|color"`. O elemento com esta diretiva (header,
 * trilho de progresso) assume o tema da seção que está passando pelo seu centro vertical.
 *
 * Implementado com IntersectionObserver (sem GSAP), porque é funcional e não decorativo:
 * continua funcionando com prefers-reduced-motion.
 */
@Directive({
  selector: '[appThemeTarget]',
  host: {
    '[class.theme-dark]': 'theme() === "dark"',
    '[class.theme-light]': 'theme() === "light"',
    '[class.theme-color]': 'theme() === "color"',
  },
})
export class ThemeTargetDirective {
  readonly appThemeTarget = input<Theme>('dark');
  readonly theme = signal<Theme>('dark');

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      this.theme.set(this.appThemeTarget());
      let observer: IntersectionObserver | null = null;

      const build = () => {
        observer?.disconnect();
        const rect = el.getBoundingClientRect();
        const centerY = Math.round(rect.top + rect.height / 2);
        const vh = window.innerHeight;
        observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const bg = (entry.target as HTMLElement).dataset['bg'] as Theme | undefined;
              if (bg) this.theme.set(bg);
            }
          },
          // Faixa de 2px na altura do centro do elemento.
          { rootMargin: `-${centerY}px 0px -${Math.max(0, vh - centerY - 2)}px 0px` },
        );
        document.querySelectorAll('[data-bg]').forEach((s) => observer?.observe(s));
      };

      zone.runOutsideAngular(() => {
        build();
        let t: ReturnType<typeof setTimeout> | undefined;
        const onResize = () => {
          clearTimeout(t);
          t = setTimeout(build, 150);
        };
        window.addEventListener('resize', onResize);
        destroyRef.onDestroy(() => {
          observer?.disconnect();
          window.removeEventListener('resize', onResize);
        });
      });
    });
  }
}
