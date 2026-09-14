import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

type LoginStep = 'email' | 'password' | 'confirm';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  step = signal<LoginStep>('email');
  credentialError = signal<string | null>(null);
  demoCredentials = this.auth.demoCredentials;

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

  submitEmail(): void {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.toast.error('Please fill all the required fields!');
      return;
    }
    this.step.set('password');
  }

  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.toast.error('Please fill all the required fields!');
      return;
    }

    const email = this.emailForm.value.email ?? '';
    const password = this.passwordForm.value.password ?? '';

    if (!this.auth.validateCredentials(email, password)) {
      this.credentialError.set('Invalid email or password.');
      return;
    }

    this.credentialError.set(null);
    this.step.set('confirm');
  }

  confirmYes(): void {
    this.auth.completeLogin();
    this.router.navigate(['/dashboard']);
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
  }
}
