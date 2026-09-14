import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DocumentService } from '../../../core/services/document.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AppDocument } from '../../../core/models/document.model';

@Component({
  selector: 'app-document-details-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './document-details-list.component.html'
})
export class DocumentDetailsListComponent {
  private documentService = inject(DocumentService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  documents = this.documentService.documents;
  openMenuId = signal<string | null>(null);

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
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.documentService.delete(doc.id);
      this.toast.success('Document deleted!');
    }
  }
}
