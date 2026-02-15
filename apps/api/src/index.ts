import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';
import { setServer } from './broadcast';
import { authRoutes } from './routes/auth';
import { budgetItemsRoutes } from './routes/budgetItems';
import { checklistItemsRoutes } from './routes/checklistItems';
import { reservationsRoutes } from './routes/reservations';
import { shareJoinRoutes } from './routes/shareJoin';
import { shareSettingsRoutes } from './routes/shareSettings';
import { spotsRoutes } from './routes/spots';
import { tripMembersRoutes } from './routes/tripMembers';
import { tripsRoutes } from './routes/trips';
import { wsRoutes } from './routes/ws';

const port = process.env.PORT ?? 3000;

const app = new Elysia()
  .use(cors())
  .onAfterHandle(({ request, set }) => {
    console.log(`${request.method} ${new URL(request.url).pathname} ${set.status ?? 200}`);
  })
  .onError(({ code, error, set }) => {
    if (code === 'VALIDATION') {
      set.status = 400;
      return { error: 'Validation error', details: error.message };
    }
    console.error(error);
    set.status = 500;
    return { error: 'Internal server error' };
  })
  .get('/health', () => ({ status: 'ok' }))
  .group('/api/v1', (app) =>
    app
      .use(authRoutes)
      .use(shareJoinRoutes)
      .use(wsRoutes)
      .use(tripsRoutes)
      .use(tripMembersRoutes)
      .use(spotsRoutes)
      .use(budgetItemsRoutes)
      .use(checklistItemsRoutes)
      .use(reservationsRoutes)
      .use(shareSettingsRoutes),
  )
  .listen(port);

if (app.server) setServer(app.server);

console.log(`API server running at http://localhost:${port}`);

export type App = typeof app;
