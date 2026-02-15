import { Elysia } from 'elysia';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** 許可するリクエスト数 */
  max: number;
  /** ウィンドウ期間（ミリ秒） */
  windowMs: number;
}

/**
 * IP ベースの固定ウィンドウレート制限ミドルウェア。
 * 古いエントリは自動的にクリーンアップされる。
 */
export function rateLimit({ max, windowMs }: RateLimitOptions) {
  const store = new Map<string, RateLimitEntry>();

  // 5分ごとに期限切れエントリを削除
  setInterval(
    () => {
      const now = Date.now();
      for (const [key, entry] of store) {
        if (now >= entry.resetAt) {
          store.delete(key);
        }
      }
    },
    5 * 60 * 1000,
  ).unref();

  return new Elysia({ name: 'rate-limit' }).onBeforeHandle(({ request, set }) => {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || now >= entry.resetAt) {
      store.set(ip, { count: 1, resetAt: now + windowMs });
      return;
    }

    entry.count++;

    if (entry.count > max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      set.status = 429;
      set.headers['retry-after'] = String(retryAfter);
      return { error: 'Too many requests. Please try again later.' };
    }
  });
}
