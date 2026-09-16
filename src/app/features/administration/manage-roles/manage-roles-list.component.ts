import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { Role } from '../../../core/models/role.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-manage-roles-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './manage-roles-list.component.html'
})
export class ManageRolesListComponent {
  roleService = inject(RoleService);
  private userService = inject(UserService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private accessControl = inject(AccessControlService);

  searchTerm = signal('');
  filteredRoles = computed(() =>
    this.roleService.roles().filter(r => matchesSearch(this.searchTerm(), r.roleName, r.description, r.status))
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Manage Roles', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Manage Roles', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Manage Roles', 'Delete'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete());

  userCount(roleId: string): number {
    return this.userService.countUsersWithRole(roleId);
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addRole(): void {
    this.router.navigate(['/administration/manage-roles/add']);
  }

  editRole(role: Role): void {
    this.openMenuId.set(null);
    this.router.navigate(['/administration/manage-roles/edit', role.id]);
  }

  async deleteRole(role: Role): Promise<void> {
    this.openMenuId.set(null);

    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }

    const usersWithRole = this.userService.countUsersWithRole(role.id);
    if (usersWithRole > 0) {
      this.toast.error(`Cannot delete: assigned to ${usersWithRole} user(s).`);
      return;
    }

    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.roleService.delete(role.id);
      this.toast.success('Role deleted!');
    }
  }
}
