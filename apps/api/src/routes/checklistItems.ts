import { and, eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { checklistItems } from '../schema';
import { checklistTypeSchema } from '../validators';

export const checklistItemsRoutes = new Elysia({
  prefix: '/trips/:tripId/checklist-items',
})
  .use(authMiddleware)

  // GET /trips/:tripId/checklist-items - List checklist items (optional ?type=packing|todo)
  .get(
    '/',
    async ({ params, query, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'viewer');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const conditions = [eq(checklistItems.tripId, params.tripId)];
      if (query.type) {
        conditions.push(eq(checklistItems.type, query.type));
      }
      return await db
        .select()
        .from(checklistItems)
        .where(and(...conditions));
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      query: t.Object({
        type: t.Optional(checklistTypeSchema),
      }),
    },
  )

  // POST /trips/:tripId/checklist-items - Create a checklist item
  .post(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [created] = await db
        .insert(checklistItems)
        .values({ ...body, tripId: params.tripId })
        .returning();
      broadcast(params.tripId, { type: 'INSERT', table: 'checklist_items', record: created });
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        type: checklistTypeSchema,
        text: t.String(),
        checked: t.Optional(t.Boolean()),
      }),
    },
  )

  // POST /trips/:tripId/checklist-items/batch - Batch create checklist items
  .post(
    '/batch',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const values = body.items.map(
        (item: { type: 'packing' | 'todo'; text: string; checked?: boolean }) => ({
          ...item,
          tripId: params.tripId,
        }),
      );
      const created = await db.insert(checklistItems).values(values).returning();
      for (const record of created) {
        broadcast(params.tripId, { type: 'INSERT', table: 'checklist_items', record });
      }
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        items: t.Array(
          t.Object({
            type: checklistTypeSchema,
            text: t.String(),
            checked: t.Optional(t.Boolean()),
          }),
        ),
      }),
    },
  )

  // PATCH /trips/:tripId/checklist-items/:id/toggle - Toggle checked status
  .patch(
    '/:id/toggle',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [item] = await db
        .select()
        .from(checklistItems)
        .where(and(eq(checklistItems.tripId, params.tripId), eq(checklistItems.id, params.id)));
      if (!item) {
        set.status = 404;
        return { error: 'Checklist item not found' };
      }
      const [updated] = await db
        .update(checklistItems)
        .set({ checked: !item.checked })
        .where(eq(checklistItems.id, params.id))
        .returning();
      broadcast(params.tripId, { type: 'UPDATE', table: 'checklist_items', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  )

  // PUT /trips/:tripId/checklist-items/:id - Update a checklist item
  .put(
    '/:id',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [updated] = await db
        .update(checklistItems)
        .set(body)
        .where(and(eq(checklistItems.tripId, params.tripId), eq(checklistItems.id, params.id)))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Checklist item not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'checklist_items', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
      body: t.Object({
        type: t.Optional(checklistTypeSchema),
        text: t.Optional(t.String()),
        checked: t.Optional(t.Boolean()),
      }),
    },
  )

  // DELETE /trips/:tripId/checklist-items/:id - Delete a checklist item
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'editor');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Access denied' };
      }

      const [deleted] = await db
        .delete(checklistItems)
        .where(and(eq(checklistItems.tripId, params.tripId), eq(checklistItems.id, params.id)))
        .returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Checklist item not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'checklist_items', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
        id: t.String(),
      }),
    },
  );
