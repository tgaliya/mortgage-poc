export interface Applicant {
  id: string;

  // Section 1: Basic Information
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  genderSpecify?: string;
  dob: string;
  maritalStatus: string;
  nationality: string;
  photoFileName: string;
  photoFilePath?: string;

  // Section 2: Contact Information
  email: string;
  phoneNumber: string;
  alternatePhoneNumber?: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactNumber: string;

  // Section 3: Current Address
  currentAddressLine1: string;
  currentAddressLine2?: string;
  currentCity: string;
  currentState: string;
  currentCounty: string;
  currentZipCode: string;

  // Section 4: Permanent Address
  sameAsCurrentAddress: boolean;
  permanentAddressLine1?: string;
  permanentAddressLine2?: string;
  permanentCity?: string;
  permanentState?: string;
  permanentCounty?: string;
  permanentZipCode?: string;

  // Section 5: Identification (SSN excluded)
  driversLicenseNumber?: string;
  driversLicenseState?: string;
  passportNumber?: string;
  passportExpiryDate?: string;

  // Section 6: Employment & Income
  employerName: string;
  employerAddress?: string;
  employerPhoneNumber?: string;
  jobTitle: string;
  employmentStatus: string;
  employmentType: string;
  yearsAtCurrentJob: string;
  monthlySalary: string;
  annualIncome?: string;
  otherIncomeSource?: string;
  otherIncomeAmount?: string;

  // Section 7: Family / Dependents
  numberOfDependents: string;
  spouseName?: string;
  spouseEmploymentStatus?: string;
  spouseIncome?: string;

  // Section 8: Preferences
  preferredLanguage: string;
  preferredCommunicationMethod: string;
  preferredContactTime?: string;
  preferredNickname?: string;
  additionalNotes?: string;

  agreementConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Fields locked/disabled on Edit once the profile has been created (Spec 8.9). */
export const LOCKED_FIELD_KEYS = ['firstName', 'lastName', 'dob', 'gender', 'genderSpecify', 'nationality', 'passportNumber'] as const;
