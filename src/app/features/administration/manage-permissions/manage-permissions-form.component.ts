import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../core/services/permission.service';
import { ToastService } from '../../../core/services/toast.service';
import { PERMISSION_SUB_MODULES, PERMISSION_ACTIONS, SUB_MODULE_TO_MODULE, PermissionSubModule } from '../../../core/models/permission.model';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

@Component({
  selector: 'app-manage-permissions-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './manage-permissions-form.component.html'
})
export class ManagePermissionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private permissionService = inject(PermissionService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  permissionId = signal<string | null>(null);
  submitted = signal(false);
  subModules = PERMISSION_SUB_MODULES;
  actions = PERMISSION_ACTIONS;
  derivedModule = signal('');
  private nameManuallyEdited = false;

  form = this.fb.group({
    subModule: ['', [Validators.required]],
    action: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: ['']
  });

  ngOnInit(): void {
    this.form.controls.subModule.valueChanges.subscribe(sm => {
      this.derivedModule.set(sm ? SUB_MODULE_TO_MODULE[sm as PermissionSubModule] : '');
      this.updateSuggestedName();
    });
    this.form.controls.action.valueChanges.subscribe(() => this.updateSuggestedName());
    this.form.controls.name.valueChanges.subscribe(() => (this.nameManuallyEdited = true));

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.permissionId.set(id);
      const permission = this.permissionService.getById(id);
      if (permission) {
        this.form.patchValue({
          subModule: permission.subModule,
          action: permission.action,
          name: permission.name,
          description: permission.description
        });
        this.derivedModule.set(permission.module);
        this.nameManuallyEdited = true;
      }
    }
  }

  get f() {
    return this.form.controls;
  }

  private updateSuggestedName(): void {
    if (this.nameManuallyEdited) {
      return;
    }
    const { subModule, action } = this.form.value;
    if (subModule && action) {
      this.form.controls.name.setValue(`${action} ${subModule}`, { emitEvent: false });
    }
  }

  clearForm(): void {
    this.form.reset();
    this.derivedModule.set('');
    this.nameManuallyEdited = false;
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/administration/manage-permissions']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, {}).forEach(msg => this.toast.error(msg));
      return;
    }

    const v = this.form.value as any;
    if (this.permissionService.isDuplicate(v.subModule, v.action, this.permissionId() ?? undefined)) {
      this.toast.error('A permission for this Sub Module + Action already exists.');
      return;
    }

    const payload = { ...v, module: this.derivedModule() };

    if (this.isEditMode() && this.permissionId()) {
      await this.permissionService.update(this.permissionId()!, payload);
      this.toast.success('Permission updated!');
    } else {
      await this.permissionService.create(payload);
      this.toast.success('Permission submitted!');
    }

    this.router.navigate(['/administration/manage-permissions']);
  }
}
