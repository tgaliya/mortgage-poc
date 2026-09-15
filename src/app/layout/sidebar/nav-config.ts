import { IconName } from '../../shared/components/icon/icon.component';

export interface NavSubModule {
  label: string;
  path: string;
  icon: IconName;
}

export interface NavModule {
  label: string;
  icon: IconName;
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
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard' },
  {
    label: 'Borrower Details',
    icon: 'users',
    subModules: [
      { label: 'Borrower Information', path: '/borrower-details/borrower-information', icon: 'profile' },
      { label: 'Borrower History', path: '/borrower-details/borrower-history', icon: 'history' }
    ]
  },
  {
    label: 'Property & Loan Details',
    icon: 'home',
    subModules: [
      { label: 'Property Details', path: '/property-loan-details/property-details', icon: 'home' },
      { label: 'Loan Details', path: '/property-loan-details/loan-details', icon: 'bank' }
    ]
  },
  {
    label: 'Document Upload & Review',
    icon: 'document',
    subModules: [
      { label: 'Document Details', path: '/document-upload-review/document-details', icon: 'document' },
      { label: 'Document Audit Trail', path: '/document-upload-review/document-audit-trail', icon: 'audit' }
    ]
  },
  {
    label: 'Applicant Profile',
    icon: 'profile',
    subModules: [
      { label: 'Personal Details', path: '/applicant-profile/personal-details', icon: 'profile' }
    ]
  },
  {
    label: 'Administration',
    icon: 'shield',
    subModules: [
      { label: 'Manage Users', path: '/administration/manage-users', icon: 'users' },
      { label: 'Manage Roles', path: '/administration/manage-roles', icon: 'badge' },
      { label: 'Manage Permissions', path: '/administration/manage-permissions', icon: 'key' }
    ]
  }
];
