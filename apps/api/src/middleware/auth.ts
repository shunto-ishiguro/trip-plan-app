import { Elysia } from 'elysia';
import { type JWTPayload, verifyJWT } from '../jwt';

export const authMiddleware = new Elysia({ name: 'auth' })
  .derive(async ({ headers, set }): Promise<{ user: { id: string; email?: string } }> => {
    const authorization = headers.authorization;
    if (!authorization?.startsWith('Bearer ')) {
      set.status = 401;
      throw new Error('Missing or invalid Authorization header');
    }

    const token = authorization.slice(7);
    let payload: JWTPayload;
    try {
      payload = await verifyJWT(token);
    } catch {
      set.status = 401;
      throw new Error('Invalid or expired token');
    }

    if (!payload.sub) {
      set.status = 401;
      throw new Error('Invalid token: missing subject');
    }

    return { user: { id: payload.sub, email: payload.email } };
  })
  .as('scoped');
