import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { tripMembers, trips } from '../schema';

export const tripsRoutes = new Elysia({ prefix: '/trips' })
  .use(authMiddleware)

  // GET /trips - List trips for the authenticated user
  .get('/', async ({ user }) => {
    return await db
      .select({
        id: trips.id,
        title: trips.title,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        memberCount: trips.memberCount,
        memo: trips.memo,
        ownerId: trips.ownerId,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
        role: tripMembers.role,
      })
      .from(trips)
      .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(eq(tripMembers.userId, user.id))
      .orderBy(trips.createdAt);
  })

  // POST /trips - Create a trip
  .post(
    '/',
    async ({ body, user, set }) => {
      const [created] = await db
        .insert(trips)
        .values({ ...body, ownerId: user.id })
        .returning();

      // Add creator as owner member
      await db.insert(tripMembers).values({
        tripId: created.id,
        userId: user.id,
        role: 'owner',
      });

      broadcast(created.id, { type: 'INSERT', table: 'trips', record: created });
      set.status = 201;
      return created;
    },
    {
      body: t.Object({
        title: t.String(),
        destination: t.String(),
        startDate: t.String(),
        endDate: t.String(),
        memberCount: t.Optional(t.Number({ minimum: 1 })),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // GET /trips/:tripId - Get a trip by ID
  .get(
    '/:tripId',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [trip] = await db.select().from(trips).where(eq(trips.id, params.tripId));
      if (!trip) {
        set.status = 404;
        return { error: 'Trip not found' };
      }
      return trip;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  )

  // PUT /trips/:tripId - Update a trip
  .put(
    '/:tripId',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [updated] = await db
        .update(trips)
        .set(body)
        .where(eq(trips.id, params.tripId))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Trip not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'trips', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String()),
        destination: t.Optional(t.String()),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        memberCount: t.Optional(t.Number({ minimum: 1 })),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // DELETE /trips/:tripId - Delete a trip
  .delete(
    '/:tripId',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can delete a trip' };
      }

      const [deleted] = await db.delete(trips).where(eq(trips.id, params.tripId)).returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Trip not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'trips', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  );
