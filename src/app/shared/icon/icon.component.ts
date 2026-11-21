import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'arrow-right'
  | 'arrow-down'
  | 'arrow-left'
  | 'whatsapp'
  | 'plus'
  | 'close'
  | 'instagram'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'clock'
  | 'pause'
  | 'play'
  | 'zoom';

/** Ícones em SVG inline (decorativos: aria-hidden). O texto acessível fica no botão/link. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'icon' },
  styles: `
    :host {
      display: inline-flex;
      width: 1.25em;
      height: 1.25em;
      flex: none;
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('arrow-right') {
          <path d="M4 12h16M14 6l6 6-6 6" />
        }
        @case ('arrow-left') {
          <path d="M20 12H4M10 6l-6 6 6 6" />
        }
        @case ('arrow-down') {
          <path d="M12 4v16M6 14l6 6 6-6" />
        }
        @case ('plus') {
          <path d="M12 4v16M4 12h16" />
        }
        @case ('close') {
          <path d="M5 5l14 14M19 5L5 19" />
        }
        @case ('pause') {
          <path d="M9 5v14M15 5v14" />
        }
        @case ('play') {
          <path d="M7 5l12 7-12 7z" />
        }
        @case ('zoom') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4 4M11 8v6M8 11h6" />
        }
        @case ('mail') {
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="M3 6l9 7 9-7" />
        }
        @case ('phone') {
          <path
            d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a1 1 0 01-1 1A16 16 0 014 5a1 1 0 011-1z"
          />
        }
        @case ('pin') {
          <path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0113 0C18.5 14.8 12 21 12 21z" />
          <circle cx="12" cy="9.8" r="2.3" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        }
        @case ('instagram') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        }
        @case ('whatsapp') {
          <path d="M4 20l1.2-4.1A8.2 8.2 0 1112 20.2a8.1 8.1 0 01-3.9-1z" />
          <path
            d="M9.2 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.6 1 1.4 1.8 2.5 2.4.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.3.3.5 0 .4-.1 1-.6 1.4-.5.4-1.4.7-2.5.3-1.6-.6-3.4-2-4.5-3.8-.9-1.4-.7-2.7-.4-3.3z"
            fill="currentColor"
            stroke="none"
          />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
