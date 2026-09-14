import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { amountValidator, noFutureDateValidator } from '../../../shared/validators/common-validators';

@Component({
  selector: 'app-loan-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './loan-details-form.component.html'
})
export class LoanDetailsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private loanService = inject(LoanService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  loanId = signal<string | null>(null);

  form = this.fb.group({
    loanNumber: ['', [Validators.required]],
    loanType: ['', [Validators.required]],
    lienPosition: [''],
    nextPaymentDueDate: [''],
    originalLoanAmount: ['', [Validators.required, amountValidator()]],
    investor: ['', [Validators.required]],
    loanPaymentDuration: ['', [Validators.required]],
    loanMaturityDate: [''],
    // Last Payment Date must NOT accept a future date - validated on Submit per spec
    lastPaymentDate: ['', [noFutureDateValidator()]],
    unpaidPrincipalBalance: ['', [Validators.required, amountValidator()]],
    loanStatus: ['', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.loanId.set(id);
      const loan = this.loanService.getById(id);
      if (loan) {
        this.form.patchValue(loan as any);
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  clearForm(): void {
    this.form.reset();
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/property-loan-details/loan-details']);
  }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      if (this.form.controls.lastPaymentDate.errors?.['futureDate']) {
        this.toast.error('Loan Last Payment Date cannot be a future date!');
      } else {
        this.toast.error('Please fill all the required fields!');
      }
      return;
    }

    const v = this.form.value as any;

    if (this.isEditMode() && this.loanId()) {
      await this.loanService.update(this.loanId()!, v);
      this.toast.success('Loan Details updated!');
    } else {
      await this.loanService.create(v);
      this.toast.success('Loan Details submitted!');
    }

    this.router.navigate(['/property-loan-details/loan-details']);
  }
}
