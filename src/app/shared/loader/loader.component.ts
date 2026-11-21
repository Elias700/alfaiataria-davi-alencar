import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Loader/intro (A1 do clone, encurtado de ~9s para 1,5s).
 * O monograma se revela por uma máscara diagonal e duas "cortinas de provador" se abrem
 * sobre o hero, como o arco que se abre no clone.
 *
 * É CSS puro: começa na primeira pintura (antes do JS), não bloqueia o LCP e só aparece
 * quando o <html> tem a classe `has-intro`, definida no index.html na primeira visita da
 * sessão e nunca com prefers-reduced-motion.
 */
@Component({
  selector: 'app-loader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  styleUrl: './loader.component.scss',
  template: `
    <div class="loader">
      <div class="loader__curtain loader__curtain--l"></div>
      <div class="loader__curtain loader__curtain--r"></div>
      <div class="loader__mark">
        <span class="monogram monogram--lg loader__mono"></span>
        <span class="loader__line"></span>
      </div>
    </div>
  `,
})
export class LoaderComponent {}
