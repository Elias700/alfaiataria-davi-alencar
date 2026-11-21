import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { ImageMaskDirective } from '../../core/animations/image-mask.directive';
import { ImageZoomDirective } from '../../core/animations/image-zoom.directive';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { CTA_LABEL, SUITS } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { OptionTabsComponent } from '../../shared/option-tabs/option-tabs.component';

@Component({
  selector: 'app-suits',
  imports: [
    NgOptimizedImage,
    AnchorDirective,
    ImageMaskDirective,
    ImageZoomDirective,
    RevealDirective,
    SplitTextDirective,
    IconComponent,
    OptionTabsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './suits.component.scss',
  templateUrl: './suits.component.html',
  host: { '(document:keydown.escape)': 'openHotspot.set(null)' },
})
export class SuitsComponent {
  protected readonly s = SUITS;
  protected readonly ctaLabel = CTA_LABEL;
  /** Ponto aberto por toque/clique (no hover e no foco o CSS já mostra a dica). */
  protected readonly openHotspot = signal<number | null>(null);

  protected toggleHotspot(i: number): void {
    this.openHotspot.update((cur) => (cur === i ? null : i));
  }
}
