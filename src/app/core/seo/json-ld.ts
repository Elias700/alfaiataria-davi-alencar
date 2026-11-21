import { BRAND, CONTACT, FAQ, PHOTOS, SHIRTS, SUITS } from '../data/site-content';

/**
 * JSON-LD (schema.org): ClothingStore com ofertas de terno e camisa sob medida (sem preço),
 * WebSite e FAQPage. Endereço, telefone, horário, área atendida e redes só entram com dados reais.
 */
export function buildJsonLd(): object {
  const base = BRAND.siteUrl ?? '';
  const id = (frag: string) => `${base}/#${frag}`;

  const store: Record<string, unknown> = {
    '@type': 'ClothingStore',
    '@id': id('alfaiataria'),
    name: BRAND.name,
    description:
      'Alfaiataria de roupas sob medida: ternos e camisas feitos a partir das medidas de cada cliente, com escolha de tecido, modelagem e acabamento.',
    logo: `${base}/icon-512.png`,
    image: [`${base}/og-image.jpg`, `${base}/images/${PHOTOS.daviBlueCheck.src}-1440.webp`],
    knowsLanguage: 'pt-BR',
    makesOffer: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Terno sob medida',
          description: SUITS.text,
          serviceType: 'Alfaiataria sob medida',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'Camisa sob medida',
          description: SHIRTS.text,
          serviceType: 'Alfaiataria sob medida',
        },
      },
    ],
  };

  if (BRAND.siteUrl) store['url'] = `${BRAND.siteUrl}/`;
  if (BRAND.city) store['areaServed'] = { '@type': 'City', name: BRAND.city };
  if (CONTACT.phoneDisplay) store['telephone'] = CONTACT.phoneDisplay;
  if (CONTACT.email) store['email'] = CONTACT.email;
  if (CONTACT.address) {
    store['address'] = {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.street,
      addressLocality: CONTACT.address.city,
      addressRegion: CONTACT.address.state,
      postalCode: CONTACT.address.postalCode,
      addressCountry: 'BR',
    };
  }
  if (CONTACT.instagram) store['sameAs'] = [CONTACT.instagram];
  // TODO: openingHoursSpecification e geo quando o horário e o endereço forem informados.

  const website: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': id('site'),
    name: BRAND.name,
    inLanguage: 'pt-BR',
    publisher: { '@id': id('alfaiataria') },
  };
  if (BRAND.siteUrl) website['url'] = `${BRAND.siteUrl}/`;

  const faq = {
    '@type': 'FAQPage',
    '@id': id('duvidas'),
    mainEntity: FAQ.items
      .filter((q) => q.confirmed)
      .map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
  };

  return { '@context': 'https://schema.org', '@graph': [store, website, faq] };
}
