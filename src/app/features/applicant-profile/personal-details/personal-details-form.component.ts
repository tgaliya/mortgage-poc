import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicantService } from '../../../core/services/applicant.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import {
  phoneValidator,
  noFutureDateValidator,
  mustBeFutureDateValidator,
  amountValidator
} from '../../../shared/validators/common-validators';
import { LOCKED_FIELD_KEYS } from '../../../core/models/applicant.model';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';
import { US_STATES_ONLY } from '../../../shared/constants/us-states.const';

const ALLOWED_PHOTO_EXT = ['jpg', 'jpeg', 'png'];
const MAX_PHOTO_MB = 2;

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  email: 'Enter a valid email address.',
  phoneNumber: 'Phone number must be exactly 10 digits.',
  dob: 'Date of Birth cannot be a future date.',
  passportExpiryDate: 'Passport Expiry Date must be a future date.',
  monthlySalary: 'Enter a valid Monthly Salary (numbers only, up to 2 decimal places).',
  annualIncome: 'Enter a valid Annual Income (numbers only, up to 2 decimal places).'
};

@Component({
  selector: 'app-personal-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective, IconComponent],
  templateUrl: './personal-details-form.component.html'
})
export class PersonalDetailsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private applicantService = inject(ApplicantService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  applicantId = signal<string | null>(null);
  today = new Date().toISOString().split('T')[0];
  selectedPhoto = signal<File | null>(null);
  existingPhotoName = signal<string | null>(null);
  photoError = signal(false);
  submitted = signal(false);
  usStates = US_STATES_ONLY;
  lockedKeys = LOCKED_FIELD_KEYS;

  form = this.fb.group({
    // Section 1
    firstName: ['', [Validators.required]],
    middleName: [''],
    lastName: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    genderSpecify: [''],
    dob: ['', [Validators.required, noFutureDateValidator()]],
    maritalStatus: ['', [Validators.required]],
    nationality: ['', [Validators.required]],

    // Section 2
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phoneNumber: ['', [Validators.required, phoneValidator()]],
    alternatePhoneNumber: [''],
    emergencyContactName: ['', [Validators.required]],
    emergencyContactRelationship: ['', [Validators.required]],
    emergencyContactNumber: ['', [Validators.required]],

    // Section 3
    currentAddressLine1: ['', [Validators.required]],
    currentAddressLine2: [''],
    currentCity: ['', [Validators.required]],
    currentState: ['', [Validators.required]],
    currentCounty: ['', [Validators.required]],
    currentZipCode: ['', [Validators.required]],

    // Section 4
    sameAsCurrentAddress: [false],
    permanentAddressLine1: [''],
    permanentAddressLine2: [''],
    permanentCity: [''],
    permanentState: [''],
    permanentCounty: [''],
    permanentZipCode: [''],

    // Section 5
    driversLicenseNumber: [''],
    driversLicenseState: [''],
    passportNumber: [''],
    passportExpiryDate: ['', [mustBeFutureDateValidator()]],

    // Section 6
    employerName: ['', [Validators.required]],
    employerAddress: [''],
    employerPhoneNumber: [''],
    jobTitle: ['', [Validators.required]],
    employmentStatus: ['', [Validators.required]],
    employmentType: ['', [Validators.required]],
    yearsAtCurrentJob: ['', [Validators.required]],
    monthlySalary: ['', [Validators.required, amountValidator()]],
    annualIncome: ['', [amountValidator()]],
    otherIncomeSource: [''],
    otherIncomeAmount: [''],

    // Section 7
    numberOfDependents: ['0', [Validators.required]],
    spouseName: [''],
    spouseEmploymentStatus: [''],
    spouseIncome: [''],

    // Section 8
    preferredLanguage: ['', [Validators.required]],
    preferredCommunicationMethod: ['', [Validators.required]],
    preferredContactTime: [''],
    preferredNickname: [''],
    additionalNotes: [''],

    agreementConfirmed: [false]
  });

  ngOnInit(): void {
    this.form.controls.sameAsCurrentAddress.valueChanges.subscribe(same => {
      const permanentFields = [
        'permanentAddressLine1', 'permanentCity', 'permanentState', 'permanentCounty', 'permanentZipCode'
      ] as const;
      permanentFields.forEach(key => {
        const control = this.form.controls[key];
        if (same) {
          control.clearValidators();
          control.setValue(this.form.value[key.replace('permanent', 'current') as 'currentAddressLine1'] ?? '');
        } else {
          control.setValidators([Validators.required]);
        }
        control.updateValueAndValidity();
      });
    });

    this.form.controls.maritalStatus.valueChanges.subscribe(status => {
      const spouseName = this.form.controls.spouseName;
      if (status === 'Married') {
        spouseName.setValidators([Validators.required]);
      } else {
        spouseName.clearValidators();
      }
      spouseName.updateValueAndValidity();
    });

    this.form.controls.otherIncomeSource.valueChanges.subscribe(source => {
      const otherIncomeAmount = this.form.controls.otherIncomeAmount;
      if (source) {
        otherIncomeAmount.setValidators([Validators.required]);
      } else {
        otherIncomeAmount.clearValidators();
      }
      otherIncomeAmount.updateValueAndValidity();
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.applicantId.set(id);
      const applicant = this.applicantService.getById(id);
      if (applicant) {
        this.form.patchValue(applicant as any);
        this.existingPhotoName.set(applicant.photoFileName);
        // Locked fields (Spec 8.9) are disabled on Edit
        this.lockedKeys.forEach(key => this.form.controls[key as keyof typeof this.form.controls].disable());
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  get showGenderSpecify(): boolean {
    return this.form.value.gender === 'Other';
  }

  get showPermanentAddressFields(): boolean {
    return !this.form.value.sameAsCurrentAddress;
  }

  get showSpouseName(): boolean {
    return this.form.value.maritalStatus === 'Married';
  }

  get showOtherIncomeAmount(): boolean {
    return !!this.form.value.otherIncomeSource;
  }

  isLocked(key: string): boolean {
    return this.isEditMode() && (this.lockedKeys as readonly string[]).includes(key);
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_PHOTO_EXT.includes(ext)) {
      this.toast.error('Only .jpg, .jpeg, or .png files are allowed!');
      input.value = '';
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      this.toast.error('File size exceeds the 2 MB limit!');
      input.value = '';
      return;
    }
    this.selectedPhoto.set(file);
    this.photoError.set(false);
  }

  clearForm(): void {
    this.form.reset({ numberOfDependents: '0', sameAsCurrentAddress: false, agreementConfirmed: false });
    this.selectedPhoto.set(null);
    this.submitted.set(false);
    this.photoError.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/applicant-profile/personal-details']);
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

    const photoMissing = !this.isEditMode() && !this.selectedPhoto();
    if (photoMissing) {
      this.photoError.set(true);
      this.toast.error('Please upload a passport-size photo!');
      return;
    }
    this.photoError.set(false);

    if (!this.isEditMode() && !this.form.value.agreementConfirmed) {
      this.toast.error('Please fill all the required fields!');
      return;
    }

    const v = { ...this.form.getRawValue() } as any;
    const photo = this.selectedPhoto();

    let photoFilePath: string | undefined;
    let photoFileName = this.existingPhotoName() ?? '';

    if (photo) {
      const uploadedPath = await this.applicantService.uploadPhoto(photo);
      if (!uploadedPath) {
        this.toast.error('Photo upload failed. Please try again.');
        return;
      }
      photoFilePath = uploadedPath;
      photoFileName = photo.name;
    }

    const payload = {
      ...v,
      photoFileName,
      photoFilePath
    };

    if (this.isEditMode() && this.applicantId()) {
      await this.applicantService.update(this.applicantId()!, payload);
      this.toast.success('Applicant Profile updated!');
      this.router.navigate(['/applicant-profile/personal-details']);
      return;
    }

    // Create-mode confirmation flow (Spec 8.10)
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure the details entered are correct? The following fields cannot be edited later: ' +
      'First Name, Last Name, Date of Birth, Gender, Nationality, Passport Number.',
      'Please Confirm'
    );

    if (!confirmed) {
      // Form remains open, data intact - nothing cleared
      return;
    }

    await this.applicantService.create(payload);
    this.toast.success('Applicant Profile created!');
    this.router.navigate(['/applicant-profile/personal-details']);
  }
}
