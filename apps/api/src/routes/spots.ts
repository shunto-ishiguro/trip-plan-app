import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { spots } from '../schema';

export const spotsRoutes = new Elysia({ prefix: '/trips/:tripId/spots' })
  .use(authMiddleware)

  // GET /trips/:tripId/spots - List spots (optional ?dayIndex=N filter)
  .get(
    '/',
    async ({ params, query, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const conditions = [eq(spots.tripId, params.tripId)];
      if (query.dayIndex !== undefined) {
        conditions.push(eq(spots.dayIndex, query.dayIndex));
      }
      return await db
        .select()
        .from(spots)
        .where(and(...conditions))
        .orderBy(spots.dayIndex, spots.order);
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      query: t.Object({
        dayIndex: t.Optional(t.Number()),
      }),
    },
  )

  // POST /trips/:tripId/spots - Create a spot
  .post(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [created] = await db
        .insert(spots)
        .values({ ...body, tripId: params.tripId })
        .returning();
      broadcast(params.tripId, { type: 'INSERT', table: 'spots', record: created });
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        dayIndex: t.Number(),
        order: t.Number(),
        name: t.String(),
        address: t.Optional(t.Union([t.String(), t.Null()])),
        startTime: t.Optional(t.Union([t.String(), t.Null()])),
        endTime: t.Optional(t.Union([t.String(), t.Null()])),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
        latitude: t.Optional(t.Union([t.Number(), t.Null()])),
        longitude: t.Optional(t.Union([t.Number(), t.Null()])),
      }),
    },
  )

  // GET /trips/:tripId/spots/:id - Get a spot by ID
  .get(
    '/:id',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [spot] = await db
        .select()
        .from(spots)
        .where(and(eq(spots.tripId, params.tripId), eq(spots.id, params.id)));
      if (!spot) {
        set.status = 404;
        return { error: 'Spot not found' };
      }
      return spot;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  )

  // PUT /trips/:tripId/spots/:id - Update a spot
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [updated] = await db
        .update(spots)
        .set(body)
        .where(and(eq(spots.tripId, params.tripId), eq(spots.id, params.id)))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Spot not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'spots', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
      body: t.Object({
        dayIndex: t.Optional(t.Number()),
        order: t.Optional(t.Number()),
        name: t.Optional(t.String()),
        address: t.Optional(t.Union([t.String(), t.Null()])),
        startTime: t.Optional(t.Union([t.String(), t.Null()])),
        endTime: t.Optional(t.Union([t.String(), t.Null()])),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
        latitude: t.Optional(t.Union([t.Number(), t.Null()])),
        longitude: t.Optional(t.Union([t.Number(), t.Null()])),
      }),
    },
  )

  // DELETE /trips/:tripId/spots/:id - Delete a spot
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [deleted] = await db
        .delete(spots)
        .where(and(eq(spots.tripId, params.tripId), eq(spots.id, params.id)))
        .returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Spot not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'spots', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  );
