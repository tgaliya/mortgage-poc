import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';

const FOCUSABLE_SELECTOR =
  'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])';

/**
 * Focuses the first focusable field/button inside the host element as soon
 * as it renders. Since @if-toggled steps/sections are destroyed and
 * recreated by Angular, a fresh directive instance runs again each time the
 * host reappears - giving each screen/step its own default focus.
 */
@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective {
  private el = inject(ElementRef<HTMLElement>);

  constructor() {
    afterNextRender(() => this.focusFirstField());
  }

  private focusFirstField(): void {
    const host = this.el.nativeElement;
    const target = host.matches(FOCUSABLE_SELECTOR) ? host : (host.querySelector(FOCUSABLE_SELECTOR) as HTMLElement | null);
    target?.focus();
  }
}
