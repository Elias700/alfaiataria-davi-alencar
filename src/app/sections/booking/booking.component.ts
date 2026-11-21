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
import { DomSanitizer } from '@angular/platform-browser';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { DESKTOP_MQ, DUR_S } from '../../core/animations/motion';
import { MagneticDirective } from '../../core/animations/magnetic.directive';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { ContactService, FormNotConfiguredError } from '../../core/contact/contact.service';
import { BOOKING, CONTACT, whatsappLink } from '../../core/data/site-content';
import { UiStateService } from '../../core/ui-state.service';
import { IconComponent } from '../../shared/icon/icon.component';

type Status = 'idle' | 'sending' | 'sent' | 'error' | 'not-configured';
type Field = 'name' | 'phone' | 'interest' | 'occasion' | 'eventDate' | 'message' | 'consent';

@Component({
  selector: 'app-booking',
  imports: [
    NgOptimizedImage,
    ReactiveFormsModule,
    AnchorDirective,
    MagneticDirective,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './booking.component.scss',
  templateUrl: './booking.component.html',
})
export class BookingComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly contact = inject(ContactService);
  protected readonly ui = inject(UiStateService);

  protected readonly b = BOOKING;
  protected readonly info = CONTACT;
  protected readonly whatsapp = whatsappLink();
  /** URL do mapa (TODO em site-content.ts), marcada como confiável por vir do próprio código. */
  protected readonly mapUrl = CONTACT.mapEmbedUrl
    ? inject(DomSanitizer).bypassSecurityTrustResourceUrl(CONTACT.mapEmbedUrl)
    : null;
  protected readonly today = new Date().toISOString().slice(0, 10);
  protected readonly status = signal<Status>('idle');
  protected readonly fallbackWhatsapp = signal<string | null>(null);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    phone: ['', [Validators.required, Validators.pattern(/^[\d\s()+-]{10,20}$/)]],
    interest: ['' as '' | 'terno' | 'camisa' | 'ambos', Validators.required],
    occasion: [''],
    eventDate: [''],
    message: ['', Validators.maxLength(1000)],
    consent: [false, Validators.requiredTrue],
  });

  private readonly formEl = viewChild.required<ElementRef<HTMLFormElement>>('formEl');
  private readonly band = viewChild.required<ElementRef<HTMLElement>>('band');
  private readonly bandImg = viewChild.required<ElementRef<HTMLElement>>('bandImg');
  private readonly bandContent = viewChild.required<ElementRef<HTMLElement>>('bandContent');
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  constructor() {
    const anim = inject(ScrollAnimationService);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      anim.scope(this.band().nativeElement, destroyRef, ({ gsap }) => {
        const band = this.band().nativeElement;
        const img = this.bandImg().nativeElement;
        const content = this.bandContent().nativeElement;
        const panel = this.panel().nativeElement;
        const desktop = window.matchMedia(DESKTOP_MQ).matches;

        // A20 ([data-footer-clip] do clone): a foto encolhe para uma moldura enquanto o título cresce.
        gsap
          .timeline({
            scrollTrigger: { trigger: band, start: 'top 30%', end: 'bottom bottom', scrub: 0.5 },
          })
          .fromTo(
            img,
            { clipPath: 'inset(0% 0% 0% 0%)' },
            { clipPath: desktop ? 'inset(8% 22% 8% 22%)' : 'inset(4% 6% 4% 6%)', ease: 'none' },
            0,
          )
          .fromTo(content, { scale: 0.85 }, { scale: 1, ease: 'none' }, 0);

        // A14 (.loc-info-w do clone): o painel do formulário cresce de .75 para 1 com opacidade.
        gsap.fromTo(
          panel,
          { opacity: 0, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            ease: 'none',
            scrollTrigger: { trigger: panel, start: 'top 95%', end: 'top 45%', scrub: 0.5 },
          },
        );
      });
    });
  }

  protected invalid(name: Field): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  /** Limpa caracteres inválidos do telefone enquanto digita (initForm do clone). */
  protected sanitizePhone(): void {
    const c = this.form.controls.phone;
    const clean = c.value.replace(/[^\d\s()+-]/g, '');
    if (clean !== c.value) c.setValue(clean);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      // Foco no primeiro campo inválido.
      setTimeout(
        () =>
          this.formEl().nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
        DUR_S,
      );
      return;
    }
    const v = this.form.getRawValue();
    const occasionLabel = this.b.occasions.find((o) => o.value === v.occasion)?.label ?? null;
    const request = {
      name: v.name.trim(),
      phone: v.phone.trim(),
      interest: v.interest as 'terno' | 'camisa' | 'ambos',
      occasion: occasionLabel,
      eventDate: v.eventDate || null,
      message: v.message.trim() || null,
      consent: true as const,
      consentAt: new Date().toISOString(),
    };

    this.status.set('sending');
    this.contact.send(request).subscribe({
      next: () => {
        this.status.set('sent');
        this.form.reset();
      },
      error: (err: unknown) => {
        if (err instanceof FormNotConfiguredError) {
          const link = whatsappLink(this.contact.toWhatsappText(request));
          this.fallbackWhatsapp.set(link);
          this.status.set('not-configured');
        } else {
          this.status.set('error');
        }
      },
    });
  }
}
