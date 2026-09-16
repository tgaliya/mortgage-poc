import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        canActivate: [permissionGuard('Dashboard', 'View')],
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        // My Profile is intentionally never permission-gated - always reachable regardless of role.
        path: 'my-profile',
        loadComponent: () => import('./features/my-profile/my-profile.component').then(m => m.MyProfileComponent)
      },
      {
        // Reachable regardless of role - the safe landing spot for a role with no accessible modules at all.
        path: 'no-access',
        loadComponent: () => import('./shared/components/no-access/no-access.component').then(m => m.NoAccessComponent)
      },
      {
        path: 'borrower-details/borrower-information',
        canActivate: [permissionGuard('Borrower Information', 'View')],
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-list.component').then(
            m => m.BorrowerInformationListComponent
          )
      },
      {
        path: 'borrower-details/borrower-information/add',
        canActivate: [permissionGuard('Borrower Information', 'Create')],
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-form.component').then(
            m => m.BorrowerInformationFormComponent
          )
      },
      {
        path: 'borrower-details/borrower-information/edit/:id',
        canActivate: [permissionGuard('Borrower Information', 'Edit')],
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-form.component').then(
            m => m.BorrowerInformationFormComponent
          )
      },
      {
        path: 'borrower-details/borrower-history',
        canActivate: [permissionGuard('Borrower History', 'View')],
        loadComponent: () =>
          import('./features/borrower-details/borrower-history/borrower-history.component').then(
            m => m.BorrowerHistoryComponent
          )
      },
      {
        path: 'property-loan-details/property-details',
        canActivate: [permissionGuard('Property Details', 'View')],
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-list.component').then(
            m => m.PropertyDetailsListComponent
          )
      },
      {
        path: 'property-loan-details/property-details/add',
        canActivate: [permissionGuard('Property Details', 'Create')],
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-form.component').then(
            m => m.PropertyDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/property-details/edit/:id',
        canActivate: [permissionGuard('Property Details', 'Edit')],
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-form.component').then(
            m => m.PropertyDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/loan-details',
        canActivate: [permissionGuard('Loan Details', 'View')],
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-list.component').then(
            m => m.LoanDetailsListComponent
          )
      },
      {
        path: 'property-loan-details/loan-details/add',
        canActivate: [permissionGuard('Loan Details', 'Create')],
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-form.component').then(
            m => m.LoanDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/loan-details/edit/:id',
        canActivate: [permissionGuard('Loan Details', 'Edit')],
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-form.component').then(
            m => m.LoanDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-details',
        canActivate: [permissionGuard('Document Details', 'View')],
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-list.component').then(
            m => m.DocumentDetailsListComponent
          )
      },
      {
        path: 'document-upload-review/document-details/add',
        canActivate: [permissionGuard('Document Details', 'Create')],
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-form.component').then(
            m => m.DocumentDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-details/edit/:id',
        canActivate: [permissionGuard('Document Details', 'Edit')],
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-form.component').then(
            m => m.DocumentDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-audit-trail',
        canActivate: [permissionGuard('Document Audit Trail', 'View')],
        loadComponent: () =>
          import('./features/document-audit-trail/document-audit-trail.component').then(
            m => m.DocumentAuditTrailComponent
          )
      },
      {
        path: 'applicant-profile/personal-details',
        canActivate: [permissionGuard('Personal Details', 'View')],
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-list.component').then(
            m => m.PersonalDetailsListComponent
          )
      },
      {
        path: 'applicant-profile/personal-details/add',
        canActivate: [permissionGuard('Personal Details', 'Create')],
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-form.component').then(
            m => m.PersonalDetailsFormComponent
          )
      },
      {
        path: 'applicant-profile/personal-details/edit/:id',
        canActivate: [permissionGuard('Personal Details', 'Edit')],
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-form.component').then(
            m => m.PersonalDetailsFormComponent
          )
      },
      {
        path: 'administration/manage-permissions',
        canActivate: [permissionGuard('Manage Permissions', 'View')],
        loadComponent: () =>
          import('./features/administration/manage-permissions/manage-permissions-list.component').then(
            m => m.ManagePermissionsListComponent
          )
      },
      {
        path: 'administration/manage-permissions/add',
        canActivate: [permissionGuard('Manage Permissions', 'Create')],
        loadComponent: () =>
          import('./features/administration/manage-permissions/manage-permissions-form.component').then(
            m => m.ManagePermissionsFormComponent
          )
      },
      {
        path: 'administration/manage-permissions/edit/:id',
        canActivate: [permissionGuard('Manage Permissions', 'Edit')],
        loadComponent: () =>
          import('./features/administration/manage-permissions/manage-permissions-form.component').then(
            m => m.ManagePermissionsFormComponent
          )
      },
      {
        path: 'administration/manage-roles',
        canActivate: [permissionGuard('Manage Roles', 'View')],
        loadComponent: () =>
          import('./features/administration/manage-roles/manage-roles-list.component').then(
            m => m.ManageRolesListComponent
          )
      },
      {
        path: 'administration/manage-roles/add',
        canActivate: [permissionGuard('Manage Roles', 'Create')],
        loadComponent: () =>
          import('./features/administration/manage-roles/manage-roles-form.component').then(
            m => m.ManageRolesFormComponent
          )
      },
      {
        path: 'administration/manage-roles/edit/:id',
        canActivate: [permissionGuard('Manage Roles', 'Edit')],
        loadComponent: () =>
          import('./features/administration/manage-roles/manage-roles-form.component').then(
            m => m.ManageRolesFormComponent
          )
      },
      {
        path: 'administration/manage-users',
        canActivate: [permissionGuard('Manage Users', 'View')],
        loadComponent: () =>
          import('./features/administration/manage-users/manage-users-list.component').then(
            m => m.ManageUsersListComponent
          )
      },
      {
        path: 'administration/manage-users/add',
        canActivate: [permissionGuard('Manage Users', 'Create')],
        loadComponent: () =>
          import('./features/administration/manage-users/manage-users-form.component').then(
            m => m.ManageUsersFormComponent
          )
      },
      {
        path: 'administration/manage-users/edit/:id',
        canActivate: [permissionGuard('Manage Users', 'Edit')],
        loadComponent: () =>
          import('./features/administration/manage-users/manage-users-form.component').then(
            m => m.ManageUsersFormComponent
          )
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
