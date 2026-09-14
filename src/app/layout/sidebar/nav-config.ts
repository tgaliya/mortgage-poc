export interface NavSubModule {
  label: string;
  path: string;
}

export interface NavModule {
  label: string;
  icon: string; // simple unicode/emoji-style icon placeholder for the POC
  path?: string; // present only for modules with no sub-modules
  subModules?: NavSubModule[];
}

/**
 * Sidebar structure per Master Spec Section 2.
 * Dashboard has no sub-modules and navigates directly.
 * Borrower Details, Property & Loan Details, Document Upload & Review,
 * and Applicant Profile all expand to reveal sub-modules (no icons on subs).
 */
export const NAV_MODULES: NavModule[] = [
  { label: 'Dashboard', icon: '\u25A6', path: '/dashboard' },
  {
    label: 'Borrower Details',
    icon: '\u{1F464}',
    subModules: [
      { label: 'Borrower Information', path: '/borrower-details/borrower-information' },
      { label: 'Borrower History', path: '/borrower-details/borrower-history' }
    ]
  },
  {
    label: 'Property & Loan Details',
    icon: '\u{1F3E0}',
    subModules: [
      { label: 'Property Details', path: '/property-loan-details/property-details' },
      { label: 'Loan Details', path: '/property-loan-details/loan-details' }
    ]
  },
  {
    label: 'Document Upload & Review',
    icon: '\u{1F4C4}',
    subModules: [
      { label: 'Document Details', path: '/document-upload-review/document-details' },
      { label: 'Document Audit Trail', path: '/document-upload-review/document-audit-trail' }
    ]
  },
  {
    label: 'Applicant Profile',
    icon: '\u{1F4CB}',
    subModules: [
      { label: 'Personal Details', path: '/applicant-profile/personal-details' }
    ]
  }
];
