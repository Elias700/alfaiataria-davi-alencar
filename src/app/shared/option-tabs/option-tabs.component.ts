import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import type { Option } from '../../core/data/site-content';

/**
 * Abas de personalização (A33, initTabs + initTabsHilight do clone):
 * o indicador desliza até a aba ativa e o conteúdo troca com o reveal de texto do clone.
 * Padrão WAI-ARIA de tabs: setas, Home/End, roving tabindex.
 */
@Component({
  selector: 'app-option-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './option-tabs.component.scss',
  host: { '[style.--idx]': 'active()', '[style.--count]': 'visible().length' },
  template: `
    <div class="tabs">
      <div class="tabs__list" role="tablist" [attr.aria-label]="label()" (keydown)="onKey($event)">
        <span class="tabs__hilight" aria-hidden="true"></span>
        @for (o of visible(); track o.title; let i = $index) {
          <button
            type="button"
            role="tab"
            class="tabs__tab"
            [id]="idPrefix() + '-tab-' + i"
            [attr.aria-selected]="active() === i"
            [attr.aria-controls]="idPrefix() + '-panel'"
            [tabindex]="active() === i ? 0 : -1"
            (click)="active.set(i)"
          >
            <span class="tabs__num" aria-hidden="true">{{
              (i + 1).toString().padStart(2, '0')
            }}</span>
            {{ o.title }}
          </button>
        }
      </div>
      <div
        class="tabs__panel"
        role="tabpanel"
        [id]="idPrefix() + '-panel'"
        [attr.aria-labelledby]="idPrefix() + '-tab-' + active()"
        tabindex="0"
      >
        @for (o of current(); track o.title) {
          <div class="tabs__content">
            <p class="h3 tabs__title">
              <span>{{ o.title }}</span>
            </p>
            <p class="tabs__text">
              <span>{{ o.text }}</span>
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class OptionTabsComponent {
  readonly options = input.required<readonly Option[]>();
  readonly label = input.required<string>();
  readonly idPrefix = input.required<string>();

  protected readonly active = signal(0);
  protected readonly visible = computed(() => this.options().filter((o) => o.confirmed));
  protected readonly current = computed(() => {
    const item = this.visible()[this.active()];
    return item ? [item] : [];
  });

  protected onKey(event: KeyboardEvent): void {
    const count = this.visible().length;
    const keys: Record<string, number> = {
      ArrowDown: 1,
      ArrowRight: 1,
      ArrowUp: -1,
      ArrowLeft: -1,
    };
    let next = this.active();
    if (event.key in keys) next = (next + keys[event.key] + count) % count;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = count - 1;
    else return;
    event.preventDefault();
    this.active.set(next);
    const list = event.currentTarget as HTMLElement;
    list.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus();
  }
}
