import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleService } from '../../../core/services/role.service';
import { PermissionService } from '../../../core/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  PERMISSION_MODULES,
  PERMISSION_SUB_MODULES,
  PERMISSION_ACTIONS,
  SUB_MODULE_TO_MODULE,
  READ_ONLY_SUB_MODULES,
  PermissionModule,
  PermissionSubModule
} from '../../../core/models/permission.model';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

@Component({
  selector: 'app-manage-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective, IconComponent],
  templateUrl: './manage-roles-form.component.html'
})
export class ManageRolesFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  permissionService = inject(PermissionService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  roleId = signal<string | null>(null);
  submitted = signal(false);
  selectedPermissionIds = signal<Set<string>>(new Set());
  permissionsTouched = signal(false);

  modules = PERMISSION_MODULES;
  actions = PERMISSION_ACTIONS;

  subModulesFor(module: PermissionModule): PermissionSubModule[] {
    return PERMISSION_SUB_MODULES.filter(sm => SUB_MODULE_TO_MODULE[sm] === module);
  }

  form = this.fb.group({
    roleName: ['', [Validators.required]],
    description: [''],
    status: ['Active', [Validators.required]]
  });

  permissionCount = computed(() => this.selectedPermissionIds().size);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.roleId.set(id);
      const role = this.roleService.getById(id);
      if (role) {
        this.form.patchValue({ roleName: role.roleName, description: role.description, status: role.status });
        this.selectedPermissionIds.set(new Set(role.permissionIds));
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  permissionFor(subModule: string, action: string) {
    return this.permissionService.permissions().find(p => p.subModule === subModule && p.action === action);
  }

  isSelected(permissionId: string): boolean {
    return this.selectedPermissionIds().has(permissionId);
  }

  /** Create/Edit/Delete/Change Status are meaningless without View, so they stay locked until View is checked. */
  isViewSelected(subModule: PermissionSubModule): boolean {
    const viewPerm = this.permissionFor(subModule, 'View');
    return !!viewPerm && this.isSelected(viewPerm.id);
  }

  /** Whether this row has any lockable action beyond View - read-only pages only ever have View. */
  hasLockableActions(subModule: PermissionSubModule): boolean {
    if (READ_ONLY_SUB_MODULES.includes(subModule)) {
      return false;
    }
    return this.actions.some(a => a !== 'View' && !!this.permissionFor(subModule, a));
  }

  isReadOnlySubModule(subModule: PermissionSubModule): boolean {
    return READ_ONLY_SUB_MODULES.includes(subModule);
  }

  /** What the UI actually exposes for this row - read-only pages only ever expose View. */
  private visiblePermissionIdsFor(subModule: PermissionSubModule): string[] {
    const isReadOnly = READ_ONLY_SUB_MODULES.includes(subModule);
    return this.permissionService.permissions()
      .filter(p => p.subModule === subModule && (!isReadOnly || p.action === 'View'))
      .map(p => p.id);
  }

  /** Every catalog permission for this row, including ones the UI hides - used only when clearing. */
  private allPermissionIdsFor(subModule: PermissionSubModule): string[] {
    return this.permissionService.permissions().filter(p => p.subModule === subModule).map(p => p.id);
  }

  private visiblePermissionIdsForModule(module: PermissionModule): string[] {
    return this.subModulesFor(module).flatMap(sm => this.visiblePermissionIdsFor(sm));
  }

  private allPermissionIdsForModule(module: PermissionModule): string[] {
    return this.subModulesFor(module).flatMap(sm => this.allPermissionIdsFor(sm));
  }

  isRowFullySelected(subModule: PermissionSubModule): boolean {
    const ids = this.visiblePermissionIdsFor(subModule);
    return ids.length > 0 && ids.every(id => this.isSelected(id));
  }

  isRowPartiallySelected(subModule: PermissionSubModule): boolean {
    const ids = this.visiblePermissionIdsFor(subModule);
    return ids.some(id => this.isSelected(id)) && !this.isRowFullySelected(subModule);
  }

  toggleRowSelectAll(subModule: PermissionSubModule): void {
    this.permissionsTouched.set(true);
    const current = new Set(this.selectedPermissionIds());
    if (this.isRowFullySelected(subModule)) {
      this.allPermissionIdsFor(subModule).forEach(id => current.delete(id));
    } else {
      this.visiblePermissionIdsFor(subModule).forEach(id => current.add(id));
    }
    this.selectedPermissionIds.set(current);
  }

  isModuleFullySelected(module: PermissionModule): boolean {
    const ids = this.visiblePermissionIdsForModule(module);
    return ids.length > 0 && ids.every(id => this.isSelected(id));
  }

  isModulePartiallySelected(module: PermissionModule): boolean {
    const ids = this.visiblePermissionIdsForModule(module);
    return ids.some(id => this.isSelected(id)) && !this.isModuleFullySelected(module);
  }

  toggleModuleSelectAll(module: PermissionModule): void {
    this.permissionsTouched.set(true);
    const current = new Set(this.selectedPermissionIds());
    if (this.isModuleFullySelected(module)) {
      this.allPermissionIdsForModule(module).forEach(id => current.delete(id));
    } else {
      this.visiblePermissionIdsForModule(module).forEach(id => current.add(id));
    }
    this.selectedPermissionIds.set(current);
  }

  togglePermission(permissionId: string): void {
    this.permissionsTouched.set(true);
    const current = new Set(this.selectedPermissionIds());
    const perm = this.permissionService.permissions().find(p => p.id === permissionId);

    if (current.has(permissionId)) {
      current.delete(permissionId);
      // Unchecking View also clears any other action already selected for this sub-module,
      // since Create/Edit/Delete/Change Status can't be meaningfully granted without View.
      if (perm?.action === 'View') {
        this.permissionService.permissions()
          .filter(p => p.subModule === perm.subModule && p.action !== 'View')
          .forEach(p => current.delete(p.id));
      }
    } else {
      current.add(permissionId);
    }
    this.selectedPermissionIds.set(current);
  }

  clearForm(): void {
    this.form.reset({ status: 'Active' });
    this.selectedPermissionIds.set(new Set());
    this.permissionsTouched.set(false);
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/administration/manage-roles']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);
    this.permissionsTouched.set(true);

    const noPermissionsSelected = this.selectedPermissionIds().size === 0;

    if (this.form.invalid || noPermissionsSelected) {
      getValidationToastMessages(this.form, {}).forEach(msg => this.toast.error(msg));
      if (noPermissionsSelected) {
        this.toast.error('Select at least one permission.');
      }
      return;
    }

    const v = this.form.value as any;
    if (this.roleService.isDuplicateName(v.roleName, this.roleId() ?? undefined)) {
      this.toast.error('A role with this name already exists.');
      return;
    }

    const payload = { ...v, permissionIds: [...this.selectedPermissionIds()] };

    if (this.isEditMode() && this.roleId()) {
      await this.roleService.update(this.roleId()!, payload);
      this.toast.success('Role updated!');
    } else {
      await this.roleService.create(payload);
      this.toast.success('Role submitted!');
    }

    this.router.navigate(['/administration/manage-roles']);
  }
}
