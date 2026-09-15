import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { BorrowerService } from '../../../core/services/borrower.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Borrower } from '../../../core/models/borrower.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-borrower-information-list',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  templateUrl: './borrower-information-list.component.html',
  styleUrl: './borrower-information-list.component.scss'
})
export class BorrowerInformationListComponent {
  borrowerService = inject(BorrowerService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  searchTerm = signal('');
  filteredBorrowers = computed(() =>
    this.borrowerService.borrowers().filter(b =>
      matchesSearch(this.searchTerm(), b.firstName, b.lastName, b.email, b.phoneNumber)
    )
  );
  openMenuId = signal<string | null>(null);

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addBorrower(): void {
    this.router.navigate(['/borrower-details/borrower-information/add']);
  }

  editBorrower(borrower: Borrower): void {
    this.openMenuId.set(null);
    this.router.navigate(['/borrower-details/borrower-information/edit', borrower.id]);
  }

  async deleteBorrower(borrower: Borrower): Promise<void> {
    this.openMenuId.set(null);
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.borrowerService.delete(borrower.id);
      this.toast.success('Borrower Information deleted!');
    }
  }
}
