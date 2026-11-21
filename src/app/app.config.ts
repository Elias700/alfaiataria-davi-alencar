import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { IMAGE_CONFIG, IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

/** Larguras geradas por scripts/optimize-images.mjs. */
export const IMAGE_WIDTHS = [480, 768, 1080, 1440, 1920, 2560] as const;

/**
 * Loader do NgOptimizedImage: `ngSrc="davi-terno-cinza-tesoura"` vira
 * `/images/davi-terno-cinza-tesoura-<largura>.webp`, escolhendo a menor largura gerada que cobre o pedido.
 */
export function imageLoader(config: ImageLoaderConfig): string {
  const requested = config.width ?? 1080;
  const width = IMAGE_WIDTHS.find((w) => w >= requested) ?? IMAGE_WIDTHS[IMAGE_WIDTHS.length - 1];
  return `/images/${config.src}-${width}.webp`;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    { provide: IMAGE_LOADER, useValue: imageLoader },
    // srcset gerado só com as larguras que existem em public/images.
    { provide: IMAGE_CONFIG, useValue: { breakpoints: [...IMAGE_WIDTHS] } },
  ],
};
