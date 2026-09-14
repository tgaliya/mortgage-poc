export type Gender = 'Male' | 'Female' | 'Other';
export type MaritalStatus = 'Single' | 'Married' | 'Divorced' | 'Widowed';
export type EmploymentStatus = 'Employed' | 'Self-Employed' | 'Unemployed' | 'Retired';
export type BorrowerStatus = 'Active' | 'Inactive';

export interface Borrower {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string; // ISO date string
  ssn: string; // stored as 3-2-4 format, never shown in the grid
  gender: Gender;
  genderSpecify?: string;
  maritalStatus?: MaritalStatus;
  hasCoBorrower: boolean;
  coBorrower?: CoBorrower;
  employmentStatus?: EmploymentStatus;
  borrowerStatus: BorrowerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CoBorrower {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  ssn: string;
}
