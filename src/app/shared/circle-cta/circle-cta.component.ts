import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { MagneticDirective } from '../../core/animations/magnetic.directive';

const R = 103.5;
const C = 2 * Math.PI * R;

/**
 * CTA circular (A27 initBtnCircleHover + A24 magnético).
 * Dois arcos no contorno crescem de ~4% para 50% da circunferência no hover.
 */
@Component({
  selector: 'app-circle-cta',
  imports: [AnchorDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './circle-cta.component.scss',
  template: `
    <a class="circle-cta" [appAnchor]="href()" [href]="href()" appMagnetic [magneticStrength]="20">
      <svg viewBox="0 0 214 214" aria-hidden="true" focusable="false">
        <circle class="circle-cta__base" cx="107" cy="107" [attr.r]="r" />
        <circle class="circle-cta__arc" cx="107" cy="107" [attr.r]="r" [style.--c]="c" />
        <circle
          class="circle-cta__arc circle-cta__arc--b"
          cx="107"
          cy="107"
          [attr.r]="r"
          [style.--c]="c"
        />
      </svg>
      <span class="circle-cta__label" data-magnetic-inner>{{ label() }}</span>
    </a>
  `,
})
export class CircleCtaComponent {
  readonly label = input.required<string>();
  readonly href = input.required<string>();
  protected readonly r = R;
  protected readonly c = C;
}
