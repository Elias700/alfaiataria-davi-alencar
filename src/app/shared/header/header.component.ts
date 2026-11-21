import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { AnchorDirective } from '../../core/animations/anchor.directive';
import { MagneticDirective } from '../../core/animations/magnetic.directive';
import { DUR_L } from '../../core/animations/motion';
import { ScrollAnimationService } from '../../core/animations/scroll-animation.service';
import { ThemeTargetDirective } from '../../core/animations/theme-target.directive';
import { BRAND, CONTACT, CTA_LABEL, NAV } from '../../core/data/site-content';
import { UiStateService } from '../../core/ui-state.service';
import { RollTextComponent } from '../roll-text/roll-text.component';

@Component({
  selector: 'app-header',
  imports: [AnchorDirective, MagneticDirective, ThemeTargetDirective, RollTextComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './header.component.scss',
  templateUrl: './header.component.html',
  host: {
    '(document:keydown.escape)': 'close()',
  },
})
export class HeaderComponent {
  protected readonly ui = inject(UiStateService);
  private readonly anim = inject(ScrollAnimationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly brand = BRAND;
  protected readonly ctaLabel = CTA_LABEL;
  protected readonly instagram = CONTACT.instagram;
  /** "Agendar" vira o botão de CTA; os demais itens ficam no menu horizontal. */
  protected readonly navLinks = NAV.filter((n) => n.href !== '#agendar');
  protected readonly menuLinks = NAV;

  private readonly ring = viewChild.required<ElementRef<SVGElement>>('ring');
  private readonly toggleBtn = viewChild.required<ElementRef<HTMLButtonElement>>('toggleBtn');
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');
  private readonly headerEl = viewChild.required<ElementRef<HTMLElement>>('headerEl');

  constructor() {
    afterNextRender(() => this.initRotatingBadge());
  }

  toggle(): void {
    if (this.ui.menuOpen()) this.close();
    else this.open();
  }

  open(): void {
    this.ui.menuOpen.set(true);
    this.anim.lock();
    // Foco no primeiro link do menu depois que ele fica visível.
    setTimeout(() => this.menu().nativeElement.querySelector<HTMLElement>('a')?.focus(), 50);
  }

  close(returnFocus = true): void {
    if (!this.ui.menuOpen()) return;
    this.ui.menuOpen.set(false);
    this.anim.unlock();
    if (returnFocus) this.toggleBtn().nativeElement.focus();
  }

  /** Mantém o foco dentro do header + menu enquanto o menu está aberto. */
  protected trapFocus(event: KeyboardEvent): void {
    if (!this.ui.menuOpen() || event.key !== 'Tab') return;
    const focusables = Array.from(
      this.headerEl().nativeElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      ),
    ).filter((el) => el.offsetParent !== null && !el.closest('[inert]'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /**
   * Selo circular girando (A23, initLogo do clone): 30°/s, acelerando e mudando de direção
   * conforme a velocidade do scroll.
   */
  private initRotatingBadge(): void {
    const ring = this.ring().nativeElement;
    this.anim.scope(ring as unknown as HTMLElement, this.destroyRef, ({ gsap }) => {
      const state = { speed: 30 };
      let rotation = 0;
      let dir = 1;
      let settle: ReturnType<typeof setTimeout> | undefined;
      gsap.set(ring, { transformOrigin: '50% 50%' });

      const tick = (_time: number, delta: number) => {
        rotation += state.speed * (Math.min(delta, 100) / 1000);
        gsap.set(ring, { rotation });
      };
      gsap.ticker.add(tick);

      const off = this.anim.onScroll((velocity) => {
        if (velocity !== 0) dir = velocity > 0 ? 1 : -1;
        const target = dir * Math.min(30 + 10 * Math.abs(velocity), 420);
        gsap.to(state, { speed: target, duration: 0.3, ease: 'Out', overwrite: true });
        clearTimeout(settle);
        settle = setTimeout(
          () => gsap.to(state, { speed: 30 * dir, duration: DUR_L, ease: 'Out' }),
          100,
        );
      });

      return () => {
        gsap.ticker.remove(tick);
        clearTimeout(settle);
        off();
      };
    });
  }
}
