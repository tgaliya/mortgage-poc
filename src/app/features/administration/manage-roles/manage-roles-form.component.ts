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
  PermissionModule,
  PermissionSubModule
} from '../../../core/models/permission.model';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

@Component({
  selector: 'app-manage-roles-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
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

  togglePermission(permissionId: string): void {
    this.permissionsTouched.set(true);
    const current = new Set(this.selectedPermissionIds());
    if (current.has(permissionId)) {
      current.delete(permissionId);
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
