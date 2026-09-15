import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AutofocusDirective } from '../../directives/autofocus.directive';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, AutofocusDirective],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  dialogService = inject(ConfirmDialogService);

  onYes(): void {
    this.dialogService.respond(true);
  }

  onNo(): void {
    this.dialogService.respond(false);
  }
}
