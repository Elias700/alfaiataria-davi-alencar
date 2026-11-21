import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { DESKTOP_MQ } from '../../core/animations/motion';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { ThemeTargetDirective } from '../../core/animations/theme-target.directive';
import { IconComponent } from '../icon/icon.component';

/**
 * Trilho lateral de progresso (A22 initScrollBar + A21 .s-down do clone), só no desktop.
 * Contador 00–100, linha que se preenche e indicador "Role" que some perto do fim.
 * Decorativo: aria-hidden (a página já tem rolagem nativa).
 */
@Component({
  selector: 'app-scroll-progress',
  imports: [ThemeTargetDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styleUrl: './scroll-progress.component.scss',
  template: `
    <div #rail class="rail" appThemeTarget="dark">
      <span #count class="rail__count">00</span>
      <span class="rail__track"><span #fill class="rail__fill"></span></span>
      <span #hint class="rail__hint">
        <span class="rail__label">Role</span>
        <app-icon name="arrow-down" />
      </span>
    </div>
  `,
})
export class ScrollProgressComponent {
  private readonly rail = viewChild.required<ElementRef<HTMLElement>>('rail');
  private readonly count = viewChild.required<ElementRef<HTMLElement>>('count');
  private readonly fill = viewChild.required<ElementRef<HTMLElement>>('fill');
  private readonly hint = viewChild.required<ElementRef<HTMLElement>>('hint');

  constructor() {
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(this.rail().nativeElement, destroyRef, ({ gsap, ScrollTrigger }) => {
        const mm = gsap.matchMedia();
        mm.add(DESKTOP_MQ, () => {
          const count = this.count().nativeElement;
          const fill = this.fill().nativeElement;
          const hint = this.hint().nativeElement;
          let last = -1;
          ScrollTrigger.create({
            start: 0,
            end: 'max',
            onUpdate: (self) => {
              gsap.set(fill, { scaleY: self.progress });
              const pct = Math.round(self.progress * 100);
              if (pct !== last) {
                last = pct;
                count.textContent = String(pct).padStart(2, '0');
              }
              hint.style.opacity = self.progress > 0.94 ? '0' : '';
            },
          });
        });
        return () => mm.revert();
      });
    });
  }
}
