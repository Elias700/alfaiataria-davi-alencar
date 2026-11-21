import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';

import { CONTACT } from '../data/site-content';

export interface BookingRequest {
  readonly name: string;
  readonly phone: string;
  readonly interest: 'terno' | 'camisa' | 'ambos';
  readonly occasion: string | null;
  readonly eventDate: string | null;
  readonly message: string | null;
  readonly consent: true;
  /** Data/hora do consentimento (LGPD), em ISO 8601. */
  readonly consentAt: string;
}

export class FormNotConfiguredError extends Error {
  constructor() {
    super('Endpoint do formulário não configurado (CONTACT.formEndpoint).');
  }
}

/**
 * Envio do formulário de agendamento, desacoplado do componente.
 * TODO: definir o endpoint em CONTACT.formEndpoint (ex.: função serverless, Formspree,
 * API própria ou rota no src/server.ts). Enquanto for null, o envio retorna FormNotConfiguredError
 * e a página oferece o WhatsApp como alternativa.
 */
@Injectable({ providedIn: 'root' })
export class ContactService {
  get isConfigured(): boolean {
    return CONTACT.formEndpoint !== null;
  }

  send(request: BookingRequest): Observable<unknown> {
    const endpoint = CONTACT.formEndpoint;
    if (!endpoint) return throwError(() => new FormNotConfiguredError());
    // fetch nativo: evita carregar o HttpClient só para um POST.
    return from(
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(request),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res;
      }),
    );
  }

  /** Mensagem pronta para o WhatsApp com os dados do formulário. */
  toWhatsappText(r: Omit<BookingRequest, 'consent' | 'consentAt'>): string {
    const interest = { terno: 'um terno', camisa: 'uma camisa', ambos: 'terno e camisa' }[
      r.interest
    ];
    const lines = [
      `Olá, sou ${r.name} e gostaria de agendar um atendimento para ${interest} sob medida.`,
      r.occasion ? `Ocasião: ${r.occasion}.` : null,
      r.eventDate ? `Data do evento: ${r.eventDate.split('-').reverse().join('/')}.` : null,
      r.message ? r.message : null,
    ];
    return lines.filter(Boolean).join('\n');
  }
}
