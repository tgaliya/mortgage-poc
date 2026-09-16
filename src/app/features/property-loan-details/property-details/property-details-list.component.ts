import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmDialogService } from '../../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../../core/services/access-control.service';
import { Property } from '../../../core/models/property.model';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { matchesSearch } from '../../../shared/utils/search.util';

@Component({
  selector: 'app-property-details-list',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './property-details-list.component.html'
})
export class PropertyDetailsListComponent {
  propertyService = inject(PropertyService);
  private toast = inject(ToastService);
  private confirmDialog = inject(ConfirmDialogService);
  private router = inject(Router);
  private accessControl = inject(AccessControlService);

  searchTerm = signal('');
  filteredProperties = computed(() =>
    this.propertyService.properties().filter(p =>
      matchesSearch(this.searchTerm(), p.propertyName, p.streetAddress, p.city, p.state, p.county, p.zipCode, p.propertyStatus)
    )
  );
  openMenuId = signal<string | null>(null);
  canCreate = computed(() => this.accessControl.hasPermission('Property Details', 'Create'));
  canEdit = computed(() => this.accessControl.hasPermission('Property Details', 'Edit'));
  canDelete = computed(() => this.accessControl.hasPermission('Property Details', 'Delete'));
  hasRowActions = computed(() => this.canEdit() || this.canDelete());

  toggleMenu(id: string): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  addProperty(): void {
    this.router.navigate(['/property-loan-details/property-details/add']);
  }

  editProperty(property: Property): void {
    this.openMenuId.set(null);
    this.router.navigate(['/property-loan-details/property-details/edit', property.id]);
  }

  async deleteProperty(property: Property): Promise<void> {
    this.openMenuId.set(null);
    if (!this.canDelete()) {
      this.toast.error('You do not have permission to delete this record.');
      return;
    }
    const confirmed = await this.confirmDialog.confirm(
      'Are you sure you want to proceed with deletion? You cannot rollback this operation.'
    );
    if (confirmed) {
      await this.propertyService.delete(property.id);
      this.toast.success('Property Details deleted!');
    }
  }
}
