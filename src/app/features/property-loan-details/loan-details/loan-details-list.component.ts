import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { Loan } from '../../../core/models/loan.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-loan-details-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './loan-details-list.component.html'
})
export class LoanDetailsListComponent {
  loanService = inject(LoanService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private accessControl = inject(AccessControlService);

  searchTerm = signal('');
  filteredLoans = computed(() =>
    this.loanService.loans().filter(l =>
      matchesSearch(this.searchTerm(), l.loanNumber, l.loanType, l.investor, l.loanStatus)
    )
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Loan Details', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Loan Details', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Loan Details', 'Delete'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete());

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addLoan(): void {
    this.router.navigate(['/property-loan-details/loan-details/add']);
  }

  editLoan(loan: Loan): void {
    this.openMenuId.set(null);
    this.router.navigate(['/property-loan-details/loan-details/edit', loan.id]);
  }

  async deleteLoan(loan: Loan): Promise<void> {
    this.openMenuId.set(null);
    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.loanService.delete(loan.id);
      this.toast.success('Loan Details deleted!');
    }
  }
}
