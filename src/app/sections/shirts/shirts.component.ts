import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { ImageMaskDirective } from '../../core/animations/image-mask.directive';
import { ImageZoomDirective } from '../../core/animations/image-zoom.directive';
import { DESKTOP_MQ, DUR_L, MOBILE_MQ } from '../../core/animations/motion';
import { RevealDirective } from '../../core/animations/reveal.directive';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { CTA_LABEL, SHIRTS } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { OptionTabsComponent } from '../../shared/option-tabs/option-tabs.component';

@Component({
  selector: 'app-shirts',
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
  styleUrl: './shirts.component.scss',
  templateUrl: './shirts.component.html',
})
export class ShirtsComponent {
  protected readonly s = SHIRTS;
  protected readonly ctaLabel = CTA_LABEL;

  private readonly intro = viewChild.required<ElementRef<HTMLElement>>('intro');
  private readonly win = viewChild.required<ElementRef<HTMLElement>>('win');
  private readonly winImg = viewChild.required<ElementRef<HTMLElement>>('winImg');
  private readonly t1 = viewChild.required<ElementRef<HTMLElement>>('t1');
  private readonly t2 = viewChild.required<ElementRef<HTMLElement>>('t2');
  private readonly caption = viewChild.required<ElementRef<HTMLElement>>('caption');

  constructor() {
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(this.intro().nativeElement, destroyRef, ({ gsap }) => {
        const intro = this.intro().nativeElement;
        const win = this.win().nativeElement;
        const img = this.winImg().nativeElement;
        const t1 = this.t1().nativeElement;
        const t2 = this.t2().nativeElement;
        const caption = this.caption().nativeElement;
        const mm = gsap.matchMedia();

        /**
         * A19 (.arch-scroll-area do clone): a "janela" abre de um retângulo central até a tela
         * inteira, as linhas do título se afastam para os lados e a legenda entra no fim.
         */
        mm.add(DESKTOP_MQ, () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: intro,
                start: 'top top',
                end: 'bottom bottom',
                scrub: true,
              },
            })
            .fromTo(
              win,
              { clipPath: 'inset(24% 35% 24% 35%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', ease: 'InOut', duration: 0.6 },
              0,
            )
            .fromTo(img, { scale: 1.15 }, { scale: 1, ease: 'InOut', duration: 0.6 }, 0)
            .fromTo(
              t1,
              { xPercent: 0, opacity: 1 },
              { xPercent: -35, opacity: 0, ease: 'In', duration: 0.45 },
              0.05,
            )
            .fromTo(
              t2,
              { xPercent: 0, opacity: 1 },
              { xPercent: 35, opacity: 0, ease: 'In', duration: 0.45 },
              0.05,
            )
            .fromTo(
              caption,
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, ease: 'Out', duration: 0.2 },
              0.6,
            )
            .to(img, { yPercent: 6, ease: 'none', duration: 0.2 }, 0.8);
        });

        // Mobile: máscara diagonal simples (A8) na foto.
        mm.add(MOBILE_MQ, () => {
          if (!anim.animateReveals) return;
          gsap
            .timeline({
              scrollTrigger: { trigger: win, start: 'top 85%', once: true },
              defaults: { duration: DUR_L * 1.2, ease: 'InOut' },
            })
            .fromTo(
              win,
              { clipPath: 'polygon(100% 0%, 100% 0%, 101% 100%, 125% 100%)' },
              { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
            )
            .fromTo(img, { scale: 1.5, xPercent: 25 }, { scale: 1, xPercent: 0 }, 0);
        });
        return () => mm.revert();
      });
    });
  }
}
