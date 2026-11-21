import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { OCCASIONS } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

/**
 * Ocasiões (A29, initCardParts do clone): em dispositivos com mouse, o texto e a linha do card
 * revelam no hover/foco; no toque, ficam sempre visíveis.
 * Só entram ocasiões confirmadas (site-content.ts). Sem fotos de ocasiões por enquanto: cards tipográficos.
 */
@Component({
  selector: 'app-occasions',
  imports: [AnchorDirective, RevealDirective, SplitTextDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './occasions.component.scss',
  template: `
    <section
      id="ocasioes"
      class="occasions section theme-light"
      data-bg="light"
      aria-labelledby="occasions-title"
    >
      <div class="container">
        <div class="section-head">
          <p class="eyebrow" appReveal="fade">{{ o.eyebrow }}</p>
          <h2 id="occasions-title" class="h2 section-title">
            <span appSplitText="chars">{{ o.title[0] }}</span>
            <span appSplitText="chars" [splitIndex]="2">{{ o.title[1] }}</span>
          </h2>
        </div>

        <ul class="occasions__grid" role="list">
          @for (item of items; track item.title; let i = $index) {
            <li class="card" tabindex="0" appReveal="ctn" [revealIndex]="i">
              <span class="card__num" aria-hidden="true">{{ roman[i] }}</span>
              <span class="monogram card__mark" aria-hidden="true"></span>
              <h3 class="h3 card__title">{{ item.title }}</h3>
              <span class="card__line" aria-hidden="true"></span>
              <p class="card__text">
                <span>{{ item.text }}</span>
              </p>
            </li>
          }
          <li class="card card--cta" appReveal="ctn" [revealIndex]="items.length">
            <span class="card__num" aria-hidden="true">{{ roman[items.length] }}</span>
            <h3 class="h3 card__title italic">{{ o.yours.title }}</h3>
            <span class="card__line" aria-hidden="true"></span>
            <p class="card__text">
              <span>{{ o.yours.text }}</span>
            </p>
            <a class="btn card__btn" appAnchor="#agendar" href="#agendar">
              Contar a minha
              <app-icon name="arrow-right" />
            </a>
          </li>
        </ul>
      </div>
    </section>
  `,
})
export class OccasionsComponent {
  protected readonly o = OCCASIONS;
  protected readonly items = OCCASIONS.items.filter((i) => i.confirmed);
  protected readonly roman = ['I', 'II', 'III', 'IV', 'V'];
}
