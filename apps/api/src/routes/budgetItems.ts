import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { budgetItems } from '../schema';
import { budgetCategorySchema, pricingTypeSchema } from '../validators';

export const budgetItemsRoutes = new Elysia({
  prefix: '/trips/:tripId/budget-items',
})
  .use(authMiddleware)

  // GET /trips/:tripId/budget-items - List budget items
  .get(
    '/',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      return await db.select().from(budgetItems).where(eq(budgetItems.tripId, params.tripId));
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  )

  // POST /trips/:tripId/budget-items - Create a budget item
  .post(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [created] = await db
        .insert(budgetItems)
        .values({ ...body, tripId: params.tripId })
        .returning();
      broadcast(params.tripId, { type: 'INSERT', table: 'budget_items', record: created });
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        category: budgetCategorySchema,
        name: t.String(),
        amount: t.Number(),
        pricingType: pricingTypeSchema,
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // PUT /trips/:tripId/budget-items/:id - Update a budget item
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [updated] = await db
        .update(budgetItems)
        .set(body)
        .where(and(eq(budgetItems.tripId, params.tripId), eq(budgetItems.id, params.id)))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Budget item not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'budget_items', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
      body: t.Object({
        category: t.Optional(budgetCategorySchema),
        name: t.Optional(t.String()),
        amount: t.Optional(t.Number()),
        pricingType: t.Optional(pricingTypeSchema),
        memo: t.Optional(t.Union([t.String(), t.Null()])),
      }),
    },
  )

  // DELETE /trips/:tripId/budget-items/:id - Delete a budget item
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [deleted] = await db
        .delete(budgetItems)
        .where(and(eq(budgetItems.tripId, params.tripId), eq(budgetItems.id, params.id)))
        .returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Budget item not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'budget_items', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  );
