import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DELAY_REVEAL, DESKTOP_MQ, DUR_L, STAGGER } from './motion';
import { ScrollAnimationService, markAnimReady } from './scroll-animation.service';

/**
 * Reveals de bloco do clone:
 * - `ctn` (A6, animateCtn): sobe com fade.
 * - `line` (A7, animateLine): linha vertical se desenha de cima para baixo (clip-path).
 * - `line-x`: a mesma linha, na horizontal (da esquerda para a direita).
 * - `fade`: só opacidade (usado em elementos pequenos).
 */
export type RevealVariant = 'ctn' | 'line' | 'line-x' | 'fade';

@Directive({
  selector: '[appReveal]',
  host: { 'data-anim': '' },
})
export class RevealDirective {
  readonly appReveal = input<RevealVariant>('ctn');
  readonly revealDelay = input(0);
  readonly revealIndex = input(0);
  readonly revealTrigger = input<'scroll' | 'intro'>('scroll');

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap }) => {
        if (!anim.animateReveals) {
          markAnimReady(el);
          return;
        }
        const delay =
          (this.revealTrigger() === 'intro' ? anim.introRemaining() : DELAY_REVEAL) +
          this.revealDelay() +
          this.revealIndex() * STAGGER;
        const scrollTrigger =
          this.revealTrigger() === 'scroll'
            ? { trigger: el, start: 'top 92%', once: true }
            : undefined;
        const base = { duration: DUR_L, delay, ease: 'Out', scrollTrigger };

        switch (this.appReveal()) {
          case 'ctn': {
            const desktop = window.matchMedia(DESKTOP_MQ).matches;
            gsap.fromTo(
              el,
              { opacity: 0, y: desktop ? 48 : 32 },
              { ...base, opacity: 1, y: 0, clearProps: 'transform' },
            );
            break;
          }
          case 'line':
            gsap.fromTo(
              el,
              { clipPath: 'inset(0% 0% 100% 0%)' },
              { ...base, clipPath: 'inset(0% 0% 0% 0%)' },
            );
            break;
          case 'line-x':
            gsap.fromTo(
              el,
              { clipPath: 'inset(0% 100% 0% 0%)' },
              { ...base, clipPath: 'inset(0% 0% 0% 0%)' },
            );
            break;
          case 'fade':
            gsap.fromTo(el, { opacity: 0 }, { ...base, opacity: 1 });
            break;
        }
        markAnimReady(el);
      });
    });
  }
}
