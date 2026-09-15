import { Injectable, inject, signal } from '@angular/core';
import { UserService } from './user.service';
import { ActivityLogService } from './activity-log.service';
import { CURRENT_USER_ID_KEY } from '../auth-storage-keys';

export type CredentialCheckResult = 'ok' | 'not-found' | 'wrong-password' | 'inactive';

/**
 * Auth is backed by the Manage Users table (see AppUser). Passwords are
 * stored as plain text - this app has no backend server to hash them
 * against, so this is POC-only, same spirit as the permissive RLS
 * policies in supabase-schema.sql.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private userService = inject(UserService);
  private activityLog = inject(ActivityLogService);

  private readonly STORAGE_KEY = 'mortgage_poc_authenticated';
  private readonly USER_ID_KEY = CURRENT_USER_ID_KEY;

  readonly isAuthenticated = signal<boolean>(this.readStoredAuth());
  readonly currentUserId = signal<string | null>(sessionStorage.getItem(this.USER_ID_KEY));

  private readStoredAuth(): boolean {
    return sessionStorage.getItem(this.STORAGE_KEY) === 'true';
  }

  validateEmailFormat(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async validateEmailExists(email: string): Promise<boolean> {
    await this.userService.refresh();
    return !!this.userService.getByEmail(email);
  }

  async checkCredentials(email: string, password: string): Promise<CredentialCheckResult> {
    await this.userService.refresh();
    const user = this.userService.getByEmail(email);
    if (!user) {
      return 'not-found';
    }
    if (user.password !== password) {
      return 'wrong-password';
    }
    if (user.status !== 'Active') {
      return 'inactive';
    }
    return 'ok';
  }

  completeLogin(userId: string): void {
    sessionStorage.setItem(this.STORAGE_KEY, 'true');
    sessionStorage.setItem(this.USER_ID_KEY, userId);
    this.isAuthenticated.set(true);
    this.currentUserId.set(userId);

    const user = this.userService.getById(userId);
    this.activityLog.log({
      actorUserId: userId,
      actorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      action: 'Login',
      entityType: 'Auth'
    });
  }

  logout(): void {
    const userId = this.currentUserId();
    const user = userId ? this.userService.getById(userId) : undefined;

    sessionStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem(this.USER_ID_KEY);
    this.isAuthenticated.set(false);
    this.currentUserId.set(null);

    this.activityLog.log({
      actorUserId: userId,
      actorName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      action: 'Logout',
      entityType: 'Auth'
    });
  }
}
