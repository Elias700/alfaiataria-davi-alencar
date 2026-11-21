import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { DESKTOP_MQ, MOBILE_MQ } from '../../core/animations/motion';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { CTA_LABEL, HERO } from '../../core/data/site-content';
import { CircleCtaComponent } from '../../shared/circle-cta/circle-cta.component';
import { IconComponent } from '../../shared/icon/icon.component';

type HeroTab = (typeof HERO.tabs)[number]['id'];

@Component({
  selector: 'app-hero',
  imports: [NgOptimizedImage, AnchorDirective, CircleCtaComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './hero.component.scss',
  templateUrl: './hero.component.html',
})
export class HeroComponent {
  protected readonly hero = HERO;
  protected readonly ctaLabel = CTA_LABEL;
  protected readonly active = signal<HeroTab>('ternos');
  /** Título display em linhas → palavras → letras, com índice global para o stagger. */
  protected readonly displayLines = (() => {
    let i = 0;
    return HERO.display.map((line) =>
      line.split(' ').map((w) => Array.from(w).map((c) => ({ c, i: i++ }))),
    );
  })();

  private readonly area = viewChild.required<ElementRef<HTMLElement>>('area');
  private readonly bg = viewChild.required<ElementRef<HTMLElement>>('bg');
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');
  private readonly overlay = viewChild.required<ElementRef<HTMLElement>>('overlay');

  constructor() {
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    /**
     * Fluxo do hero (A10, initTranistionFlow › hero do clone): enquanto a área alta rola,
     * o conteúdo sobe e some e a foto dá zoom (origin 50% 75%). No mobile, só o zoom.
     */
    afterNextRender(() => {
      anim.scope(this.area().nativeElement, destroyRef, ({ gsap }) => {
        const area = this.area().nativeElement;
        const bg = this.bg().nativeElement;
        const content = this.content().nativeElement;
        const overlay = this.overlay().nativeElement;
        const mm = gsap.matchMedia();
        const scrollTrigger = { trigger: area, start: 'top top', end: 'bottom top', scrub: true };

        mm.add(DESKTOP_MQ, () => {
          gsap
            .timeline({ scrollTrigger })
            .fromTo(
              content,
              { y: 0, opacity: 1 },
              { y: () => -window.innerHeight * 0.25, opacity: 0, ease: 'Ease', duration: 0.55 },
            )
            .fromTo(
              bg,
              { scale: 1, transformOrigin: '50% 75%' },
              { scale: 1.5, ease: 'In', duration: 0.6 },
              0.1,
            )
            .fromTo(overlay, { opacity: 1 }, { opacity: 0.4, ease: 'none', duration: 0.6 }, 0.1);
        });
        mm.add(MOBILE_MQ, () => {
          gsap.fromTo(
            bg,
            { scale: 1, transformOrigin: '50% 75%' },
            { scale: 1.3, ease: 'In', scrollTrigger },
          );
        });
        return () => mm.revert();
      });
    });
  }

  protected select(tab: HeroTab): void {
    this.active.set(tab);
  }
}
