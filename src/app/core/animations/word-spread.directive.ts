import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

import { ScrollAnimationService } from './scroll-animation.service';

/**
 * Palavras que se afastam do centro conforme o scroll (A13, [data-circle-text] do clone).
 * O clone anima `word-spacing` (propriedade de layout); aqui o mesmo efeito é feito com
 * `transform: translateX` em cada palavra, sem recalcular layout.
 * O host deve conter cada palavra num elemento filho `[data-word]`.
 */
@Directive({ selector: '[appWordSpread]' })
export class WordSpreadDirective {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap }) => {
        const words = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
        if (words.length < 2) return;
        const mid = (words.length - 1) / 2;
        const spread = () => Math.min(window.innerWidth * 0.05, 72);
        gsap.fromTo(
          words,
          { x: 0 },
          {
            x: (i: number) => (i - mid) * spread(),
            ease: 'none',
            scrollTrigger: {
              trigger: el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    });
  }
}
