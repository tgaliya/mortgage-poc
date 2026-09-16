import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';

@Component({
  selector: 'app-no-access',
  standalone: true,
  templateUrl: './no-access.component.html',
  styleUrl: './no-access.component.scss'
})
export class NoAccessComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);

  goToProfile(): void {
    this.router.navigate(['/my-profile']);
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmDialog.confirm(
      'You will be signed out of your account. Are you sure you want to continue?',
      'Confirm Logout',
      'Logout',
      'Cancel'
    );
    if (!confirmed) {
      return;
    }
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
