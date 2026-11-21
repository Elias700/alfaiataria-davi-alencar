import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  NgZone,
  afterNextRender,
  inject,
  isDevMode,
  signal,
} from '@angular/core';

import { MagneticDirective } from '../../core/animations/magnetic.directive';
import { whatsappLink } from '../../core/data/site-content';
import { UiStateService } from '../../core/ui-state.service';
import { IconComponent } from '../icon/icon.component';

/**
 * Botão flutuante de WhatsApp: discreto, aparece depois do hero (entrada do A6 do clone),
 * magnético no desktop.
 * Enquanto o número não for informado (TODO em site-content.ts), só aparece em desenvolvimento,
 * apontando para o formulário, para não publicar um botão quebrado.
 */
@Component({
  selector: 'app-whatsapp-fab',
  imports: [IconComponent, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './whatsapp-fab.component.scss',
  template: `
    @if (href) {
      <a
        class="fab"
        [class.is-visible]="visible() && !ui.menuOpen()"
        [href]="href"
        [attr.target]="external ? '_blank' : null"
        [attr.rel]="external ? 'noopener' : null"
        [attr.title]="external ? null : 'TODO: informar o número do WhatsApp em site-content.ts'"
        aria-label="Conversar pelo WhatsApp"
        appMagnetic
        [magneticStrength]="18"
      >
        <app-icon name="whatsapp" data-magnetic-inner />
      </a>
    }
  `,
})
export class WhatsappFabComponent {
  protected readonly ui = inject(UiStateService);
  protected readonly visible = signal(false);
  private readonly link = whatsappLink();
  protected readonly external = this.link !== null;
  protected readonly href = this.link ?? (isDevMode() ? '#agendar' : null);

  constructor() {
    const zone = inject(NgZone);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const hero = document.getElementById('inicio');
      if (!hero) return;
      zone.runOutsideAngular(() => {
        const io = new IntersectionObserver(([entry]) => this.visible.set(!entry.isIntersecting), {
          rootMargin: '0px 0px -40% 0px',
        });
        io.observe(hero);
        destroyRef.onDestroy(() => io.disconnect());
      });
    });
  }
}
