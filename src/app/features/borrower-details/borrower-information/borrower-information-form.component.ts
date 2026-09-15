import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BorrowerService } from '../../../core/services/borrower.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import {
  nameValidator,
  phoneValidator,
  ssnValidator,
  formatSsn,
  formatUsPhone,
  noFutureDateValidator
} from '../../../shared/validators/common-validators';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  firstName: 'First Name must contain only letters, spaces, hyphens, or apostrophes.',
  lastName: 'Last Name must contain only letters, spaces, hyphens, or apostrophes.',
  email: 'Enter a valid email address.',
  phoneNumber: 'Phone number must be exactly 10 digits.',
  dob: 'Date of Birth cannot be a future date.',
  ssn: 'SSN must be in the format XXX-XX-XXXX.'
};

@Component({
  selector: 'app-borrower-information-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './borrower-information-form.component.html',
  styleUrl: './borrower-information-form.component.scss'
})
export class BorrowerInformationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private borrowerService = inject(BorrowerService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  borrowerId = signal<string | null>(null);
  today = new Date().toISOString().split('T')[0];
  submitted = signal(false);

  form = this.fb.group({
    firstName: ['', [Validators.required, nameValidator()]],
    middleName: [''],
    lastName: ['', [Validators.required, nameValidator()]],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phoneNumber: ['', [Validators.required, phoneValidator()]],
    dob: ['', [Validators.required, noFutureDateValidator()]],
    ssn: ['', [Validators.required, ssnValidator()]],
    gender: ['', [Validators.required]],
    genderSpecify: [''],
    maritalStatus: [''],
    hasCoBorrower: [false],
    coFirstName: [''],
    coLastName: [''],
    coEmail: [''],
    coPhoneNumber: [''],
    coDob: [''],
    coSsn: [''],
    employmentStatus: [''],
    borrowerStatus: ['Active', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.borrowerId.set(id);
      const borrower = this.borrowerService.getById(id);
      if (borrower) {
        this.form.patchValue({
          firstName: borrower.firstName,
          middleName: borrower.middleName,
          lastName: borrower.lastName,
          email: borrower.email,
          phoneNumber: formatUsPhone(borrower.phoneNumber ?? ''),
          dob: borrower.dob,
          ssn: borrower.ssn,
          gender: borrower.gender,
          genderSpecify: borrower.genderSpecify,
          maritalStatus: borrower.maritalStatus,
          hasCoBorrower: borrower.hasCoBorrower,
          coFirstName: borrower.coBorrower?.firstName,
          coLastName: borrower.coBorrower?.lastName,
          coEmail: borrower.coBorrower?.email,
          coPhoneNumber: borrower.coBorrower?.phoneNumber,
          coDob: borrower.coBorrower?.dob,
          coSsn: borrower.coBorrower?.ssn,
          employmentStatus: borrower.employmentStatus,
          borrowerStatus: borrower.borrowerStatus
        });
        // Locked-field pattern is demonstrated fully in Applicant Profile (Module 8);
        // Borrower Information itself has no locked-field requirement per spec.
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  get showGenderSpecify(): boolean {
    return this.form.value.gender === 'Other';
  }

  get showCoBorrowerFields(): boolean {
    return !!this.form.value.hasCoBorrower;
  }

  onSsnInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatSsn(input.value);
    this.form.controls.ssn.setValue(formatted, { emitEvent: false });
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatUsPhone(input.value);
    this.form.controls.phoneNumber.setValue(formatted, { emitEvent: false });
  }

  clearForm(): void {
    this.form.reset({ borrowerStatus: 'Active', hasCoBorrower: false });
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/borrower-details/borrower-information']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.value.gender !== 'Other') {
      this.form.controls.genderSpecify.clearValidators();
    } else {
      this.form.controls.genderSpecify.setValidators([Validators.required]);
    }
    this.form.controls.genderSpecify.updateValueAndValidity();

    if (this.form.invalid) {
      getValidationToastMessages(this.form, FIELD_ERROR_MESSAGES).forEach(msg => this.toast.error(msg));
      return;
    }

    const v = this.form.value;
    const payload = {
      firstName: v.firstName!,
      middleName: v.middleName ?? '',
      lastName: v.lastName!,
      email: v.email!,
      phoneNumber: v.phoneNumber!,
      dob: v.dob!,
      ssn: v.ssn!,
      gender: v.gender as any,
      genderSpecify: v.genderSpecify ?? '',
      maritalStatus: v.maritalStatus as any,
      hasCoBorrower: !!v.hasCoBorrower,
      coBorrower: v.hasCoBorrower
        ? {
            firstName: v.coFirstName ?? '',
            lastName: v.coLastName ?? '',
            email: v.coEmail ?? '',
            phoneNumber: v.coPhoneNumber ?? '',
            dob: v.coDob ?? '',
            ssn: v.coSsn ?? ''
          }
        : undefined,
      employmentStatus: v.employmentStatus as any,
      borrowerStatus: v.borrowerStatus as any
    };

    if (this.isEditMode() && this.borrowerId()) {
      await this.borrowerService.update(this.borrowerId()!, payload);
      this.toast.success('Borrower Information updated!');
    } else {
      await this.borrowerService.create(payload);
      this.toast.success('Borrower Information submitted!');
    }

    this.router.navigate(['/borrower-details/borrower-information']);
  }
}
