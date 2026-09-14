import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Loan } from '../../../core/models/loan.model';

@Component({
  selector: 'app-loan-details-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loan-details-list.component.html'
})
export class LoanDetailsListComponent {
  private loanService = inject(LoanService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  loans = this.loanService.loans;
  openMenuId = signal<string | null>(null);

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
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.loanService.delete(loan.id);
      this.toast.success('Loan Details deleted!');
    }
  }
}
