import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicantService } from '../../../core/services/applicant.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Applicant } from '../../../core/models/applicant.model';

@Component({
  selector: 'app-personal-details-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './personal-details-list.component.html'
})
export class PersonalDetailsListComponent {
  private applicantService = inject(ApplicantService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  applicants = this.applicantService.applicants;
  openMenuId = signal<string | null>(null);

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addApplicant(): void {
    this.router.navigate(['/applicant-profile/personal-details/add']);
  }

  editApplicant(applicant: Applicant): void {
    this.openMenuId.set(null);
    this.router.navigate(['/applicant-profile/personal-details/edit', applicant.id]);
  }

  async deleteApplicant(applicant: Applicant): Promise<void> {
    this.openMenuId.set(null);
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.applicantService.delete(applicant.id);
      this.toast.success('Applicant Profile deleted!');
    }
  }
}
