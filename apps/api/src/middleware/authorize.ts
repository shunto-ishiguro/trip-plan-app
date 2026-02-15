import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { tripMembers } from '../schema';

type TripRole = 'owner' | 'editor' | 'viewer';

const ROLE_HIERARCHY: Record<TripRole, number> = {
  owner: 3,
  editor: 2,
  viewer: 1,
};

export async function authorizeTrip(
  userId: string,
  tripId: string,
  requiredRole: TripRole,
): Promise<{ authorized: true; role: TripRole } | { authorized: false; role: null }> {
  const [member] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

  if (!member) {
    return { authorized: false, role: null };
  }

  const hasAccess = ROLE_HIERARCHY[member.role] >= ROLE_HIERARCHY[requiredRole];
  if (!hasAccess) {
    return { authorized: false, role: null };
  }

  return { authorized: true, role: member.role };
}
