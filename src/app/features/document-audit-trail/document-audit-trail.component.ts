import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivityLogService } from '../../core/services/activity-log.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { matchesSearch } from '../../shared/utils/search.util';

@Component({
  selector: 'app-document-audit-trail',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  templateUrl: './document-audit-trail.component.html'
})
export class DocumentAuditTrailComponent {
  private activityLogService = inject(ActivityLogService);

  searchTerm = signal('');

  entries = computed(() => this.activityLogService.activityLog().filter(e => e.entityType === 'Document Details'));

  filteredEntries = computed(() =>
    this.entries().filter(e => matchesSearch(this.searchTerm(), e.actorName, e.action, e.entityLabel))
  );
}
