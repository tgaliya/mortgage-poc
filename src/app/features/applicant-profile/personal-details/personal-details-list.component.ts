import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApplicantService } from '../../../core/services/applicant.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { Applicant } from '../../../core/models/applicant.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-personal-details-list',
  standalone: true,
  imports: [CommonModule, DatePipe, IconComponent],
  templateUrl: './personal-details-list.component.html'
})
export class PersonalDetailsListComponent {
  applicantService = inject(ApplicantService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private accessControl = inject(AccessControlService);

  searchTerm = signal('');
  filteredApplicants = computed(() =>
    this.applicantService.applicants()
      .filter(a => matchesSearch(this.searchTerm(), a.firstName, a.lastName, a.email, a.phoneNumber, a.nationality))
      .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName))
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Personal Details', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Personal Details', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Personal Details', 'Delete'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete());

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
    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.applicantService.delete(applicant.id);
      this.toast.success('Applicant Profile deleted!');
    }
  }
}
