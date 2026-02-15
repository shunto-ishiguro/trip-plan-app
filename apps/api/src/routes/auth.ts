import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables',
  );
}

const SUPABASE_URL: string = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function supabaseAuthFetch(path: string, body: object) {
  return fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify(body),
  });
}

// 認証エンドポイント: 15分間に10回まで
const authRateLimit = rateLimit({ max: 10, windowMs: 15 * 60 * 1000 });

export const authRoutes = new Elysia({ prefix: '/auth' })
  .use(authRateLimit)
  // POST /auth/signup
  .post(
    '/signup',
    async ({ body, set }) => {
      // Admin create user (auto-confirm email)
      const createRes = await supabaseAuthFetch('/admin/users', {
        email: body.email,
        password: body.password,
        email_confirm: true,
      });

      if (!createRes.ok) {
        const err = await createRes.json();
        set.status = 400;
        return { error: (err as { message?: string }).message ?? 'Signup failed' };
      }

      const user = await createRes.json();

      // Sign in to get session tokens
      const loginRes = await supabaseAuthFetch('/token?grant_type=password', {
        email: body.email,
        password: body.password,
      });

      if (!loginRes.ok) {
        set.status = 400;
        return { error: 'User created but login failed' };
      }

      const session = await loginRes.json();

      set.status = 201;
      return { user, session };
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    },
  )

  // POST /auth/login
  .post(
    '/login',
    async ({ body, set }) => {
      const res = await supabaseAuthFetch('/token?grant_type=password', {
        email: body.email,
        password: body.password,
      });

      if (!res.ok) {
        set.status = 401;
        return { error: 'Invalid email or password' };
      }

      return await res.json();
    },
    {
      body: t.Object({
        email: t.String(),
        password: t.String(),
      }),
    },
  )

  // POST /auth/refresh
  .post(
    '/refresh',
    async ({ body, set }) => {
      const res = await supabaseAuthFetch('/token?grant_type=refresh_token', {
        refresh_token: body.refreshToken,
      });

      if (!res.ok) {
        set.status = 401;
        return { error: 'Invalid refresh token' };
      }

      return await res.json();
    },
    {
      body: t.Object({
        refreshToken: t.String(),
      }),
    },
  )

  // GET /auth/me
  .use(authMiddleware)
  .get('/me', ({ user }) => {
    return { id: user.id, email: user.email };
  });
