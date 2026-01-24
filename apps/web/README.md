# Web App

Trip Plan Appのフロントエンド（Next.js）

## 技術スタック

- Next.js 16
- React 19
- Tailwind CSS v4
- TypeScript

## 開発

```bash
# ルートディレクトリから
pnpm dev:web

# または直接
pnpm --filter web dev
```

http://localhost:3000 でアクセス

## ビルド

```bash
# ルートディレクトリから
pnpm build:web
```

## ディレクトリ構成

```
src/
  app/       # App Router
  components/  # UIコンポーネント
  lib/         # ユーティリティ
```
