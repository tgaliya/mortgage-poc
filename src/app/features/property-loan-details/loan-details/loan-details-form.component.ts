import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoanService } from '../../../core/services/loan.service';
import { ToastService } from '../../../core/services/toast.service';
import { amountValidator, noFutureDateValidator } from '../../../shared/validators/common-validators';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  originalLoanAmount: 'Enter a valid Original Loan Amount (numbers only, up to 2 decimal places).',
  unpaidPrincipalBalance: 'Enter a valid Unpaid Principal Balance (numbers only, up to 2 decimal places).',
  lastPaymentDate: 'Loan Last Payment Date cannot be a future date!'
};

@Component({
  selector: 'app-loan-details-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
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
  submitted = signal(false);

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
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/property-loan-details/loan-details']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, FIELD_ERROR_MESSAGES).forEach(msg => this.toast.error(msg));
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
