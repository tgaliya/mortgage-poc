import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AppUser, UserStatus } from '../../../core/models/user.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-manage-users-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './manage-users-list.component.html'
})
export class ManageUsersListComponent {
  userService = inject(UserService);
  private roleService = inject(RoleService);
  private auth = inject(AuthService);
  private accessControl = inject(AccessControlService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  searchTerm = signal('');
  filteredUsers = computed(() =>
    this.userService.users()
      .filter(u => matchesSearch(this.searchTerm(), u.firstName, u.lastName, u.email, this.roleName(u.roleId), u.status))
      .sort((a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName))
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Manage Users', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Manage Users', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Manage Users', 'Delete'));
  canChangeStatus = computed(() => this.accessControl.hasPermission('Manage Users', 'Change Status'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete() || this.canChangeStatus());

  roleName(roleId: string): string {
    return this.roleService.getById(roleId)?.roleName ?? '—';
  }

  isCurrentUser(userId: string): boolean {
    return this.auth.currentUserId() === userId;
  }

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addUser(): void {
    this.router.navigate(['/administration/manage-users/add']);
  }

  editUser(user: AppUser): void {
    this.openMenuId.set(null);
    this.router.navigate(['/administration/manage-users/edit', user.id]);
  }

  async setStatus(user: AppUser, newStatus: UserStatus): Promise<void> {
    this.openMenuId.set(null);

    if (!this.canChangeStatus()) {
      this.toast.error('You do not have permission to change user status.');
      return;
    }
    if (this.isCurrentUser(user.id) && newStatus === 'Inactive') {
      this.toast.error('You cannot deactivate your own account.');
      return;
    }

    await this.userService.update(user.id, { status: newStatus });
    this.toast.success(`User set to ${newStatus}!`);
  }

  async deleteUser(user: AppUser): Promise<void> {
    this.openMenuId.set(null);

    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }

    if (this.isCurrentUser(user.id)) {
      this.toast.error('You cannot delete your own account.');
      return;
    }

    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.userService.delete(user.id);
      this.toast.success('User deleted!');
    }
  }
}
