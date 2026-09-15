import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccessControlService } from '../services/access-control.service';
import { ToastService } from '../services/toast.service';
import { UserService } from '../services/user.service';
import { RoleService } from '../services/role.service';
import { PermissionService } from '../services/permission.service';
import { PermissionSubModule, PermissionAction } from '../models/permission.model';

/**
 * Blocks direct navigation to a route the current user's role doesn't have
 * the given permission for (defaults to 'View'). Dashboard and My Profile
 * are intentionally never gated this way - see nav-config.ts / app.routes.ts.
 *
 * Awaits the users/roles/permissions services' initial load first - on a hard
 * reload or direct URL navigation those signal caches start empty, and
 * checking against them before the first fetch resolves would deny everyone,
 * including users who do have the permission.
 */
export function permissionGuard(subModule: PermissionSubModule, action: PermissionAction = 'View'): CanActivateFn {
  return async () => {
    // inject() only works synchronously within the injection context, so every
    // service must be resolved before the first `await` below.
    const userService = inject(UserService);
    const roleService = inject(RoleService);
    const permissionService = inject(PermissionService);
    const accessControl = inject(AccessControlService);
    const toast = inject(ToastService);
    const router = inject(Router);

    await Promise.all([userService.ready, roleService.ready, permissionService.ready]);

    if (accessControl.hasPermission(subModule, action)) {
      return true;
    }

    toast.error("You don't have permission to view this page.");
    router.navigate(['/dashboard']);
    return false;
  };
}
