# API

Trip Plan App のバックエンド API（Elysia.js / Bun）

## 技術スタック

- Elysia.js (Bun runtime)
- Drizzle ORM (PostgreSQL)
- Supabase (Auth + Realtime)
- TypeScript

## アーキテクチャ

```
Mobile App ── REST + WebSocket ──→ Elysia.js
                                      ├── Drizzle ORM ──→ PostgreSQL (CRUD)
                                      └── Supabase Realtime ←── PostgreSQL (変更検知 → WS リレー)
```

- **REST API**: Elysia.js でバリデーション・ビジネスロジックを処理
- **DB**: Drizzle ORM で PostgreSQL に直接アクセス
- **Realtime**: API が Supabase Realtime を購読し、WebSocket で Mobile にリレー
- **Auth**: Supabase Auth でユーザー認証

## 開発

```bash
# ルートディレクトリから
pnpm dev:api

# または直接
cd apps/api
bun run dev
```

http://localhost:3000 で起動

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/api/v1/` | API 情報 |

## DB コマンド

```bash
pnpm --filter api run db:push       # スキーマを DB に反映
pnpm --filter api run db:generate   # マイグレーション生成
pnpm --filter api run db:migrate    # マイグレーション実行
pnpm --filter api run db:studio     # Drizzle Studio 起動
```
