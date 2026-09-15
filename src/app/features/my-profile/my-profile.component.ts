import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';
import { ToastService } from '../../core/services/toast.service';
import { AutofocusDirective } from '../../shared/directives/autofocus.directive';
import { EnterSubmitDirective } from '../../shared/directives/enter-submit.directive';
import { getValidationToastMessages } from '../../shared/utils/form-validation.util';

const FIELD_ERROR_MESSAGES: Record<string, string> = {
  newPassword: 'New password must be at least 6 characters.'
};

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AutofocusDirective, EnterSubmitDirective],
  templateUrl: './my-profile.component.html'
})
export class MyProfileComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private toast = inject(ToastService);

  submitted = signal(false);

  currentUser = computed(() => {
    const id = this.auth.currentUserId();
    return id ? this.userService.getById(id) : undefined;
  });

  currentRoleName = computed(() => {
    const roleId = this.currentUser()?.roleId;
    return roleId ? this.roleService.getById(roleId)?.roleName : undefined;
  });

  form = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  get f() {
    return this.form.controls;
  }

  clearForm(): void {
    this.form.reset();
    this.submitted.set(false);
    this.toast.info('Form cleared successfully!');
  }

  async submit(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid) {
      getValidationToastMessages(this.form, FIELD_ERROR_MESSAGES).forEach(msg => this.toast.error(msg));
      return;
    }

    const user = this.currentUser();
    if (!user) {
      this.toast.error('Could not determine your account. Please log in again.');
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = this.form.value;

    if (currentPassword !== user.password) {
      this.toast.error('Current password is incorrect.');
      return;
    }
    if (newPassword !== confirmPassword) {
      this.toast.error('New password and confirmation do not match.');
      return;
    }

    await this.userService.update(user.id, { password: newPassword! });
    this.toast.success('Password updated!');
    this.form.reset();
    this.submitted.set(false);
  }
}
