import { Elysia, t } from 'elysia';
import { verifyJWT } from '../jwt';
import { authorizeTrip } from '../middleware/authorize';

export const wsRoutes = new Elysia().ws('/trips/:tripId/ws', {
  params: t.Object({
    tripId: t.String(),
  }),
  query: t.Object({
    token: t.String(),
  }),
  async open(ws) {
    const { tripId } = ws.data.params;
    const { token } = ws.data.query;

    try {
      const payload = await verifyJWT(token);
      if (!payload.sub) {
        ws.close(4001, 'Invalid token');
        return;
      }

      const auth = await authorizeTrip(payload.sub, tripId, 'viewer');
      if (!auth.authorized) {
        ws.close(4003, 'Access denied');
        return;
      }

      ws.subscribe(`trip:${tripId}`);
      ws.send(JSON.stringify({ type: 'connected', tripId }));
    } catch {
      ws.close(4001, 'Authentication failed');
    }
  },
  close(ws) {
    const { tripId } = ws.data.params;
    ws.unsubscribe(`trip:${tripId}`);
  },
  message() {
    // no-op: server-to-client only
  },
});
