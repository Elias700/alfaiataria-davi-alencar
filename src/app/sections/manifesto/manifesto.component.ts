import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ParallaxDirective } from '../../core/animations/parallax.directive';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { WordSpreadDirective } from '../../core/animations/word-spread.directive';
import { MANIFESTO, PHOTOS } from '../../core/data/site-content';

@Component({
  selector: 'app-manifesto',
  imports: [
    NgOptimizedImage,
    ParallaxDirective,
    RevealDirective,
    SplitTextDirective,
    WordSpreadDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './manifesto.component.scss',
  template: `
    <section
      id="alfaiataria"
      class="manifesto section theme-light"
      data-bg="light"
      aria-labelledby="manifesto-title"
    >
      <div class="container">
        <p class="eyebrow" appReveal="fade">{{ m.eyebrow }}</p>
        <h2 id="manifesto-title" class="h2 manifesto__spread" appWordSpread>
          @for (w of m.spread; track $index; let i = $index) {
            <span data-word [class.italic]="i === 1">{{ w }}</span>{{ ' ' }}
          }
        </h2>

        <div class="manifesto__grid">
          <figure class="manifesto__figure">
            <div class="media manifesto__media">
              <img
                appParallax="img"
                [ngSrc]="photo.src"
                fill
                sizes="(min-width: 992px) 40vw, 90vw"
                [alt]="photo.alt"
              />
            </div>
            <figcaption class="label muted manifesto__caption" appReveal="fade">
              O ofício, de perto
            </figcaption>
          </figure>

          <div class="manifesto__body">
            <p class="lead manifesto__text" appSplitText="words-scrub">{{ m.text }}</p>

            <ul class="manifesto__pillars" role="list">
              @for (p of m.pillars; track p.title; let i = $index) {
                <li class="manifesto__pillar">
                  <span
                    class="manifesto__line"
                    appReveal="line-x"
                    [revealIndex]="i"
                    aria-hidden="true"
                  ></span>
                  <span class="label manifesto__num" aria-hidden="true">0{{ i + 1 }}</span>
                  <h3 class="h4 manifesto__pillar-title" appSplitText="chars" [splitIndex]="i">
                    {{ p.title }}
                  </h3>
                  <p class="muted" appSplitText="lines" [splitIndex]="i">{{ p.text }}</p>
                </li>
              }
            </ul>
          </div>

          <div class="media manifesto__detail" appParallax="ctn-up" aria-hidden="true">
            <img [ngSrc]="detail.src" fill sizes="(min-width: 992px) 18vw, 40vw" alt="" />
          </div>
        </div>
      </div>
    </section>
  `,
})
export class ManifestoComponent {
  protected readonly m = MANIFESTO;
  protected readonly photo = PHOTOS.daviScissors;
  protected readonly detail = PHOTOS.atelierGoldButtons;
}
