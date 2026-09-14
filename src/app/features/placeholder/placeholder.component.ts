import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/**
 * Temporary placeholder for modules whose routes/navigation exist but whose
 * full CRUD implementation is scheduled for the next build phase
 * (Property Details, Loan Details, Document Details, Applicant Profile).
 * This is NOT part of the app spec - it exists only to keep the sidebar and
 * routing fully navigable while the remaining modules are built out
 * following the same pattern established in Borrower Information.
 */
@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-page">
      <div class="icon">&#128736;</div>
      <h2>{{ title }}</h2>
      <p>This module's grid and form will be built next, following the same pattern as Borrower Information.</p>
    </div>
  `
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] ?? 'Module In Progress';
}
