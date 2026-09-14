import { Injectable, signal } from '@angular/core';

/**
 * POC auth service. No real backend - a single hardcoded valid credential
 * pair is used to demonstrate success/failure validation, per the Login
 * module spec (Section 3).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly VALID_EMAIL = 'demo.user@outamation.com';
  private readonly VALID_PASSWORD = 'Passw0rd!';

  private readonly STORAGE_KEY = 'mortgage_poc_authenticated';

  readonly isAuthenticated = signal<boolean>(this.readStoredAuth());

  private readStoredAuth(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  validateEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  validateCredentials(email: string, password: string): boolean {
    return email.trim().toLowerCase() === this.VALID_EMAIL && password === this.VALID_PASSWORD;
  }

  completeLogin(): void {
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    this.isAuthenticated.set(true);
  }

  logout(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
    this.isAuthenticated.set(false);
  }

  get demoCredentials() {
    return { email: this.VALID_EMAIL, password: this.VALID_PASSWORD };
  }
}
