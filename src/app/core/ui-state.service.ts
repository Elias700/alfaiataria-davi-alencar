import { Injectable, signal } from '@angular/core';

/** Estado de UI compartilhado entre header, menu, FAB, footer e modal de privacidade. */
@Injectable({ providedIn: 'root' })
export class UiStateService {
  readonly menuOpen = signal(false);
  readonly privacyOpen = signal(false);
  /** Id da seção da política a destacar ao abrir (ex.: 'cookies'). */
  readonly privacySection = signal<string | null>(null);

  openPrivacy(section: string | null = null): void {
    this.privacySection.set(section);
    this.privacyOpen.set(true);
  }
}
