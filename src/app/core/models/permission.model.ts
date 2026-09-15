export type PermissionModule =
  | 'Dashboard' | 'Borrower Details' | 'Property & Loan Details'
  | 'Document Upload & Review' | 'Applicant Profile' | 'Administration';

export type PermissionSubModule =
  | 'Dashboard'
  | 'Borrower Information' | 'Borrower History'
  | 'Property Details' | 'Loan Details'
  | 'Document Details' | 'Document Audit Trail'
  | 'Personal Details'
  | 'Manage Users' | 'Manage Roles' | 'Manage Permissions';

export type PermissionAction = 'View' | 'Create' | 'Edit' | 'Delete' | 'Change Status';

/** Sub-module -> parent module, mirroring the sidebar structure in nav-config.ts. */
export const SUB_MODULE_TO_MODULE: Record<PermissionSubModule, PermissionModule> = {
  'Dashboard': 'Dashboard',
  'Borrower Information': 'Borrower Details',
  'Borrower History': 'Borrower Details',
  'Property Details': 'Property & Loan Details',
  'Loan Details': 'Property & Loan Details',
  'Document Details': 'Document Upload & Review',
  'Document Audit Trail': 'Document Upload & Review',
  'Personal Details': 'Applicant Profile',
  'Manage Users': 'Administration',
  'Manage Roles': 'Administration',
  'Manage Permissions': 'Administration'
};

export const PERMISSION_MODULES: PermissionModule[] = [
  'Dashboard', 'Borrower Details', 'Property & Loan Details',
  'Document Upload & Review', 'Applicant Profile', 'Administration'
];

export const PERMISSION_SUB_MODULES: PermissionSubModule[] = Object.keys(SUB_MODULE_TO_MODULE) as PermissionSubModule[];

export const PERMISSION_ACTIONS: PermissionAction[] = ['View', 'Create', 'Edit', 'Delete', 'Change Status'];

export interface Permission {
  id: string;
  module: PermissionModule;
  subModule: PermissionSubModule;
  action: PermissionAction;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
