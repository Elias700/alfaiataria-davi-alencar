import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AnchorDirective } from './core/animations/anchor.directive';
import { SeoService } from './core/seo/seo.service';
import { BookingComponent } from './sections/booking/booking.component';
import { FabricsComponent } from './sections/fabrics/fabrics.component';
import { FaqComponent } from './sections/faq/faq.component';
import { HeroComponent } from './sections/hero/hero.component';
import { LookbookComponent } from './sections/lookbook/lookbook.component';
import { ManifestoComponent } from './sections/manifesto/manifesto.component';
import { OccasionsComponent } from './sections/occasions/occasions.component';
import { ProcessComponent } from './sections/process/process.component';
import { ShirtsComponent } from './sections/shirts/shirts.component';
import { SuitsComponent } from './sections/suits/suits.component';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { LoaderComponent } from './shared/loader/loader.component';
import { PrivacyModalComponent } from './shared/privacy-modal/privacy-modal.component';
import { ScrollProgressComponent } from './shared/scroll-progress/scroll-progress.component';
import { WhatsappFabComponent } from './shared/whatsapp-fab/whatsapp-fab.component';

@Component({
  selector: 'app-root',
  imports: [
    AnchorDirective,
    LoaderComponent,
    HeaderComponent,
    ScrollProgressComponent,
    HeroComponent,
    ManifestoComponent,
    SuitsComponent,
    ShirtsComponent,
    ProcessComponent,
    FabricsComponent,
    LookbookComponent,
    OccasionsComponent,
    FaqComponent,
    BookingComponent,
    FooterComponent,
    WhatsappFabComponent,
    PrivacyModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" appAnchor="#conteudo" href="#conteudo">Pular para o conteúdo</a>
    <app-loader />
    <app-header />
    <app-scroll-progress />

    <main id="conteudo" tabindex="-1">
      <app-hero />
      <app-manifesto />
      <app-suits />
      <app-shirts />
      <app-process />
      <app-fabrics />
      <!-- Hidratação incremental: o HTML vem completo do SSR; o JS da seção (lightbox, formulário)
           só é baixado quando ela se aproxima da tela. -->
      @defer (hydrate on viewport) {
        <app-lookbook />
      }
      <app-occasions />
      <app-faq />
      @defer (hydrate on viewport) {
        <app-booking />
      }
    </main>

    <app-footer />
    <app-whatsapp-fab />
    <app-privacy-modal />
  `,
  styles: `
    main:focus {
      outline: none;
    }
  `,
})
export class AppComponent {
  constructor() {
    inject(SeoService).apply();
  }
}
