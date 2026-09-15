import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';

/** Resolves the currently logged-in user's id + display name, for activity log entries. */
export function resolveCurrentActor(auth: AuthService, userService: UserService): { actorUserId: string | null; actorName: string } {
  const actorUserId = auth.currentUserId();
  const actor = actorUserId ? userService.getById(actorUserId) : undefined;
  return { actorUserId, actorName: actor ? `${actor.firstName} ${actor.lastName}` : 'Unknown' };
}
