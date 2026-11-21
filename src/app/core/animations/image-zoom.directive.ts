import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { ScrollAnimationService } from './scroll-animation.service';

/**
 * Zoom de imagem no scroll:
 * - `in` (A17, .loc-w_bg_img): a imagem chega com scale 1.15 e assenta em 1 enquanto o bloco entra.
 * - `out` (A18, .amen-scroll-area): a imagem cresce até 1.25 enquanto o bloco sai.
 * Aplicar na imagem; o gatilho é o pai (wrapper com overflow: hidden).
 * O zoom de hover das texturas é CSS puro (ver fabrics.component.scss).
 */
@Directive({ selector: '[appImageZoom]' })
export class ImageZoomDirective {
  readonly appImageZoom = input<'in' | 'out'>('in');

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap }) => {
        const trigger = el.parentElement ?? el;
        if (this.appImageZoom() === 'in') {
          gsap.fromTo(
            el,
            { scale: 1.15, transformOrigin: 'center bottom' },
            {
              scale: 1,
              ease: 'Ease',
              scrollTrigger: { trigger, start: 'top bottom', end: 'bottom bottom', scrub: 0.25 },
            },
          );
        } else {
          gsap.fromTo(
            el,
            { scale: 1 },
            {
              scale: 1.25,
              ease: 'In',
              scrollTrigger: { trigger, start: 'top top', end: 'bottom top', scrub: true },
            },
          );
        }
      });
    });
  }
}
