import { eq } from 'drizzle-orm';
import { Elysia, t } from 'elysia';
import { broadcast } from '../broadcast';
import { db } from '../db';
import { authMiddleware } from '../middleware/auth';
import { authorizeTrip } from '../middleware/authorize';
import { shareSettings } from '../schema';
import { sharePermissionSchema } from '../validators';

function generatePassphrase(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // 紛らわしい文字を除外 (0/O, 1/I/L)
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

async function generateUniquePassphrase(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const passphrase = generatePassphrase();
    const [existing] = await db
      .select({ id: shareSettings.id })
      .from(shareSettings)
      .where(eq(shareSettings.shareToken, passphrase));
    if (!existing) return passphrase;
  }
  throw new Error('Failed to generate unique passphrase');
}

export const shareSettingsRoutes = new Elysia({
  prefix: '/trips/:tripId/share',
})
  .use(authMiddleware)

  // GET /trips/:tripId/share - Get share settings for a trip
  .get(
    '/',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage share settings' };
      }

      const [setting] = await db
        .select()
        .from(shareSettings)
        .where(eq(shareSettings.tripId, params.tripId));
      if (!setting) {
        set.status = 404;
        return { error: 'Share settings not found' };
      }
      return setting;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  )

  // POST /trips/:tripId/share - Create share settings with generated token
  .post(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage share settings' };
      }

      const shareToken = await generateUniquePassphrase();

      const [created] = await db
        .insert(shareSettings)
        .values({
          tripId: params.tripId,
          shareUrl: null,
          shareToken,
          permission: body.permission ?? 'view',
          createdBy: user.id,
        })
        .returning();
      broadcast(params.tripId, { type: 'INSERT', table: 'share_settings', record: created });
      set.status = 201;
      return created;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        permission: t.Optional(sharePermissionSchema),
      }),
    },
  )

  // PUT /trips/:tripId/share - Update share settings
  .put(
    '/',
    async ({ params, body, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage share settings' };
      }

      const updateData: Record<string, unknown> = {};
      if (body.permission !== undefined) updateData.permission = body.permission;
      if (body.isActive !== undefined) updateData.isActive = body.isActive;

      const [updated] = await db
        .update(shareSettings)
        .set(updateData)
        .where(eq(shareSettings.tripId, params.tripId))
        .returning();
      if (!updated) {
        set.status = 404;
        return { error: 'Share settings not found' };
      }
      broadcast(params.tripId, { type: 'UPDATE', table: 'share_settings', record: updated });
      return updated;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
      body: t.Object({
        permission: t.Optional(sharePermissionSchema),
        isActive: t.Optional(t.Boolean()),
      }),
    },
  )

  // DELETE /trips/:tripId/share - Delete share settings
  .delete(
    '/',
    async ({ params, user, set }) => {
      const auth = await authorizeTrip(user.id, params.tripId, 'owner');
      if (!auth.authorized) {
        set.status = 403;
        return { error: 'Only the trip owner can manage share settings' };
      }

      const [deleted] = await db
        .delete(shareSettings)
        .where(eq(shareSettings.tripId, params.tripId))
        .returning();
      if (!deleted) {
        set.status = 404;
        return { error: 'Share settings not found' };
      }
      broadcast(params.tripId, { type: 'DELETE', table: 'share_settings', record: deleted });
      set.status = 204;
    },
    {
      params: t.Object({
        tripId: t.String(),
      }),
    },
  );
