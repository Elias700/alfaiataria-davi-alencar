import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { FitTextDirective } from '../../core/animations/fit-text.directive';
import { SplitTextDirective } from '../../core/animations/split-text.directive';
import { BRAND, CONTACT, FOOTER, NAV, whatsappLink } from '../../core/data/site-content';
import { UiStateService } from '../../core/ui-state.service';
import { IconComponent } from '../icon/icon.component';
import { MarqueeComponent } from '../marquee/marquee.component';

@Component({
  selector: 'app-footer',
  imports: [AnchorDirective, FitTextDirective, SplitTextDirective, IconComponent, MarqueeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './footer.component.scss',
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  protected readonly ui = inject(UiStateService);
  protected readonly brand = BRAND;
  protected readonly contact = CONTACT;
  protected readonly footer = FOOTER;
  protected readonly nav = NAV;
  protected readonly whatsapp = whatsappLink();
  protected readonly year = new Date().getFullYear();
  protected readonly phoneHref = CONTACT.phoneDisplay
    ? 'tel:' + CONTACT.phoneDisplay.replace(/[^\d+]/g, '')
    : null;
}
