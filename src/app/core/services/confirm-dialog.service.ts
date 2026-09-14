import { Injectable, signal } from '@angular/core';

export interface ConfirmDialogState {
  visible: boolean;
  title: string;
  message: string;
  yesLabel: string;
  noLabel: string;
  resolve?: (result: boolean) => void;
}

/**
 * Generic Yes/No confirmation dialog used across the app:
 *  - Delete confirmations (Global Rule 1.4)
 *  - Login step 3 ("Are you sure you want to proceed with Login?")
 *  - Applicant Profile create-mode confirmation
 */
@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  readonly state = signal<ConfirmDialogState>({
    visible: false,
    title: '',
    message: '',
    yesLabel: 'Yes',
    noLabel: 'No'
  });

  confirm(message: string, title = 'Please Confirm', yesLabel = 'Yes', noLabel = 'No'): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this.state.set({ visible: true, title, message, yesLabel, noLabel, resolve });
    });
  }

  respond(result: boolean): void {
    const current = this.state();
    current.resolve?.(result);
    this.state.set({ ...current, visible: false, resolve: undefined });
  }
}
