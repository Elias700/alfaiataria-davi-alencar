import { isPlatformServer } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  input,
} from '@angular/core';

/**
 * Texto com hover de letras (A25 initNavItemHover e A26 initLinkHover do clone), em CSS puro:
 * - `roll`: as letras sobem e uma cópia entra por baixo, com stagger por posição.
 * - `flip`: as letras giram no eixo Y e a cópia entra girando.
 * O texto real fica num span acessível; as letras animadas são aria-hidden.
 * O hover é disparado pelo elemento pai com a classe `roll-trigger` (link ou botão).
 *
 * No SSR sai só o texto (HTML enxuto e sem letras duplicadas para os buscadores); as letras
 * são montadas no cliente (ngSkipHydration).
 */
@Component({
  selector: 'app-roll-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    ngSkipHydration: 'true',
    class: 'roll',
    '[class.roll--flip]': 'variant() === "flip"',
    '[style.--n]': 'chars().length',
  },
  template: `
    @if (isServer) {
      <span class="roll__rows"
        ><span class="roll__row">{{ text() }}</span></span
      >
    } @else {
      <span class="visually-hidden">{{ text() }}</span>
      <span class="roll__rows" aria-hidden="true">
        <span class="roll__row">
          @for (c of chars(); track $index) {
            <span class="roll__char" [style.--i]="$index">{{ c }}</span>
          }
        </span>
        <span class="roll__row roll__row--clone">
          @for (c of chars(); track $index) {
            <span class="roll__char" [style.--i]="$index">{{ c }}</span>
          }
        </span>
      </span>
    }
  `,
})
export class RollTextComponent {
  readonly text = input.required<string>();
  readonly variant = input<'roll' | 'flip'>('roll');
  protected readonly isServer = isPlatformServer(inject(PLATFORM_ID));
  protected readonly chars = computed(() => Array.from(this.text()));
}
