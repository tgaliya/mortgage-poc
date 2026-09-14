import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Common field regex patterns - shared across every module so the same
 * validation logic backs every occurrence of a "common field"
 * (First Name, Last Name, Email, Phone Number, Zip Code, SSN, DOB, Amount).
 */
export const PATTERNS = {
  NAME: /^[A-Za-z' -]{1,50}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10}$/,
  ZIP: /^\d{5}(-\d{4})?$/,
  SSN: /^\d{3}-\d{2}-\d{4}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/
};

export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return PATTERNS.NAME.test(control.value) ? null : { invalidName: true };
  };
}

export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const digitsOnly = String(control.value).replace(/\D/g, '');
    return PATTERNS.PHONE.test(digitsOnly) ? null : { invalidPhone: true };
  };
}

export function zipValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return PATTERNS.ZIP.test(control.value) ? null : { invalidZip: true };
  };
}

export function ssnValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return PATTERNS.SSN.test(control.value) ? null : { invalidSsn: true };
  };
}

/** Auto-formats a raw 9-digit SSN string into the standard 3-2-4 format. */
export function formatSsn(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function amountValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === undefined || control.value === '') return null;
    return PATTERNS.AMOUNT.test(String(control.value)) ? null : { invalidAmount: true };
  };
}

/** DOB must not be a future date. Used wherever "no future date" is required. */
export function noFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return inputDate > today ? { futureDate: true } : null;
  };
}

/** Used for Loan Next Payment Due Date / Loan Maturity Date - future dates ARE allowed, no validator needed. */

/** Passport Expiry Date must be a future date, if entered. */
export function mustBeFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return inputDate <= today ? { notFutureDate: true } : null;
  };
}

export function fileTypeValidator(allowedExt: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | null = control.value;
    if (!file) return null;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return allowedExt.includes(ext) ? null : { invalidFileType: true };
  };
}

export function fileSizeValidator(maxMb: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | null = control.value;
    if (!file) return null;
    const maxBytes = maxMb * 1024 * 1024;
    return file.size > maxBytes ? { fileTooLarge: true } : null;
  };
}
