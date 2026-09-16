import { AccessControlService } from '../services/access-control.service';
import { PermissionSubModule } from '../models/permission.model';

/** Every gateable sub-module's list-page path, mirroring the routes declared in app.routes.ts. */
const SUB_MODULE_ROUTES: { subModule: PermissionSubModule; path: string }[] = [
  { subModule: 'Dashboard', path: '/dashboard' },
  { subModule: 'Borrower Information', path: '/borrower-details/borrower-information' },
  { subModule: 'Borrower History', path: '/borrower-details/borrower-history' },
  { subModule: 'Property Details', path: '/property-loan-details/property-details' },
  { subModule: 'Loan Details', path: '/property-loan-details/loan-details' },
  { subModule: 'Document Details', path: '/document-upload-review/document-details' },
  { subModule: 'Document Audit Trail', path: '/document-upload-review/document-audit-trail' },
  { subModule: 'Personal Details', path: '/applicant-profile/personal-details' },
  { subModule: 'Manage Users', path: '/administration/manage-users' },
  { subModule: 'Manage Roles', path: '/administration/manage-roles' },
  { subModule: 'Manage Permissions', path: '/administration/manage-permissions' }
];

/**
 * Where to send a user after a permission check fails. Redirecting to a fixed
 * route (e.g. always '/dashboard') breaks once Dashboard itself requires a
 * permission - a user without it would bounce straight back into the same
 * failing guard. Instead, find the first module the user's role can actually
 * View, or fall back to the always-reachable "No Access" page if there is none.
 */
export function resolveFallbackRoute(accessControl: AccessControlService): string {
  const match = SUB_MODULE_ROUTES.find(r => accessControl.hasPermission(r.subModule, 'View'));
  return match ? match.path : '/no-access';
}
