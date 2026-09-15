import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RoleService } from './role.service';
import { PermissionService } from './permission.service';
import { PermissionSubModule, PermissionAction } from '../models/permission.model';

/**
 * Reads back what the current user can do, based on their assigned Role's
 * permissionIds (see Manage Roles / Manage Permissions). This is the only
 * place in the app that checks permissions - everything else only catalogs
 * or assigns them.
 */
@Injectable({ providedIn: 'root' })
export class AccessControlService {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

  hasPermission(subModule: PermissionSubModule, action: PermissionAction): boolean {
    const userId = this.auth.currentUserId();
    const user = userId ? this.userService.getById(userId) : undefined;
    const role = user ? this.roleService.getById(user.roleId) : undefined;
    const permission = this.permissionService.permissions().find(p => p.subModule === subModule && p.action === action);
    return !!(role && permission && role.permissionIds.includes(permission.id));
  }
}
