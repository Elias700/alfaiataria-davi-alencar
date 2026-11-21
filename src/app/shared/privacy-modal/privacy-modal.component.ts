import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterRenderEffect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { BRAND, PRIVACY } from '../../core/data/site-content';
import { UiStateService } from '../../core/ui-state.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Política de Privacidade em modal (A34 initModalCta do clone: o cartão entra girando em 3D).
 * Usa <dialog> nativo: foco preso, Esc fecha e o conteúdo atrás fica inerte.
 * O conteúdo rola com scroll nativo (data-lenis-prevent) em vez de um Lenis local.
 */
@Component({
  selector: 'app-privacy-modal',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './privacy-modal.component.scss',
  template: `
    <dialog
      #dialog
      class="modal theme-light"
      [class.is-closing]="closing()"
      aria-labelledby="privacy-title"
      (cancel)="$event.preventDefault(); close()"
      (click)="onBackdrop($event)"
      (animationend)="onAnimationEnd($event)"
    >
      <div class="modal__card" data-lenis-prevent>
        <header class="modal__head">
          <h2 id="privacy-title" class="h3">{{ privacy.title }}</h2>
          <button
            type="button"
            class="modal__close"
            (click)="close()"
            aria-label="Fechar política de privacidade"
          >
            <app-icon name="close" />
          </button>
        </header>
        <div class="modal__body">
          <p class="small muted">
            {{ brand.name }}{{ privacy.updatedAt ? ' · Atualizada em ' + privacy.updatedAt : '' }}
          </p>
          @for (section of privacy.sections; track section.heading) {
            <section [id]="'privacidade-' + slug(section.heading)">
              <h3 class="h4">{{ section.heading }}</h3>
              @for (p of section.body; track $index) {
                <p>{{ p }}</p>
              }
            </section>
          }
        </div>
      </div>
    </dialog>
  `,
})
export class PrivacyModalComponent {
  private readonly ui = inject(UiStateService);
  private readonly anim = inject(ScrollAnimationService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly privacy = PRIVACY;
  protected readonly brand = BRAND;
  protected readonly closing = signal(false);
  private opener: HTMLElement | null = null;

  constructor() {
    afterRenderEffect(() => {
      const open = this.ui.privacyOpen();
      untracked(() => (open ? this.show() : this.close()));
    });
  }

  protected slug(text: string): string {
    return text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
  }

  private show(): void {
    const dlg = this.dialog().nativeElement;
    if (dlg.open) return;
    this.opener = document.activeElement as HTMLElement | null;
    this.closing.set(false);
    dlg.showModal();
    this.anim.lock();
    const section = this.ui.privacySection();
    if (section) {
      dlg.querySelector(`#privacidade-${section}`)?.scrollIntoView({ block: 'start' });
    }
  }

  protected close(): void {
    if (typeof document === 'undefined') return;
    const dlg = this.dialog().nativeElement;
    if (!dlg.open || this.closing()) return;
    if (this.anim.reducedMotion()) {
      this.finishClose();
      return;
    }
    this.closing.set(true);
  }

  protected onBackdrop(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) this.close();
  }

  protected onAnimationEnd(event: AnimationEvent): void {
    if (this.closing() && event.animationName.includes('modal-out')) this.finishClose();
  }

  private finishClose(): void {
    const dlg = this.dialog().nativeElement;
    dlg.close();
    this.closing.set(false);
    this.anim.unlock();
    this.ui.privacyOpen.set(false);
    this.opener?.focus();
  }
}
