# Trip Plan App — CLAUDE.md

## プロジェクト概要

旅行計画モバイルアプリのモノレポ。リアルタイム共同編集対応。

## モノレポ構成

```
apps/
  mobile/    # Expo SDK 54 (React Native) — モバイルアプリ
  api/       # Elysia.js (Bun) + Drizzle ORM — REST + WebSocket API
  supabase/  # Supabase ローカル開発設定（PostgreSQL + Auth）
```

## 技術スタック

- **Mobile**: Expo (React Native), TypeScript
- **API**: Elysia.js (Bun runtime), Drizzle ORM
- **DB**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth → JWT をローカル検証
- **Realtime**: Elysia WebSocket + Bun native pub/sub
- **Monorepo**: pnpm workspaces + Turborepo
- **Lint/Format**: Biome

## 開発環境

### 前提条件

- Node.js 22+, pnpm 10+, Bun 1.2+, Supabase CLI
- WSL2 上で開発（Windows ホスト + WSL2 Linux）

### 開発サーバー起動

```bash
# API サーバー（別ターミナル）
pnpm dev:api          # http://localhost:3000

# モバイル（Expo — トンネルモードがデフォルト）
pnpm dev:mobile       # = expo start --tunnel
```

### WSL2 + 実機テスト

WSL2 環境では localhost が Windows ホストと異なるため、実機 Expo Go でのテストには **トンネル** が必要。

#### 方法1: Expo Tunnels（推奨）

```bash
cd apps/mobile
npx expo start --tunnel
```

Expo のビルトイントンネル（`@expo/ngrok` 使用）で自動的にパブリック URL が生成される。
モバイルアプリの Expo Go からその URL でアクセスできる。

> **注意**: `--tunnel` は Expo Dev Server のトンネルであり、API サーバーには別途 ngrok が必要。

#### 方法2: ngrok で API をトンネル

API サーバー（localhost:3000）を実機からアクセスするため ngrok を使用:

```bash
# ngrok インストール（未インストールの場合）
# https://ngrok.com からダウンロード、または:
# snap install ngrok  /  brew install ngrok

# ngrok でトンネル開始
ngrok http 3000
```

生成された URL（例: `https://xxxx.ngrok-free.app`）を `apps/mobile/.env` に設定:

```bash
EXPO_PUBLIC_API_TUNNEL_URL=https://xxxx.ngrok-free.app
```

ngrok の無料プランでは URL が毎回変わるため、起動のたびに更新が必要。
`.env` 変更後は Expo Dev Server の再起動が必要。

#### API URL 解決の優先順位（`config.ts`）

1. `EXPO_PUBLIC_API_TUNNEL_URL`（`apps/mobile/.env`）が設定されていれば ngrok 経由
2. `Constants.expoConfig.hostUri` から PC の IP を自動検出（LAN 内実機）
3. フォールバック: `localhost:3000`（エミュレータ用）

## よく使うコマンド

```bash
pnpm dev              # 全サービス起動（turbo）
pnpm dev:api          # API のみ
pnpm dev:mobile       # Mobile のみ
pnpm lint             # Biome lint
pnpm lint:fix         # Biome lint + 自動修正
pnpm format           # Biome format
pnpm typecheck        # API 型チェック

# DB
pnpm --filter api run db:pull       # DB スキーマを Drizzle に取り込み

# Supabase
supabase start        # ローカル Supabase 起動
supabase db reset     # マイグレーション + シード適用
```

## コーディング規約

- **Linter/Formatter**: Biome（`biome.json`）— pre-commit hook で自動実行
- **言語**: TypeScript strict
- **UI コンポーネント**: React Native + Ionicons（`@expo/vector-icons`）
- **日付/時刻入力**: `@react-native-community/datetimepicker`（ネイティブピッカー）
- **インポート順**: Biome の自動整列に従う（`@expo` → `@react` → `expo-*` → ローカル）
- **API クライアント**: `apps/mobile/src/api/` 配下に CRUD 関数を型安全に定義
- **画面パターン**: `useFocusData` フックでフォーカス時データ取得、`useDeleteConfirmation` で削除確認 + 楽観的更新
