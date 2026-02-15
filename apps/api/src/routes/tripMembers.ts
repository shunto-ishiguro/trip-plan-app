import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { tripMembers } from '../schema';
import { tripRoleSchema } from '../validators';

export const tripMembersRoutes = new Elysia({ prefix: '/trips/:tripId/members' })
  .use(authMiddleware)

  // GET /trips/:tripId/members - List members
  .get(
    '/',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Not a member of this trip' };
      }

      return await db.select().from(tripMembers).where(eq(tripMembers.tripId, params.tripId));
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  )

  // PUT /trips/:tripId/members/:userId - Update member role
  .put(
    '/:userId',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage members' };
      }

      if (params.userId === user.id) {
        set.status = 400;
        return { error: 'Cannot change your own role' };
      }

      const [updated] = await db
        .update(tripMembers)
        .set({ role: body.role })
        .where(and(eq(tripMembers.tripId, params.tripId), eq(tripMembers.userId, params.userId)))
        .returning();

      if (!updated) {
        set.status = 404;
        return { error: 'Member not found' };
      }

      broadcast(params.tripId, { type: 'UPDATE', table: 'trip_members', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        userId: t.String(),
      }),
      body: t.Object({
        role: tripRoleSchema,
      }),
    },
  )

  // DELETE /trips/:tripId/members/:userId - Remove member
  .delete(
    '/:userId',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage members' };
      }

      if (params.userId === user.id) {
        set.status = 400;
        return { error: 'Cannot remove yourself from the trip' };
      }

      const [deleted] = await db
        .delete(tripMembers)
        .where(and(eq(tripMembers.tripId, params.tripId), eq(tripMembers.userId, params.userId)))
        .returning();

      if (!deleted) {
        set.status = 404;
        return { error: 'Member not found' };
      }

      broadcast(params.tripId, { type: 'DELETE', table: 'trip_members', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
        userId: t.String(),
      }),
    },
  );
