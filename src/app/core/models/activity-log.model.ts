export type ActivityAction = 'Create' | 'Update' | 'Delete' | 'Login' | 'Logout';

export interface ActivityLogEntry {
  id: string;
  actorUserId: string | null;
  actorName: string;
  action: ActivityAction;
  entityType: string;
  entityId?: string;
  entityLabel?: string;
  createdAt: string;
}
