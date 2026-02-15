import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { shareSettings, tripMembers, trips } from '../schema';

export const shareJoinRoutes = new Elysia({ prefix: '/share' })
  .use(authMiddleware)

  // GET /share/preview/:token - Preview trip info before joining
  .get(
    '/preview/:token',
    async ({ params, set }) => {
      const [setting] = await db
        .select({
          tripId: shareSettings.tripId,
          permission: shareSettings.permission,
          isActive: shareSettings.isActive,
          tripTitle: trips.title,
          tripDestination: trips.destination,
          tripStartDate: trips.startDate,
          tripEndDate: trips.endDate,
        })
        .from(shareSettings)
        .innerJoin(trips, eq(shareSettings.tripId, trips.id))
        .where(eq(shareSettings.shareToken, params.token));

      if (!setting || !setting.isActive) {
        set.status = 404;
        return { error: 'Share link not found or inactive' };
      }

      return {
        tripId: setting.tripId,
        title: setting.tripTitle,
        destination: setting.tripDestination,
        startDate: setting.tripStartDate,
        endDate: setting.tripEndDate,
        permission: setting.permission,
      };
    },
    {
      params: t.Object({
        token: t.String(),
      }),
    },
  )

  // POST /share/join - Join a trip via share token
  .post(
    '/join',
    async ({ body, user, set }) => {
      const [setting] = await db
        .select()
        .from(shareSettings)
        .where(eq(shareSettings.shareToken, body.token));

      if (!setting || !setting.isActive) {
        set.status = 404;
        return { error: 'Share link not found or inactive' };
      }

      const role = setting.permission === 'edit' ? 'editor' : 'viewer';

      const [member] = await db
        .insert(tripMembers)
        .values({
          tripId: setting.tripId,
          userId: user.id,
          role,
        })
        .onConflictDoNothing({ target: [tripMembers.tripId, tripMembers.userId] })
        .returning();

      if (!member) {
        // User is already a member
        return { message: 'Already a member of this trip', tripId: setting.tripId };
      }

      set.status = 201;
      return { message: 'Joined trip successfully', tripId: setting.tripId, role: member.role };
    },
    {
      body: t.Object({
        token: t.String(),
      }),
    },
  );
