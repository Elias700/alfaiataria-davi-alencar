import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
} from '@angular/core';

import { DELAY_REVEAL, DUR_L, STAGGER } from './motion';
import { ScrollAnimationService, markAnimReady } from './scroll-animation.service';

/**
 * Variantes de texto do clone:
 * - `chars-flip` (A3, animateTextA): letras giram no eixo X vindo da direita. Títulos display.
 * - `chars` (A4, animateTextH): letras sobem girando no eixo Y. Títulos de seção.
 * - `lines` (A5, animateTextP): linhas sobem por trás de uma máscara. Parágrafos.
 * - `words-scrub`: palavras acendem conforme o scroll (pedido do briefing para o manifesto).
 */
export type SplitVariant = 'chars-flip' | 'chars' | 'lines' | 'words-scrub';

@Directive({
  selector: '[appSplitText]',
  host: { '[attr.data-anim]': 'hides() ? "" : null' },
})
export class SplitTextDirective {
  readonly appSplitText = input<SplitVariant>('lines');
  /** `scroll`: dispara ao entrar na tela (uma vez). `intro`: dispara ao fim do loader (hero). */
  readonly splitTrigger = input<'scroll' | 'intro'>('scroll');
  /** Atraso extra em segundos (somado ao delayReveal do clone). */
  readonly splitDelay = input(0);
  /** Posição dentro de um grupo: atrasa `index × stagger`, como o agrupamento por wrapper do clone. */
  readonly splitIndex = input(0);

  protected readonly hides = computed(() => this.appSplitText() !== 'words-scrub');

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap, SplitText, ScrollTrigger }, ctx) => {
        const variant = this.appSplitText();
        if (!anim.animateReveals && variant !== 'words-scrub') {
          markAnimReady(el);
          return;
        }

        const delay =
          (this.splitTrigger() === 'intro' ? anim.introRemaining() : DELAY_REVEAL) +
          this.splitDelay() +
          this.splitIndex() * STAGGER;
        const scrollTrigger =
          this.splitTrigger() === 'scroll'
            ? { trigger: el, start: 'top 90%', once: true }
            : undefined;

        // aria-label só é permitido em headings; em <p>/<span> o texto dividido continua legível sem ARIA.
        const aria = /^H[1-6]$/.test(el.tagName) ? 'auto' : 'none';

        const run = () => {
          if (variant === 'words-scrub') {
            SplitText.create(el, {
              type: 'words',
              wordsClass: 'split-word',
              aria,
              autoSplit: true,
              onSplit: (self) =>
                gsap.fromTo(
                  self.words,
                  // 0.6 mantém contraste ≥ 4.5:1 mesmo antes de acender (WCAG AA).
                  { opacity: 0.6 },
                  {
                    opacity: 1,
                    ease: 'none',
                    stagger: 0.1,
                    scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 55%', scrub: 0.5 },
                  },
                ),
            });
            return;
          }

          if (variant === 'lines') {
            let done = false;
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'split-line',
              mask: 'lines',
              aria,
              autoSplit: true,
              onSplit: (self) => {
                markAnimReady(el);
                if (done) return;
                return gsap.fromTo(
                  self.lines,
                  { yPercent: 110 },
                  {
                    yPercent: 0,
                    duration: DUR_L,
                    delay,
                    stagger: STAGGER,
                    ease: 'Out',
                    scrollTrigger,
                    onComplete: () => {
                      done = true;
                    },
                  },
                );
              },
            });
            return;
          }

          const split = SplitText.create(el, {
            type: 'words,chars',
            wordsClass: 'split-word',
            charsClass: 'split-char',
            smartWrap: true,
            aria,
          });
          markAnimReady(el);

          if (variant === 'chars-flip') {
            gsap.fromTo(
              split.chars,
              {
                opacity: 0,
                rotateX: 90,
                x: '0.9em',
                transformOrigin: 'center bottom',
                transformPerspective: 600,
              },
              {
                opacity: 1,
                rotateX: 0,
                x: 0,
                duration: DUR_L,
                delay,
                stagger: STAGGER * 0.6,
                ease: 'Out',
                scrollTrigger,
              },
            );
          } else {
            gsap.fromTo(
              split.chars,
              { opacity: 0, yPercent: 50, rotateY: 90, transformPerspective: 600 },
              {
                opacity: 1,
                yPercent: 0,
                rotateY: 0,
                duration: DUR_L,
                delay,
                stagger: STAGGER * 0.5,
                ease: 'Out',
                scrollTrigger,
              },
            );
          }
        };

        // Divide o texto só quando ele se aproxima da tela (espalha o custo do SplitText pelo scroll).
        if (this.splitTrigger() === 'intro') run();
        else
          ScrollTrigger.create({
            trigger: el,
            start: 'top bottom+=60%',
            once: true,
            onEnter: () => ctx.add(run),
          });
      });
    });
  }
}
