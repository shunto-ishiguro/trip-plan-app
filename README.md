# Trip Plan App

旅行計画アプリのモノレポ（リアルタイム共同編集対応）

## 構成

```
apps/
  mobile/    # Expo SDK 54 (React Native)
  api/       # Elysia.js (Bun) + Drizzle ORM
  supabase/  # Supabase ローカル開発設定（PostgreSQL + Auth）
```

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Mobile | Expo SDK 54 (React Native) |
| API | Elysia.js (Bun runtime) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Realtime | Elysia WebSocket (Bun native pub/sub) |
| Auth | Supabase Auth (JWT をローカル検証) |
| UI Icons | Ionicons (`@expo/vector-icons`) |
| Date/Time | `@react-native-community/datetimepicker` |
| Monorepo | pnpm workspaces + Turborepo |

## 必要な環境

- Node.js 22+
- pnpm 10+
- Bun 1.2+
- Supabase CLI
- ngrok（WSL2 実機テスト用 — 後述）

## セットアップ

```bash
# 依存関係インストール
pnpm install

# 環境変数の設定
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
# .env を編集して以下を設定:
#   SUPABASE_URL          - Supabase API URL
#   SUPABASE_SERVICE_ROLE_KEY - Supabase Service Role Key
#   DATABASE_URL          - PostgreSQL 接続文字列
#   SUPABASE_JWT_SECRET   - JWT 署名検証用シークレット（supabase start の出力値）
#   API_URL               - API サーバー URL (デフォルト: http://localhost:3000)
#   PORT                  - API サーバーポート (デフォルト: 3000)
#   LOG_LEVEL             - ログレベル (debug/info/warn/error)
# apps/mobile/.env を編集して以下を設定:
#   EXPO_PUBLIC_API_TUNNEL_URL - ngrok トンネル URL（WSL2 実機テスト用）
#   EXPO_PUBLIC_API_URL        - 本番 API URL

# Supabase ローカル起動
supabase start

# DB マイグレーション適用 + シード
supabase db reset
```

## 開発

### 基本コマンド

```bash
# 全て起動（turbo）
pnpm dev

# 個別起動
pnpm dev:api      # API サーバー (http://localhost:3000)
pnpm dev:mobile   # Mobile (Expo)
```

### WSL2 + 実機テスト（推奨ワークフロー）

WSL2 環境では localhost がホスト Windows と異なるため、実機の Expo Go からアクセスするには**トンネル**が必要。

#### 1. API サーバーを ngrok でトンネル

```bash
# ターミナル1: API 起動
pnpm dev:api

# ターミナル2: ngrok でトンネル
ngrok http 3000
```

ngrok が出力する URL（例: `https://xxxx.ngrok-free.app`）を `apps/mobile/.env` に設定:

```bash
EXPO_PUBLIC_API_TUNNEL_URL=https://xxxx.ngrok-free.app
```

> ngrok 無料プランでは URL が起動のたびに変わるため、毎回更新が必要。
> 有料プラン（固定ドメイン）を使えば `ngrok http --domain=your-domain.ngrok-free.dev 3000` で固定可能。
> `.env` 変更後は Expo Dev Server の再起動が必要。

#### 2. Expo Dev Server をトンネルモードで起動

```bash
cd apps/mobile
npx expo start --tunnel
```

QR コードを実機の Expo Go でスキャンすれば接続完了。

> `--tunnel` は Expo Dev Server（Metro bundler）のトンネル。API サーバーのトンネル（ngrok）とは別物。

#### ngrok のインストール

```bash
# Linux (WSL2)
curl -sSL https://ngrok-agent.s3.amazonaws.com/ngrok-v3-stable-linux-amd64.tgz \
  | sudo tar xz -C /usr/local/bin

# macOS
brew install ngrok

# または公式サイト: https://ngrok.com/download
```

初回のみ authtoken の設定が必要（無料アカウント作成後に取得）:

```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### API URL 解決の優先順位（`config.ts`）

モバイルアプリが API サーバーに接続する URL は以下の優先順位で決まる:

1. **`EXPO_PUBLIC_API_TUNNEL_URL`** が設定済み → ngrok トンネル経由（WSL2 実機テスト用）
2. **`Constants.expoConfig.hostUri`** → PC の IP を自動検出（同一 LAN 実機テスト）
3. **フォールバック** → `localhost:3000`（エミュレータ用）

## コマンド一覧

```bash
# 開発
pnpm dev              # 全サービス起動
pnpm dev:api          # API のみ
pnpm dev:mobile       # Mobile のみ

# Lint / Format
pnpm lint             # Lint (Biome)
pnpm lint:fix         # Lint + 自動修正
pnpm format           # フォーマット

# Build
pnpm build            # 全ビルド
pnpm build:api        # API のみ

# Typecheck
pnpm typecheck        # API 型チェック

# Database (apps/api 内で実行)
pnpm --filter api run db:pull       # DB スキーマを Drizzle に取り込み

# Supabase
supabase start        # ローカル Supabase 起動
supabase db reset     # マイグレーション + シード適用
```

## CI/CD

GitHub Actions（`.github/workflows/ci.yml`）で `main` / `develop` ブランチへの push / PR 時に以下を実行:

1. **Lint** — Biome check
2. **Typecheck** — API 型チェック（Lint 後）
3. **Build (API)** — Bun ビルド（Lint 後）
