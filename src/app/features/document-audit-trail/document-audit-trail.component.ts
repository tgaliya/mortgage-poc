import { Component } from '@angular/core';
import { ComingSoonComponent } from '../../shared/components/coming-soon/coming-soon.component';

@Component({
  selector: 'app-document-audit-trail',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon title="Document Audit Trail"></app-coming-soon>`
})
export class DocumentAuditTrailComponent {}
