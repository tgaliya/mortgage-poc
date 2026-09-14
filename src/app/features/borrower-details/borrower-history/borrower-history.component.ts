import { Component } from '@angular/core';
import { ComingSoonComponent } from '../../../shared/components/coming-soon/coming-soon.component';

@Component({
  selector: 'app-borrower-history',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon title="Borrower History"></app-coming-soon>`
})
export class BorrowerHistoryComponent {}
