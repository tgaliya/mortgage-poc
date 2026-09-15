import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { AppUser } from '../models/user.model';
import { LoadingService } from './loading.service';
import { ActivityLogService } from './activity-log.service';
import { CURRENT_USER_ID_KEY } from '../auth-storage-keys';

@Injectable({ providedIn: 'root' })
export class UserService {
  private loading = inject(LoadingService);
  private activityLog = inject(ActivityLogService);

  readonly users = signal<AppUser[]>([]);

  /** Resolves once the initial load completes - guards await this to avoid racing the first fetch. */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.show();
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load users:', error.message);
        return;
      }
      this.users.set((data ?? []).map(this.fromRow));
    } finally {
      this.loading.hide();
    }
  }

  getById(id: string): AppUser | undefined {
    return this.users().find(u => u.id === id);
  }

  getByEmail(email: string): AppUser | undefined {
    const needle = email.trim().toLowerCase();
    return this.users().find(u => u.email.trim().toLowerCase() === needle);
  }

  isDuplicateEmail(email: string, excludeId?: string): boolean {
    const needle = email.trim().toLowerCase();
    return this.users().some(u => u.email.trim().toLowerCase() === needle && u.id !== excludeId);
  }

  countUsersWithRole(roleId: string): number {
    return this.users().filter(u => u.roleId === roleId).length;
  }

  /**
   * Reads sessionStorage directly (instead of injecting AuthService) to avoid a
   * circular dependency: AuthService already depends on UserService.
   */
  private currentActor(): { actorUserId: string | null; actorName: string } {
    const actorUserId = sessionStorage.getItem(CURRENT_USER_ID_KEY);
    const actor = actorUserId ? this.getById(actorUserId) : undefined;
    return { actorUserId, actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown' };
  }

  async create(user: Omit<AppUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppUser | null> {
    this.loading.show();
    try {
      const { data, error } = await supabase.from('users').insert(this.toRow(user)).select().single();
      if (error) {
        console.error('Failed to create user:', error.message);
        return null;
      }
      await this.refresh();
      const created = this.fromRow(data);
      this.activityLog.log({
        ...this.currentActor(),
        action: 'Create',
        entityType: 'Manage Users',
        entityId: created.id,
        entityLabel: `${created.firstName} ${created.lastName}`
      });
      return created;
    } finally {
      this.loading.hide();
    }
  }

  async update(id: string, changes: Partial<AppUser>): Promise<void> {
    this.loading.show();
    try {
      const { error } = await supabase.from('users').update(this.toRow(changes)).eq('id', id);
      if (error) {
        console.error('Failed to update user:', error.message);
        return;
      }
      const label = this.getById(id);
      await this.refresh();
      this.activityLog.log({
        ...this.currentActor(),
        action: 'Update',
        entityType: 'Manage Users',
        entityId: id,
        entityLabel: label ? `${label.firstName} ${label.lastName}` : undefined
      });
    } finally {
      this.loading.hide();
    }
  }

  async delete(id: string): Promise<void> {
    this.loading.show();
    try {
      const label = this.getById(id);
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) {
        console.error('Failed to delete user:', error.message);
        return;
      }
      await this.refresh();
      this.activityLog.log({
        ...this.currentActor(),
        action: 'Delete',
        entityType: 'Manage Users',
        entityId: id,
        entityLabel: label ? `${label.firstName} ${label.lastName}` : undefined
      });
    } finally {
      this.loading.hide();
    }
  }

  private toRow(u: Partial<AppUser>): Record<string, any> {
    const row: Record<string, any> = {};
    if (u.firstName !== undefined) row['first_name'] = u.firstName;
    if (u.lastName !== undefined) row['last_name'] = u.lastName;
    if (u.email !== undefined) row['email'] = u.email;
    if (u.phoneNumber !== undefined) row['phone_number'] = u.phoneNumber;
    if (u.password !== undefined) row['password'] = u.password;
    if (u.roleId !== undefined) row['role_id'] = u.roleId;
    if (u.status !== undefined) row['status'] = u.status;
    return row;
  }

  private fromRow(row: any): AppUser {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      phoneNumber: row.phone_number ?? undefined,
      password: row.password,
      roleId: row.role_id,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
