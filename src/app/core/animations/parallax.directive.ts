import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DESKTOP_MQ } from './motion';
import { ScrollAnimationService } from './scroll-animation.service';

/**
 * Parallax do clone (A9, initAllParallax), sempre com scrub:
 * - `img`: imagem desliza de -15% a 15% dentro do wrapper (pai com overflow: hidden).
 * - `img-in`: imagem sobe de -20% a 0 enquanto o wrapper entra.
 * - `img-out`: imagem desce de 0 a 20% enquanto o wrapper sai.
 * - `ctn-up` / `ctn-down`: o próprio bloco sobe ou desce 10% em relação ao fluxo.
 * Nas variantes de imagem, a imagem ganha scale para nunca mostrar borda vazia.
 */
export type ParallaxVariant = 'img' | 'img-in' | 'img-out' | 'ctn-up' | 'ctn-down';

@Directive({ selector: '[appParallax]' })
export class ParallaxDirective {
  readonly appParallax = input<ParallaxVariant>('img');
  /** `false` desliga abaixo de 992px (data-mob="off" no clone). */
  readonly parallaxMobile = input(false);

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap }) => {
        const mm = gsap.matchMedia();
        const query = this.parallaxMobile() ? '(min-width: 0px)' : DESKTOP_MQ;
        mm.add(query, () => {
          const wrap = el.parentElement ?? el;
          switch (this.appParallax()) {
            case 'img':
              gsap.fromTo(
                el,
                { yPercent: -12, scale: 1.3 },
                {
                  yPercent: 12,
                  scale: 1.3,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: wrap,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                  },
                },
              );
              break;
            case 'img-in':
              gsap.fromTo(
                el,
                { yPercent: -16, scale: 1.35 },
                {
                  yPercent: 0,
                  scale: 1.35,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: wrap,
                    start: 'top bottom',
                    end: 'bottom bottom',
                    scrub: true,
                  },
                },
              );
              break;
            case 'img-out':
              gsap.fromTo(
                el,
                { yPercent: 0, scale: 1.35 },
                {
                  yPercent: 16,
                  scale: 1.35,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: wrap,
                    start: 'bottom bottom',
                    end: 'bottom top',
                    scrub: 0.5,
                  },
                },
              );
              break;
            case 'ctn-up':
            case 'ctn-down': {
              const dir = this.appParallax() === 'ctn-up' ? 1 : -1;
              gsap.fromTo(
                el,
                { yPercent: 10 * dir },
                {
                  yPercent: -10 * dir,
                  ease: 'none',
                  scrollTrigger: { trigger: el, start: 'top 125%', end: 'bottom -25%', scrub: 0.5 },
                },
              );
              break;
            }
          }
        });
        return () => mm.revert();
      });
    });
  }
}
