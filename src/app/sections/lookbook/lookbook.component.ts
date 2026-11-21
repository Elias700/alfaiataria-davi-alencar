import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { RevealDirective } from '../../core/animations/reveal.directive';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { LOOKBOOK } from '../../core/data/site-content';
import { IconComponent } from '../../shared/icon/icon.component';
import { LightboxComponent } from '../../shared/lightbox/lightbox.component';

/**
 * Lookbook (A31, initSlider do clone): autoplay de 6s só com ≥ 20% do slider visível e a aba
 * ativa; barra de progresso linear; a foto nova entra com a máscara diagonal (A8) e os textos
 * com os reveals do clone. Pausa no hover/foco e por botão (WCAG 2.2.2).
 * A barra de progresso é uma animação CSS: o fim dela (animationend) avança o slide.
 */
@Component({
  selector: 'app-lookbook',
  imports: [
    NgOptimizedImage,
    RevealDirective,
    SplitTextDirective,
    IconComponent,
    LightboxComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './lookbook.component.scss',
  templateUrl: './lookbook.component.html',
})
export class LookbookComponent {
  private readonly anim = inject(ScrollAnimationService);
  protected readonly l = LOOKBOOK;
  protected readonly photos = LOOKBOOK.slides.map((s) => s.photo);

  protected readonly active = signal(0);
  protected readonly prev = signal<number | null>(null);
  protected readonly userPaused = signal(false);
  private readonly inView = signal(false);
  private readonly hovering = signal(false);
  private readonly pageVisible = signal(true);

  protected readonly playing = computed(
    () =>
      !this.userPaused() &&
      this.inView() &&
      !this.hovering() &&
      this.pageVisible() &&
      !this.anim.reducedMotion(),
  );
  protected readonly current = computed(() => [this.l.slides[this.active()]]);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly lightbox = viewChild.required(LightboxComponent);

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (this.anim.reducedMotion()) this.userPaused.set(true);
      zone.runOutsideAngular(() => {
        const io = new IntersectionObserver(([e]) => this.inView.set(e.isIntersecting), {
          threshold: 0.2,
        });
        io.observe(this.root().nativeElement);
        const onVis = () => this.pageVisible.set(!document.hidden);
        document.addEventListener('visibilitychange', onVis);
        destroyRef.onDestroy(() => {
          io.disconnect();
          document.removeEventListener('visibilitychange', onVis);
        });
      });
    });
  }

  protected go(step: number): void {
    const n = this.l.slides.length;
    this.prev.set(this.active());
    this.active.update((i) => (i + step + n) % n);
  }

  protected onProgressEnd(): void {
    if (this.playing()) this.go(1);
  }

  protected setHover(value: boolean): void {
    this.hovering.set(value);
  }

  protected onFocusOut(event: FocusEvent): void {
    const root = this.root().nativeElement;
    if (!root.contains(event.relatedTarget as Node | null)) this.hovering.set(false);
  }

  protected openLightbox(): void {
    this.lightbox().open(this.active());
  }

  protected pad(n: number): string {
    return n.toString().padStart(2, '0');
  }
}
