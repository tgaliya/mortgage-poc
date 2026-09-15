import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAV_MODULES, NavModule } from './nav-config';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../core/services/confirm-dialog.service';
import { AccessControlService } from '../../core/services/access-control.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private router = inject(Router);
  private auth = inject(AuthService);
  private confirmDialog = inject(ConfirmDialogService);
  private accessControl = inject(AccessControlService);

  modules = NAV_MODULES;

  /**
   * Dashboard is intentionally never permission-gated. Every other module
   * shows only the sub-items the current user's role can View, and the
   * parent module itself only if at least one sub-item survives.
   */
  visibleModules = computed<NavModule[]>(() =>
    this.modules
      .map(module => {
        if (module.path) {
          return module;
        }
        const visibleSubModules = (module.subModules ?? []).filter(sm =>
          this.accessControl.hasPermission(sm.label as any, 'View')
        );
        return visibleSubModules.length > 0 ? { ...module, subModules: visibleSubModules } : null;
      })
      .filter((m): m is NavModule => m !== null)
  );

  expandedModule = signal<string | null>(null);
  currentUrl = signal<string>(this.router.url);

  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.currentUrl.set(this.router.url);
      // Auto-expand the module containing the active route, per active-state rule
      const active = this.modules.find(m =>
        m.subModules?.some(sm => this.currentUrl().startsWith(sm.path))
      );
      if (active) {
        this.expandedModule.set(active.label);
      }
    });
  }

  toggleModule(module: NavModule): void {
    if (!module.subModules) {
      return;
    }
    // Accordion: expanding one auto-collapses any other expanded module
    this.expandedModule.set(this.expandedModule() === module.label ? null : module.label);
  }

  isExpanded(module: NavModule): boolean {
    return this.expandedModule() === module.label;
  }

  isActiveModule(module: NavModule): boolean {
    if (module.path) {
      return this.currentUrl().startsWith(module.path);
    }
    return !!module.subModules?.some(sm => this.currentUrl().startsWith(sm.path));
  }

  isActiveSubModule(path: string): boolean {
    return this.currentUrl().startsWith(path);
  }

  collapse(): void {
    this.expandedModule.set(null);
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
