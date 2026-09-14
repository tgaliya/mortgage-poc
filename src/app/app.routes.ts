import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

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
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'borrower-details/borrower-information',
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-list.component').then(
            m => m.BorrowerInformationListComponent
          )
      },
      {
        path: 'borrower-details/borrower-information/add',
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-form.component').then(
            m => m.BorrowerInformationFormComponent
          )
      },
      {
        path: 'borrower-details/borrower-information/edit/:id',
        loadComponent: () =>
          import('./features/borrower-details/borrower-information/borrower-information-form.component').then(
            m => m.BorrowerInformationFormComponent
          )
      },
      {
        path: 'borrower-details/borrower-history',
        loadComponent: () =>
          import('./features/borrower-details/borrower-history/borrower-history.component').then(
            m => m.BorrowerHistoryComponent
          )
      },
      {
        path: 'property-loan-details/property-details',
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-list.component').then(
            m => m.PropertyDetailsListComponent
          )
      },
      {
        path: 'property-loan-details/property-details/add',
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-form.component').then(
            m => m.PropertyDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/property-details/edit/:id',
        loadComponent: () =>
          import('./features/property-loan-details/property-details/property-details-form.component').then(
            m => m.PropertyDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/loan-details',
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-list.component').then(
            m => m.LoanDetailsListComponent
          )
      },
      {
        path: 'property-loan-details/loan-details/add',
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-form.component').then(
            m => m.LoanDetailsFormComponent
          )
      },
      {
        path: 'property-loan-details/loan-details/edit/:id',
        loadComponent: () =>
          import('./features/property-loan-details/loan-details/loan-details-form.component').then(
            m => m.LoanDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-details',
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-list.component').then(
            m => m.DocumentDetailsListComponent
          )
      },
      {
        path: 'document-upload-review/document-details/add',
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-form.component').then(
            m => m.DocumentDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-details/edit/:id',
        loadComponent: () =>
          import('./features/document-upload-review/document-details/document-details-form.component').then(
            m => m.DocumentDetailsFormComponent
          )
      },
      {
        path: 'document-upload-review/document-audit-trail',
        loadComponent: () =>
          import('./features/document-audit-trail/document-audit-trail.component').then(
            m => m.DocumentAuditTrailComponent
          )
      },
      {
        path: 'applicant-profile/personal-details',
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-list.component').then(
            m => m.PersonalDetailsListComponent
          )
      },
      {
        path: 'applicant-profile/personal-details/add',
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-form.component').then(
            m => m.PersonalDetailsFormComponent
          )
      },
      {
        path: 'applicant-profile/personal-details/edit/:id',
        loadComponent: () =>
          import('./features/applicant-profile/personal-details/personal-details-form.component').then(
            m => m.PersonalDetailsFormComponent
          )
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
