import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import type { Photo } from '../../core/data/site-content';
import { IconComponent } from '../icon/icon.component';

/**
 * Lightbox com zoom (A37, initLightbox + initImageZoom do clone).
 * - abre com scale .5 → 1; prev/next desliza a foto; contador e barra de progresso;
 * - clique/toque na foto alterna zoom 2.5× a partir do ponto clicado; no desktop o zoom acompanha o ponteiro;
 * - <dialog> nativo: Esc fecha, foco preso, setas navegam.
 */
@Component({
  selector: 'app-lightbox',
  imports: [NgOptimizedImage, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './lightbox.component.scss',
  template: `
    <dialog
      #dialog
      class="lightbox"
      aria-label="Galeria ampliada"
      (cancel)="$event.preventDefault(); close()"
      (keydown)="onKey($event)"
      (close)="onClosed()"
    >
      @if (isOpen()) {
        <div class="lightbox__top">
          <p class="label lightbox__count" aria-live="polite">
            {{ pad(index() + 1) }} / {{ pad(photos().length) }}
            <span class="visually-hidden">: {{ current().alt }}</span>
          </p>
          <span class="lightbox__progress" aria-hidden="true"
            ><span [style.transform]="'scaleX(' + (index() + 1) / photos().length + ')'"></span
          ></span>
          <button type="button" class="lightbox__btn" (click)="close()" aria-label="Fechar galeria">
            <app-icon name="close" />
          </button>
        </div>

        <div class="lightbox__stage">
          @for (p of [current()]; track p.src) {
            <button
              type="button"
              class="lightbox__frame"
              [class.is-zoomed]="zoomed()"
              [style.--ox]="origin().x + '%'"
              [style.--oy]="origin().y + '%'"
              [style.--dir]="direction()"
              [style.--from-scale]="direction() === 0 ? 0.5 : 1"
              [attr.aria-label]="zoomed() ? 'Reduzir zoom' : 'Ampliar zoom'"
              [attr.aria-pressed]="zoomed()"
              (click)="toggleZoom($event)"
              (pointermove)="pan($event)"
            >
              <img
                [ngSrc]="p.src"
                [width]="p.width"
                [height]="p.height"
                sizes="(min-width: 992px) 70vw, 100vw"
                [alt]="p.alt"
              />
            </button>
          }
        </div>

        <div class="lightbox__nav">
          <button type="button" class="lightbox__btn" (click)="go(-1)" aria-label="Foto anterior">
            <app-icon name="arrow-left" />
          </button>
          <button type="button" class="lightbox__btn" (click)="go(1)" aria-label="Próxima foto">
            <app-icon name="arrow-right" />
          </button>
        </div>
      }
    </dialog>
  `,
})
export class LightboxComponent {
  private readonly anim = inject(ScrollAnimationService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  readonly photos = input.required<readonly Photo[]>();

  protected readonly isOpen = signal(false);
  protected readonly index = signal(0);
  protected readonly zoomed = signal(false);
  protected readonly origin = signal({ x: 50, y: 50 });
  protected readonly direction = signal(0);
  protected readonly current = computed(() => this.photos()[this.index()]);
  private opener: HTMLElement | null = null;

  open(i: number): void {
    this.opener = document.activeElement as HTMLElement | null;
    this.index.set(i);
    this.direction.set(0);
    this.zoomed.set(false);
    this.isOpen.set(true);
    this.dialog().nativeElement.showModal();
    this.anim.lock();
  }

  close(): void {
    this.dialog().nativeElement.close();
  }

  protected onClosed(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.anim.unlock();
    this.opener?.focus();
  }

  protected go(step: number): void {
    const n = this.photos().length;
    this.zoomed.set(false);
    this.direction.set(step);
    this.index.update((i) => (i + step + n) % n);
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') this.go(-1);
    else if (event.key === 'ArrowRight') this.go(1);
  }

  protected toggleZoom(event: MouseEvent): void {
    if (!this.zoomed()) this.setOrigin(event);
    this.zoomed.update((z) => !z);
  }

  protected pan(event: PointerEvent): void {
    if (this.zoomed() && event.pointerType === 'mouse') this.setOrigin(event);
  }

  protected pad(n: number): string {
    return n.toString().padStart(2, '0');
  }

  private setOrigin(event: MouseEvent): void {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    // Clique por teclado (sem coordenadas): zoom no centro.
    if (event.clientX === 0 && event.clientY === 0) {
      this.origin.set({ x: 50, y: 50 });
      return;
    }
    this.origin.set({
      x: Math.min(100, Math.max(0, ((event.clientX - r.left) / r.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - r.top) / r.height) * 100)),
    });
  }
}
