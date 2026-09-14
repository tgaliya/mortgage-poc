import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { zipValidator, amountValidator, phoneValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-property-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/property-loan-details/property-details']);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please fill all the required fields!');
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
