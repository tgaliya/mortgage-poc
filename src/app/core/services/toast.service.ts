import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}

/**
 * Global toaster service. Every module (Borrower Information, Property Details,
 * Loan Details, Document Details, Applicant Profile, Login, etc.) calls this
 * service so toaster wording and behavior stay 100% consistent app-wide,
 * per Global Rule 1.2 in the Master Specification.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 1;
  readonly toasts = signal<ToastMessage[]>([]);

  show(text: string, type: ToastType = 'success', durationMs = 3500): void {
    const id = this.nextId++;
    this.toasts.update(list => [...list, { id, text, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(text: string): void {
    this.show(text, 'success');
  }

  error(text: string): void {
    this.show(text, 'error');
  }

  info(text: string): void {
    this.show(text, 'info');
  }

  dismiss(id: number): void {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}
