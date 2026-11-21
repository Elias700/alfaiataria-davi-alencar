import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ImageMaskDirective } from '../../core/animations/image-mask.directive';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { FABRICS } from '../../core/data/site-content';
import { MarqueeComponent } from '../../shared/marquee/marquee.component';

@Component({
  selector: 'app-fabrics',
  imports: [
    NgOptimizedImage,
    ImageMaskDirective,
    RevealDirective,
    SplitTextDirective,
    MarqueeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './fabrics.component.scss',
  template: `
    <section
      id="tecidos"
      class="fabrics section theme-light"
      data-bg="light"
      aria-labelledby="fabrics-title"
    >
      <div class="container">
        <div class="fabrics__head">
          <div class="section-head">
            <p class="eyebrow" appReveal="fade">{{ f.eyebrow }}</p>
            <h2 id="fabrics-title" class="h2 section-title">
              <span appSplitText="chars">{{ f.title[0] }}</span>
              <span appSplitText="chars" [splitIndex]="2">{{ f.title[1] }}</span>
            </h2>
          </div>
          <p class="lead muted fabrics__text" appSplitText="lines" [splitDelay]="0.2">
            {{ f.text }}
          </p>
        </div>

        <ul class="fabrics__grid" role="list">
          @for (t of f.textures; track t.label; let i = $index) {
            <li class="texture">
              <div class="media texture__media" appImageMask [maskDelay]="i * 0.12">
                <div class="texture__zoom">
                  <img
                    [ngSrc]="t.photo.src"
                    fill
                    [sizes]="'(min-width: 768px) ' + 30 * t.zoom + 'vw, ' + 92 * t.zoom + 'vw'"
                    [alt]="'Textura: ' + t.label"
                    [style.object-position]="t.position"
                    [style.transform-origin]="t.position"
                    [style.transform]="'scale(' + t.zoom + ')'"
                  />
                </div>
              </div>
              <p class="label texture__label" appReveal="fade" [revealIndex]="i + 2">
                <span class="texture__num" aria-hidden="true">0{{ i + 1 }}</span
                >{{ t.label }}
              </p>
            </li>
          }
        </ul>
      </div>

      <app-marquee class="fabrics__marquee" [items]="f.marquee" label="Termos do ofício" />
    </section>
  `,
})
export class FabricsComponent {
  protected readonly f = FABRICS;
}
