# 開発ガイド

## 必要な環境

- Node.js 22+, pnpm 10+
- Go 1.23+
- Supabase CLI
- sqlc（`go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`）
- lefthook（`go install github.com/evilmartians/lefthook@latest`）
- ngrok（WSL2 実機テスト用）

## セットアップ

```bash
# 環境変数の設定
cp .env.example .env
cp apps/mobile/.env.example apps/mobile/.env
# .env と apps/mobile/.env を編集（詳細は各 .env.example を参照）

# Mobile 依存関係インストール
cd apps/mobile && pnpm install

# sqlc コード生成
cd apps/api && sqlc generate

# Git hooks
lefthook install

# Supabase ローカル起動 + DB マイグレーション
supabase start
supabase db reset
```

## 開発サーバー起動

```bash
# API サーバー（別ターミナル）
cd apps/api && go run ./cmd/server   # http://localhost:3000

# Mobile（Expo — トンネルモードが WSL2 では必要）
cd apps/mobile && pnpm start --tunnel
```

## WSL2 + 実機テスト

WSL2 では localhost がホスト Windows と異なるため、実機テストには ngrok トンネルが必要。

### 1. API サーバーを ngrok でトンネル

```bash
# ターミナル1: API 起動
cd apps/api && go run ./cmd/server

# ターミナル2: ngrok でトンネル
ngrok http 3000
```

ngrok の出力 URL を `apps/mobile/.env` に設定:

```bash
EXPO_PUBLIC_API_TUNNEL_URL=https://xxxx.ngrok-free.app
```

> `.env` 変更後は Expo Dev Server の再起動が必要。

### 2. Expo をトンネルモードで起動

```bash
cd apps/mobile && pnpm start --tunnel
```

QR コードを実機の Expo Go でスキャンして接続。

> `--tunnel` は Expo Dev Server（Metro bundler）のトンネル。API サーバーのトンネル（ngrok）とは別物。

### API URL 解決の優先順位（`config.ts`）

1. **`EXPO_PUBLIC_API_TUNNEL_URL`** → ngrok トンネル経由（WSL2 実機テスト用）
2. **`Constants.expoConfig.hostUri`** → PC の IP を自動検出（同一 LAN 実機テスト）
3. **フォールバック** → `localhost:3000`（エミュレータ用）

## コマンド一覧

### Mobile

```bash
cd apps/mobile
pnpm start           # Expo 起動
pnpm start --tunnel  # トンネルモード
pnpm lint            # Biome lint
pnpm lint:fix        # Biome lint + 自動修正
pnpm format          # Biome format
```

### API (Go)

```bash
cd apps/api
go run ./cmd/server          # API 起動
go test ./...                # テスト
go build -o bin/server ./cmd/server  # ビルド
sqlc generate                # SQL → Go コード生成
```

### Supabase

```bash
supabase start        # ローカル Supabase 起動
supabase db reset     # マイグレーション + シード適用
```

## CI/CD

GitHub Actions（`.github/workflows/ci.yml`）で `main` / `develop` ブランチへの push / PR 時に以下を実行:

1. **Lint** — Biome check (mobile) + golangci-lint (API)
2. **Test** — `go test ./...` (API)
3. **Build** — `go build` (API)
