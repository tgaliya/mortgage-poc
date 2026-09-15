import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { AuthService } from '../../../core/services/auth.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { ToastService } from '../../../core/services/toast.service';
import { phoneValidator } from '../../../shared/validators/common-validators';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../../shared/utils/form-validation.util';

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  email: 'Enter a valid email address.',
  phoneNumber: 'Phone number must be exactly 10 digits.'
};

@Component({
  selector: 'app-manage-users-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './manage-users-form.component.html'
})
export class ManageUsersFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  roleService = inject(RoleService);
  private auth = inject(AuthService);
  private accessControl = inject(AccessControlService);
  private toast = inject(ToastService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  userId = signal<string | null>(null);
  submitted = signal(false);

  isSelf = computed(() => this.isEditMode() && this.userId() === this.auth.currentUserId());
  canChangeStatus = computed(() => this.accessControl.hasPermission('Manage Users', 'Change Status'));

  form = this.fb.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phoneNumber: ['', [phoneValidator()]],
    password: [''],
    roleId: ['', [Validators.required]],
    status: ['Active', [Validators.required]]
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.userId.set(id);
      const user = this.userService.getById(id);
      if (user) {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          roleId: user.roleId,
          status: user.status
        });
        const isSelfRecord = id === this.auth.currentUserId();
        const canChangeStatus = this.accessControl.hasPermission('Manage Users', 'Change Status');
        if (isSelfRecord || !canChangeStatus) {
          // Self-protection: cannot deactivate your own account.
          // Permission gate: Change Status is required to edit anyone's status.
          this.form.controls.status.disable();
        }
      }
    } else {
      this.form.controls.password.setValidators([Validators.required]);
      this.form.controls.password.updateValueAndValidity();
    }
  }

  get f() {
    return this.form.controls;
  }

  clearForm(): void {
    this.form.reset({ status: 'Active' });
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  cancel(): void {
    this.router.navigate(['/administration/manage-users']);
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, FIELD_ERROR_MESSAGES).forEach(msg => this.toast.error(msg));
      return;
    }

    const v = this.form.value as any;

    if (this.userService.isDuplicateEmail(v.email, this.userId() ?? undefined)) {
      this.toast.error('A user with this email already exists.');
      return;
    }

    const payload: any = { ...v };
    if (this.isEditMode() && !payload.password) {
      delete payload.password;
    }
    if (this.isSelf()) {
      // Belt-and-braces: never let a self-edit change status away from Active,
      // even if the disabled field's value somehow reached here.
      payload.status = 'Active';
    }

    if (this.isEditMode() && this.userId()) {
      await this.userService.update(this.userId()!, payload);
      this.toast.success('User updated!');
    } else {
      await this.userService.create(payload);
      this.toast.success('User submitted!');
    }

    this.router.navigate(['/administration/manage-users']);
  }
}
