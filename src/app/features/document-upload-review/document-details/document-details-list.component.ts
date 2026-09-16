import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { AppDocument } from '../../../core/models/document.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-document-details-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './document-details-list.component.html'
})
export class DocumentDetailsListComponent {
  documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private accessControl = inject(AccessControlService);

  searchTerm = signal('');
  filteredDocuments = computed(() =>
    this.documentService.documents()
      .filter(d => matchesSearch(this.searchTerm(), d.documentName, d.documentType, d.documentSubType, d.documentStatus))
      .sort((a, b) => a.documentName.localeCompare(b.documentName))
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Document Details', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Document Details', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Document Details', 'Delete'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete());

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addDocument(): void {
    this.router.navigate(['/document-upload-review/document-details/add']);
  }

  editDocument(doc: AppDocument): void {
    this.openMenuId.set(null);
    this.router.navigate(['/document-upload-review/document-details/edit', doc.id]);
  }

  async deleteDocument(doc: AppDocument): Promise<void> {
    this.openMenuId.set(null);
    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.documentService.delete(doc.id);
      this.toast.success('Document deleted!');
    }
  }
}
