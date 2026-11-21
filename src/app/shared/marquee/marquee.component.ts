import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { IconComponent } from '../icon/icon.component';

/**
 * Faixa de texto infinita (A38, [data-marquee-css] do clone): CSS puro,
 * translateX(-50%) → 0 em 32s linear, invertido. Duas cópias da lista; a segunda é aria-hidden.
 * Tem botão de pausa (WCAG 2.2.2) e para com prefers-reduced-motion.
 */
@Component({
  selector: 'app-marquee',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './marquee.component.scss',
  host: { '[class.is-paused]': 'paused()', '[style.--duration]': 'duration() + "s"' },
  template: `
    <div class="marquee" [attr.aria-label]="label()" role="group">
      <div class="marquee__track">
        @for (copy of [0, 1]; track copy) {
          <ul class="marquee__list" role="list" [attr.aria-hidden]="copy === 1 ? 'true' : null">
            @for (item of items(); track $index) {
              <li class="marquee__item">
                <span>{{ item }}</span>
                <span class="marquee__sep" aria-hidden="true"></span>
              </li>
            }
          </ul>
        }
      </div>
    </div>
    <button
      type="button"
      class="marquee__toggle"
      (click)="paused.set(!paused())"
      [attr.aria-label]="paused() ? 'Retomar animação do letreiro' : 'Pausar animação do letreiro'"
    >
      <app-icon [name]="paused() ? 'play' : 'pause'" />
    </button>
  `,
})
export class MarqueeComponent {
  readonly items = input.required<readonly string[]>();
  readonly label = input('Letreiro');
  readonly duration = input(32);
  protected readonly paused = signal(false);
}
