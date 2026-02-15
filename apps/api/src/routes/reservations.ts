import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { reservations } from '../schema';
import { reservationTypeSchema } from '../validators';

export const reservationsRoutes = new Elysia({
  prefix: '/trips/:tripId/reservations',
})
  .use(authMiddleware)

  // GET /trips/:tripId/reservations - List reservations
  .get(
    '/',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      return await db.select().from(reservations).where(eq(reservations.tripId, params.tripId));
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  )

  // POST /trips/:tripId/reservations - Create a reservation
  .post(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [created] = await db
        .insert(reservations)
        .values({ ...body, tripId: params.tripId })
        .returning();
      broadcast(params.tripId, { type: 'INSERT', table: 'reservations', record: created });
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        type: reservationTypeSchema,
        name: t.String(),
        confirmationNumber: t.Optional(t.Union([t.String(), t.Null()])),
        datetime: t.Optional(t.Union([t.String(), t.Null()])),
        link: t.Optional(t.Union([t.String(), t.Null()])),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // PUT /trips/:tripId/reservations/:id - Update a reservation
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [updated] = await db
        .update(reservations)
        .set(body)
        .where(and(eq(reservations.tripId, params.tripId), eq(reservations.id, params.id)))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Reservation not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'reservations', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
      body: t.Object({
        type: t.Optional(reservationTypeSchema),
        name: t.Optional(t.String()),
        confirmationNumber: t.Optional(t.Union([t.String(), t.Null()])),
        datetime: t.Optional(t.Union([t.String(), t.Null()])),
        link: t.Optional(t.Union([t.String(), t.Null()])),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // DELETE /trips/:tripId/reservations/:id - Delete a reservation
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [deleted] = await db
        .delete(reservations)
        .where(and(eq(reservations.tripId, params.tripId), eq(reservations.id, params.id)))
        .returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Reservation not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'reservations', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  );
