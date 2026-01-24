# Trip Plan App

旅行計画アプリのモノレポ

## 構成

```
apps/
  web/       # Next.js (React)
  mobile/    # Expo (React Native)
  api/       # Go API
packages/
  shared/              # 共有コード
  typescript-config/   # TypeScript設定
```

## 必要な環境

- Node.js 22+
- pnpm 10+
- Go 1.21+
- golangci-lint (Go linter)

## セットアップ

```bash
# 依存関係インストール
pnpm install

# Git hooks設定 (自動実行)
# pnpm prepare
```

## 開発

```bash
# 全て起動
pnpm dev

# 個別起動
pnpm dev:web      # Web (Next.js)
pnpm dev:mobile   # Mobile (Expo)
pnpm dev:api      # API (Go)
```

## コマンド

```bash
pnpm lint         # Lint (Biome)
pnpm lint:fix     # Lint + 自動修正
pnpm format       # フォーマット
pnpm build        # 全ビルド
pnpm build:web    # Webのみビルド
```

## CI/CD

GitHub Actionsで以下を実行:
- Lint (JS/TS: Biome, Go: golangci-lint)
- Build (Web, API)
