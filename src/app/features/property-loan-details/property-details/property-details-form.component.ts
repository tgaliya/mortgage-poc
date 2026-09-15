import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { zipValidator, amountValidator, phoneValidator } from '../../../shared/validators/common-validators';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';
import { US_STATES } from '../../../shared/constants/us-states.const';

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  zipCode: 'Enter a valid Zip Code (5 digits, or ZIP+4 format).',
  ownerContactNumber: 'Property Owner Contact Number must be exactly 10 digits.',
  amount: 'Enter a valid Amount (numbers only, up to 2 decimal places).'
};

@Component({
  selector: 'app-property-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './property-details-form.component.html'
})
export class PropertyDetailsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  propertyId = signal<string | null>(null);
  submitted = signal(false);
  usStates = US_STATES;

  form = this.fb.group({
    propertyName: ['', [Validators.required]],
    streetAddress: ['', [Validators.required]],
    addressLine2: [''],
    city: ['', [Validators.required]],
    state: ['', [Validators.required]],
    county: ['', [Validators.required]],
    zipCode: ['', [Validators.required, zipValidator()]],
    ownerContactNumber: ['', [phoneValidator()]],
    propertyStatus: ['Active'],
    occupancyStatus: [''],
    amount: ['', [Validators.required, amountValidator()]],
    propertyType: [''],
    occupancyType: [''],
    loanPurpose: ['']
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.propertyId.set(id);
      const property = this.propertyService.getById(id);
      if (property) {
        this.form.patchValue(property as any);
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  clearForm(): void {
    this.form.reset({ propertyStatus: 'Active' });
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/property-loan-details/property-details']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, FIELD_ERROR_MESSAGES).forEach(msg => this.toast.error(msg));
      return;
    }

    const v = this.form.value as any;

    if (this.isEditMode() && this.propertyId()) {
      await this.propertyService.update(this.propertyId()!, v);
      this.toast.success('Property Details updated!');
    } else {
      await this.propertyService.create(v);
      this.toast.success('Property Details submitted!');
    }

    this.router.navigate(['/property-loan-details/property-details']);
  }
}
