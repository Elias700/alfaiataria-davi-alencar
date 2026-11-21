import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { CTA_LABEL, FAQ } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';

/** Itens exibidos (e usados no JSON-LD FAQPage): só os confirmados. */
export const VISIBLE_FAQ = FAQ.items.filter((i) => i.confirmed);

/**
 * FAQ em acordeão (A30, initAccordion do clone): um item aberto por vez, ícone "+" gira,
 * a resposta entra com o reveal de linhas. A altura muda sem animação (só transform/opacity
 * animam) e os gatilhos de scroll são recalculados depois.
 */
@Component({
  selector: 'app-faq',
  imports: [AnchorDirective, RevealDirective, SplitTextDirective, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './faq.component.scss',
  template: `
    <section
      id="duvidas"
      class="faq section theme-light"
      data-bg="light"
      aria-labelledby="faq-title"
    >
      <div class="container faq__grid">
        <div class="faq__aside">
          <p class="eyebrow" appReveal="fade">{{ f.eyebrow }}</p>
          <h2 id="faq-title" class="h2" appSplitText="chars">{{ f.title }}</h2>
          <a class="btn btn--ghost faq__cta" appAnchor="#agendar" href="#agendar" appReveal="ctn">
            {{ ctaLabel }}
            <app-icon name="arrow-right" />
          </a>
        </div>

        <ul class="faq__list" role="list">
          @for (item of items; track item.question; let i = $index) {
            <li class="faq__item" [class.is-open]="open() === i" appReveal="ctn" [revealIndex]="i">
              <h3 class="faq__q">
                <button
                  type="button"
                  class="faq__btn"
                  [id]="'faq-q-' + i"
                  [attr.aria-expanded]="open() === i"
                  [attr.aria-controls]="'faq-a-' + i"
                  (click)="toggle(i)"
                >
                  <span>{{ item.question }}</span>
                  <span class="faq__icon" aria-hidden="true"><app-icon name="plus" /></span>
                </button>
              </h3>
              <div
                class="faq__a"
                role="region"
                [id]="'faq-a-' + i"
                [attr.aria-labelledby]="'faq-q-' + i"
                [hidden]="open() !== i"
              >
                <p>
                  <span>{{ item.answer }}</span>
                </p>
              </div>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class FaqComponent {
  private readonly anim = inject(ScrollAnimationService);
  protected readonly f = FAQ;
  protected readonly items = VISIBLE_FAQ;
  protected readonly ctaLabel = CTA_LABEL;
  protected readonly open = signal<number | null>(null);

  protected toggle(i: number): void {
    this.open.update((cur) => (cur === i ? null : i));
    requestAnimationFrame(() => this.anim.refresh());
  }
}
