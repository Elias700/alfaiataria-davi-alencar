import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

import { DESKTOP_MQ, POINTER_FINE_MQ } from './motion';
import { ScrollAnimationService } from './scroll-animation.service';

/**
 * Botão magnético (A24, initMagneticEffect): segue o ponteiro e volta com elastic.
 * Só em desktop com ponteiro fino. Elementos internos com `[data-magnetic-inner]` se movem um pouco mais.
 */
@Directive({ selector: '[appMagnetic]' })
export class MagneticDirective {
  /** Força em px/16 (padrão do clone: 25). */
  readonly magneticStrength = input(25);

  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(el, destroyRef, ({ gsap }) => {
        const mm = gsap.matchMedia();
        mm.add(`${DESKTOP_MQ} and ${POINTER_FINE_MQ}`, () => {
          const inners = el.querySelectorAll<HTMLElement>('[data-magnetic-inner]');
          const strength = this.magneticStrength();

          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const rx = (e.clientX - r.left) / r.width - 0.5;
            const ry = (e.clientY - r.top) / r.height - 0.5;
            gsap.to(el, {
              x: `${rx * (strength / 16)}em`,
              y: `${ry * (strength / 16)}em`,
              ease: 'power4.out',
              duration: 1.6,
            });
            gsap.to(inners, {
              x: `${rx * (strength / 10)}em`,
              y: `${ry * (strength / 10)}em`,
              ease: 'power4.out',
              duration: 2,
            });
          };
          const leave = () => {
            gsap.to([el, ...inners], { x: 0, y: 0, ease: 'elastic.out(1, 0.3)', duration: 1.6 });
          };

          el.addEventListener('pointermove', move);
          el.addEventListener('pointerleave', leave);
          return () => {
            el.removeEventListener('pointermove', move);
            el.removeEventListener('pointerleave', leave);
            gsap.set([el, ...inners], { clearProps: 'transform' });
          };
        });
        return () => mm.revert();
      });
    });
  }
}
