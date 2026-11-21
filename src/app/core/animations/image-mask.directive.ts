import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DELAY_REVEAL, DUR_L } from './motion';
import { ScrollAnimationService, markAnimReady } from './scroll-animation.service';

/**
 * Máscara de imagem do clone (A8, animateSlide): o wrapper abre com um clip-path diagonal
 * enquanto a imagem interna desfaz um zoom (1.5 → 1) deslizando da direita.
 * Aplicar no wrapper (overflow: hidden, com aspect-ratio). A imagem é o primeiro filho.
 */
@Directive({
  selector: '[appImageMask]',
  host: { 'data-anim': '' },
})
export class ImageMaskDirective {
  readonly maskDelay = input(0);

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
        const inner = el.firstElementChild;
        const tl = gsap.timeline({
          delay: DELAY_REVEAL + this.maskDelay(),
          defaults: { duration: DUR_L * 1.2, ease: 'InOut' },
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
        tl.fromTo(
          el,
          { clipPath: 'polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)' },
          { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)', clearProps: 'clipPath' },
        );
        if (inner) {
          tl.fromTo(
            inner,
            { scale: 1.5, xPercent: 25 },
            { scale: 1, xPercent: 0, clearProps: 'transform' },
            0,
          );
        }
        markAnimReady(el);
      });
    });
  }
}
