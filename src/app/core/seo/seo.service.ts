import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { BRAND } from '../data/site-content';
import { buildJsonLd } from './json-ld';

const DESCRIPTION =
  'Ternos e camisas sob medida na Alfaiataria Davi Alencar: caimento exato, tecidos selecionados e acabamento artesanal. Agende seu atendimento.';

/**
 * Metatags e dados estruturados (AGENTS.md §7). Roda no SSR/prerender, então tudo sai no HTML estático.
 * Campos que dependem do domínio (canonical, URLs absolutas) entram quando BRAND.siteUrl for definido.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(): void {
    const city = BRAND.city;
    const pageTitle = city
      ? `Alfaiataria Davi Alencar | Ternos Sob Medida em ${city}`
      : 'Alfaiataria Davi Alencar | Ternos e Camisas Sob Medida';
    const base = BRAND.siteUrl ?? '';
    const ogImage = `${base}/og-image.jpg`;

    this.title.setTitle(pageTitle);

    const tags: { name?: string; property?: string; content: string }[] = [
      { name: 'description', content: DESCRIPTION },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { name: 'theme-color', content: '#040b25' },
      { name: 'author', content: BRAND.name },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:site_name', content: BRAND.name },
      { property: 'og:title', content: pageTitle },
      { property: 'og:description', content: DESCRIPTION },
      { property: 'og:image', content: ogImage },
      { property: 'og:image:type', content: 'image/jpeg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      {
        property: 'og:image:alt',
        content:
          'Monograma DA dourado da Alfaiataria Davi Alencar ao lado de Davi Alencar de terno azul-marinho sob medida no ateliê',
      },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: pageTitle },
      { name: 'twitter:description', content: DESCRIPTION },
      { name: 'twitter:image', content: ogImage },
    ];
    if (BRAND.siteUrl) tags.push({ property: 'og:url', content: `${BRAND.siteUrl}/` });

    for (const tag of tags) {
      const selector = tag.name ? `name="${tag.name}"` : `property="${tag.property}"`;
      this.meta.updateTag(tag, selector);
    }

    if (BRAND.siteUrl) this.setCanonical(`${BRAND.siteUrl}/`);
    this.setJsonLd(buildJsonLd());
  }

  private setCanonical(href: string): void {
    const head = this.document.head;
    let link = head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private setJsonLd(data: object): void {
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>('script#ld-json');
    if (!script) {
      script = this.document.createElement('script');
      script.id = 'ld-json';
      script.type = 'application/ld+json';
      head.appendChild(script);
    }
    // Escapa "<" para o JSON nunca fechar a tag <script>.
    script.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
  }
}
