import { Directive, inject, input, output } from '@angular/core';

import { ScrollAnimationService } from './scroll-animation.service';

/**
 * Links de âncora com smooth scroll (Lenis), compensando o header fixo e movendo o foco
 * para a seção de destino. Sem JS, o link funciona como âncora normal (SSR).
 */
@Directive({
  selector: 'a[appAnchor]',
  host: { '(click)': 'onClick($event)' },
})
export class AnchorDirective {
  private readonly anim = inject(ScrollAnimationService);

  /** Destino no formato '#id'. */
  readonly appAnchor = input.required<string>();
  /** Emitido antes de rolar (ex.: fechar o menu). */
  readonly navigate = output<void>();

  protected onClick(event: MouseEvent): void {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey
    )
      return;
    const target = this.appAnchor();
    if (!target.startsWith('#')) return;
    event.preventDefault();
    this.navigate.emit();
    // Aguarda um frame para o menu destravar o scroll antes de rolar.
    requestAnimationFrame(() => {
      this.anim.scrollTo(target);
      history.replaceState(null, '', target === '#inicio' ? location.pathname : target);
    });
  }
}
