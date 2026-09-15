import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { RoleService } from '../../../core/services/role.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { Permission } from '../../../core/models/permission.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-manage-permissions-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './manage-permissions-list.component.html'
})
export class ManagePermissionsListComponent {
  permissionService = inject(PermissionService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);

  searchTerm = signal('');
  filteredPermissions = computed(() =>
    this.permissionService.permissions().filter(p =>
      matchesSearch(this.searchTerm(), p.module, p.subModule, p.action, p.name, p.description)
    )
  );
  openMenuId = signal<string | null>(null);

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addPermission(): void {
    this.router.navigate(['/administration/manage-permissions/add']);
  }

  editPermission(permission: Permission): void {
    this.openMenuId.set(null);
    this.router.navigate(['/administration/manage-permissions/edit', permission.id]);
  }

  async deletePermission(permission: Permission): Promise<void> {
    this.openMenuId.set(null);

    const rolesUsingIt = this.roleService.countRolesUsingPermission(permission.id);
    if (rolesUsingIt > 0) {
      this.toast.error(`Cannot delete: assigned to ${rolesUsingIt} role(s).`);
      return;
    }

    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.permissionService.delete(permission.id);
      this.toast.success('Permission deleted!');
    }
  }
}
