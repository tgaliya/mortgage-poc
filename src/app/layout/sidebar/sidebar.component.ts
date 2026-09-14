import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NAV_MODULES, NavModule } from './nav-config';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  modules = NAV_MODULES;
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

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
