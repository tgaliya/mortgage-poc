import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { Role } from '../models/role.model';
import { LoadingService } from './loading.service';
import { ActivityLogService } from './activity-log.service';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { resolveCurrentActor } from '../../shared/utils/activity-actor.util';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private loading = inject(LoadingService);
  private activityLog = inject(ActivityLogService);
  private auth = inject(AuthService);
  private userService = inject(UserService);

  readonly roles = signal<Role[]>([]);

  /** Resolves once the initial load completes - guards await this to avoid racing the first fetch. */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.show();
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load roles:', error.message);
        return;
      }
      this.roles.set((data ?? []).map(this.fromRow));
    } finally {
      this.loading.hide();
    }
  }

  getById(id: string): Role | undefined {
    return this.roles().find(r => r.id === id);
  }

  isDuplicateName(roleName: string, excludeId?: string): boolean {
    const needle = roleName.trim().toLowerCase();
    return this.roles().some(r => r.roleName.trim().toLowerCase() === needle && r.id !== excludeId);
  }

  /** How many roles currently include this permission id - used to block deleting a permission still in use. */
  countRolesUsingPermission(permissionId: string): number {
    return this.roles().filter(r => r.permissionIds.includes(permissionId)).length;
  }

  async create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role | null> {
    this.loading.show();
    try {
      const { data, error } = await supabase.from('roles').insert(this.toRow(role)).select().single();
      if (error) {
        console.error('Failed to create role:', error.message);
        return null;
      }
      await this.refresh();
      const created = this.fromRow(data);
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Create',
        entityType: 'Manage Roles',
        entityId: created.id,
        entityLabel: created.roleName
      });
      return created;
    } finally {
      this.loading.hide();
    }
  }

  async update(id: string, changes: Partial<Role>): Promise<void> {
    this.loading.show();
    try {
      const { error } = await supabase.from('roles').update(this.toRow(changes)).eq('id', id);
      if (error) {
        console.error('Failed to update role:', error.message);
        return;
      }
      const label = this.getById(id);
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Update',
        entityType: 'Manage Roles',
        entityId: id,
        entityLabel: label?.roleName
      });
    } finally {
      this.loading.hide();
    }
  }

  async delete(id: string): Promise<void> {
    this.loading.show();
    try {
      const label = this.getById(id);
      const { error } = await supabase.from('roles').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete role:', error.message);
        return;
      }
      await this.refresh();
      this.activityLog.log({
        ...resolveCurrentActor(this.auth, this.userService),
        action: 'Delete',
        entityType: 'Manage Roles',
        entityId: id,
        entityLabel: label?.roleName
      });
    } finally {
      this.loading.hide();
    }
  }

  private toRow(r: Partial<Role>): Record<string, any> {
    const row: Record<string, any> = {};
    if (r.roleName !== undefined) row['role_name'] = r.roleName;
    if (r.description !== undefined) row['description'] = r.description;
    if (r.status !== undefined) row['status'] = r.status;
    if (r.permissionIds !== undefined) row['permission_ids'] = r.permissionIds;
    return row;
  }

  private fromRow(row: any): Role {
    return {
      id: row.id,
      roleName: row.role_name,
      description: row.description ?? undefined,
      status: row.status,
      permissionIds: row.permission_ids ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
