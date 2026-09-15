import { Injectable, computed, signal } from '@angular/core';

/**
 * App-wide "something is happening" signal. Uses a reference count instead
 * of a boolean so overlapping loads (e.g. a grid refresh kicked off during
 * a route change) don't hide the bar early when only one of them finishes.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeCount = signal(0);
  readonly isLoading = computed(() => this.activeCount() > 0);

  show(): void {
    this.activeCount.update(n => n + 1);
  }

  hide(): void {
    this.activeCount.update(n => Math.max(0, n - 1));
  }

  async track<T>(work: Promise<T>): Promise<T> {
    this.show();
    try {
      return await work;
    } finally {
      this.hide();
    }
  }
}
