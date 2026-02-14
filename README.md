# Trip Plan App

旅行計画アプリのモノレポ（リアルタイム共同編集対応）

## 構成

```
apps/
  mobile/    # Expo (React Native)
  api/       # Elysia.js (Bun) + Drizzle ORM
  supabase/  # Supabase ローカル開発設定
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Mobile | Expo (React Native) |
| API | Elysia.js (Bun runtime) |
| ORM | Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSocket) |
| Auth | Supabase Auth |
| Monorepo | pnpm workspaces + Turborepo |

## 必要な環境

- Node.js 22+
- pnpm 10+
- Bun 1.2+
- Supabase CLI

## セットアップ

```bash
# 依存関係インストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .env を編集して接続情報等を設定

# Supabase ローカル起動
supabase start

# DB スキーマ反映
pnpm --filter api run db:push
```

## 開発

```bash
# 全て起動
pnpm dev

# 個別起動
pnpm dev:mobile   # Mobile (Expo)
pnpm dev:api      # API (Elysia.js)
```

## コマンド

```bash
# Lint / Format
pnpm lint         # Lint (Biome)
pnpm lint:fix     # Lint + 自動修正
pnpm format       # フォーマット

# Build
pnpm build        # 全ビルド
pnpm build:api    # API のみ

# Typecheck
pnpm typecheck    # API 型チェック

# Database (apps/api 内で実行)
pnpm --filter api run db:generate   # マイグレーション生成
pnpm --filter api run db:migrate    # マイグレーション実行
pnpm --filter api run db:push       # スキーマを DB に直接反映
pnpm --filter api run db:studio     # Drizzle Studio 起動
```

## CI/CD

GitHub Actions で以下を実行:
- Lint (Biome)
- Typecheck (API)
- Build (API)
