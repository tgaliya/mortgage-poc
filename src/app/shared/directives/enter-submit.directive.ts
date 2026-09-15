import { Directive, ElementRef, HostListener, inject } from '@angular/core';

/**
 * Makes Enter submit the form from any field, not just the one browsers
 * treat as "the" submit trigger. Skips textareas (Enter should insert a
 * newline), file inputs (Enter opens the OS picker), and buttons
 * (already activate on Enter natively - forwarding would double-submit).
 */
@Directive({
  selector: 'form[appEnterSubmit]',
  standalone: true
})
export class EnterSubmitDirective {
  private el = inject(ElementRef<HTMLFormElement>);

  @HostListener('keydown.enter', ['$event'])
  onEnter(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const tag = target.tagName.toLowerCase();
    const inputType = (target as HTMLInputElement).type?.toLowerCase();

    if (tag === 'textarea' || tag === 'button' || inputType === 'submit' || inputType === 'file') {
      return;
    }

    event.preventDefault();
    this.el.nativeElement.requestSubmit();
  }
}
