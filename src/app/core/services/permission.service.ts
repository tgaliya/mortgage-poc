import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Permission } from '../models/permission.model';
import { LoadingService } from './loading.service';
import { ActivityLogService } from './activity-log.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { resolveCurrentActor } from '../../shared/utils/activity-actor.util';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private loading = inject(LoadingService);
  private activityLog = inject(ActivityLogService);
  private auth = inject(AuthService);
  private userService = inject(UserService);

  readonly permissions = signal<Permission[]>([]);

  /** Resolves once the initial load completes - guards await this to avoid racing the first fetch. */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.show();
    try {
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('module', { ascending: true })
        .order('sub_module', { ascending: true })
        .order('action', { ascending: true });

      if (error) {
        console.error('Failed to load permissions:', error.message);
        return;
      }
      this.permissions.set((data ?? []).map(this.fromRow));
    } finally {
      this.loading.hide();
    }
  }

  getById(id: string): Permission | undefined {
    return this.permissions().find(p => p.id === id);
  }

  /** True if a permission with the same Sub Module + Action already exists (optionally excluding one id, for edit-mode checks). */
  isDuplicate(subModule: string, action: string, excludeId?: string): boolean {
    return this.permissions().some(p => p.subModule === subModule && p.action === action && p.id !== excludeId);
  }

  async create(permission: Omit<Permission, 'id' | 'createdAt' | 'updatedAt'>): Promise<Permission | null> {
    this.loading.show();
    try {
      const { data, error } = await supabase.from('permissions').insert(this.toRow(permission)).select().single();
      if (error) {
        console.error('Failed to create permission:', error.message);
        return null;
      }
      await this.refresh();
      const created = this.fromRow(data);
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Create',
        entityType: 'Manage Permissions',
        entityId: created.id,
        entityLabel: created.name
      });
      return created;
    } finally {
      this.loading.hide();
    }
  }

  async update(id: string, changes: Partial<Permission>): Promise<void> {
    this.loading.show();
    try {
      const { error } = await supabase.from('permissions').update(this.toRow(changes)).eq('id', id);
      if (error) {
        console.error('Failed to update permission:', error.message);
        return;
      }
      const label = this.getById(id);
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Update',
        entityType: 'Manage Permissions',
        entityId: id,
        entityLabel: label?.name
      });
    } finally {
      this.loading.hide();
    }
  }

  async delete(id: string): Promise<void> {
    this.loading.show();
    try {
      const label = this.getById(id);
      const { error } = await supabase.from('permissions').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete permission:', error.message);
        return;
      }
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Delete',
        entityType: 'Manage Permissions',
        entityId: id,
        entityLabel: label?.name
      });
    } finally {
      this.loading.hide();
    }
  }

  private toRow(p: Partial<Permission>): Record<string, any> {
    const row: Record<string, any> = {};
    if (p.module !== undefined) row['module'] = p.module;
    if (p.subModule !== undefined) row['sub_module'] = p.subModule;
    if (p.action !== undefined) row['action'] = p.action;
    if (p.name !== undefined) row['name'] = p.name;
    if (p.description !== undefined) row['description'] = p.description;
    return row;
  }

  private fromRow(row: any): Permission {
    return {
      id: row.id,
      module: row.module,
      subModule: row.sub_module,
      action: row.action,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
