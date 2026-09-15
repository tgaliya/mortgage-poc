import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { AutofocusDirective } from '../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../shared/utils/form-validation.util';

type LoginStep = 'email' | 'password' | 'confirm';

const EMAIL_FIELD_MESSAGES: Record<string, string> = {
  email: 'Enter a valid email address.'
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private router = inject(Router);

  step = signal<LoginStep>('email');
  credentialError = signal<string | null>(null);
  submitted = signal(false);
  private pendingUserId: string | null = null;

  emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]]
  });

  passwordForm = this.fb.group({
    password: ['', [Validators.required]]
  });

  get emailControl() {
    return this.emailForm.controls.email;
  }

  get passwordControl() {
    return this.passwordForm.controls.password;
  }

  async submitEmail(): Promise<void> {
    this.submitted.set(true);

    if (this.emailForm.invalid) {
      getValidationToastMessages(this.emailForm, EMAIL_FIELD_MESSAGES).forEach(msg => this.toast.error(msg));
      return;
    }

    const email = this.emailForm.value.email ?? '';
    const exists = await this.auth.validateEmailExists(email);
    if (!exists) {
      const message = 'No account found with this email address.';
      this.credentialError.set(message);
      this.toast.error(message);
      return;
    }

    this.credentialError.set(null);
    this.step.set('password');
  }

  async submitPassword(): Promise<void> {
    this.submitted.set(true);

    if (this.passwordForm.invalid) {
      getValidationToastMessages(this.passwordForm, {}).forEach(msg => this.toast.error(msg));
      return;
    }

    const email = this.emailForm.value.email ?? '';
    const password = this.passwordForm.value.password ?? '';

    const result = await this.auth.checkCredentials(email, password);
    if (result === 'wrong-password') {
      const message = 'Incorrect password.';
      this.credentialError.set(message);
      this.toast.error(message);
      return;
    }
    if (result === 'inactive') {
      const message = 'This account is inactive. Contact an administrator.';
      this.credentialError.set(message);
      this.toast.error(message);
      return;
    }
    if (result === 'not-found') {
      const message = 'No account found with this email address.';
      this.credentialError.set(message);
      this.toast.error(message);
      return;
    }

    this.pendingUserId = this.userService.getByEmail(email)?.id ?? null;
    this.credentialError.set(null);
    this.step.set('confirm');
  }

  confirmYes(): void {
    if (this.pendingUserId) {
      this.auth.completeLogin(this.pendingUserId);
      this.router.navigate(['/dashboard']);
    }
  }

  confirmNo(): void {
    // Per spec: returns user to the Email screen
    this.passwordForm.reset();
    this.credentialError.set(null);
    this.step.set('email');
  }

  backToEmail(): void {
    this.step.set('email');
    this.credentialError.set(null);
    this.submitted.set(false);
  }
}
