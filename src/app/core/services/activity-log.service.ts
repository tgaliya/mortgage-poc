import { Injectable, inject, signal } from '@angular/core';
import { supabase } from '../supabase/supabase-client';
import { ActivityLogEntry } from '../models/activity-log.model';
import { LoadingService } from './loading.service';

@Injectable({ providedIn: 'root' })
export class ActivityLogService {
  private loading = inject(LoadingService);

  readonly activityLog = signal<ActivityLogEntry[]>([]);

  constructor() {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.loading.show();
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load activity log:', error.message);
        return;
      }
      this.activityLog.set((data ?? []).map(this.fromRow));
    } finally {
      this.loading.hide();
    }
  }

  /** Append-only - audit log entries are never edited or deleted, even by admins. */
  async log(entry: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase.from('activity_log').insert(this.toRow(entry));
    if (error) {
      console.error('Failed to write activity log entry:', error.message);
      return;
    }
    await this.refresh();
  }

  private toRow(e: Omit<ActivityLogEntry, 'id' | 'createdAt'>): Record<string, any> {
    return {
      actor_user_id: e.actorUserId,
      actor_name: e.actorName,
      action: e.action,
      entity_type: e.entityType,
      entity_id: e.entityId ?? null,
      entity_label: e.entityLabel ?? null
    };
  }

  private fromRow(row: any): ActivityLogEntry {
    return {
      id: row.id,
      actorUserId: row.actor_user_id ?? null,
      actorName: row.actor_name,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id ?? undefined,
      entityLabel: row.entity_label ?? undefined,
      createdAt: row.created_at
    };
  }
}
