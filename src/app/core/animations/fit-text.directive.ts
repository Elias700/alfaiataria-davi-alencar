import { DestroyRef, Directive, ElementRef, NgZone, afterNextRender, inject } from '@angular/core';

/**
 * Texto que ocupa exatamente a largura do pai (A39, fitText do clone).
 * O CSS deve definir um font-size aproximado em vw para o SSR, evitando salto de layout.
 */
@Directive({ selector: '[appFitText]' })
export class FitTextDirective {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const parent = el.parentElement;
      if (!parent) return;

      const fit = () => {
        el.style.fontSize = '';
        el.style.whiteSpace = 'nowrap';
        el.style.width = 'max-content';
        const available =
          parent.clientWidth -
          parseFloat(getComputedStyle(parent).paddingLeft) -
          parseFloat(getComputedStyle(parent).paddingRight);
        const current = el.offsetWidth;
        const size = parseFloat(getComputedStyle(el).fontSize);
        el.style.width = '';
        if (current > 0) el.style.fontSize = `${(size * available) / current}px`;
      };

      zone.runOutsideAngular(() => {
        let lastWidth = 0;
        let frame = 0;
        // O ajuste roda no próximo frame para não alterar o layout dentro do callback
        // (evita o erro "ResizeObserver loop completed with undelivered notifications").
        const ro = new ResizeObserver(([entry]) => {
          const w = Math.round(entry.contentRect.width);
          if (w === lastWidth) return;
          lastWidth = w;
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(fit);
        });
        ro.observe(parent);
        document.fonts?.ready.then(fit);
        destroyRef.onDestroy(() => ro.disconnect());
      });
    });
  }
}
