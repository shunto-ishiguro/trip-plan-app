import { cors } from '@elysiajs/cors';
import { Elysia } from 'elysia';

const port = process.env.PORT ?? 3000;

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .group('/api/v1', (app) => app.get('/', () => ({ message: 'Trip Plan API' })))
  .listen(port);

console.log(`API server running at http://localhost:${port}`);

export type App = typeof app;
