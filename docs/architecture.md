# アーキテクチャ

## 全体構成

```
┌─────────────────────────────────────────────────────┐
│                    Mobile App                       │
│                 Expo (React Native)                 │
└──────────┬──────────────────────────────────────────┘
           │ REST + WebSocket
           ▼
┌─────────────────────────────────────────────────────┐
│                   API Server                        │
│                Elysia.js (Bun)                      │
│                                                     │
│  REST API ──→ Drizzle ORM ──→ PostgreSQL (CRUD)     │
│  WebSocket ←── Supabase Realtime ←── PostgreSQL     │
└──────────┬──────────────────────────┬───────────────┘
           │ Drizzle ORM             │ Realtime 購読
           ▼                         ▼
┌─────────────────────────────────────────────────────┐
│                    PostgreSQL                        │
│                (Supabase / Docker)                   │
└─────────────────────────────────────────────────────┘
```

Mobile は API サーバーとだけ通信する（単一エントリポイント）。
API が Supabase Realtime を購読し、WebSocket で Mobile にリレーする。

## モノレポ構成

```
trip-plan-app/
├── apps/
│   ├── api/           # バックエンド API
│   │   ├── src/
│   │   │   ├── index.ts       # Elysia サーバー (REST + WebSocket)
│   │   │   ├── db.ts          # Drizzle クライアント
│   │   │   └── schema.ts      # テーブル定義
│   │   ├── drizzle/           # マイグレーションファイル
│   │   └── drizzle.config.ts
│   ├── mobile/        # モバイルアプリ
│   │   ├── App.tsx
│   │   └── src/
│   │       ├── components/    # UI コンポーネント
│   │       ├── screens/       # 画面
│   │       ├── navigation/    # ナビゲーション
│   │       ├── theme/         # テーマ
│   │       └── types/         # 型定義
│   └── supabase/      # Supabase ローカル設定
│       └── config.toml
├── .env               # 環境変数（git 管理外）
├── .env.example
├── biome.json         # Linter / Formatter
├── lefthook.yml       # Git hooks
├── turbo.json         # Turborepo タスク設定
└── pnpm-workspace.yaml
```

## データフロー

### CRUD 操作

```
Mobile  ──REST──→  Elysia.js  ──Drizzle──→  PostgreSQL
  ↑                    │
  └────────────────────┘
        JSON レスポンス
```

### リアルタイム共同編集

```
Mobile A ──REST──→ Elysia.js ──Drizzle──→ PostgreSQL
                       │                      │
                       │               Supabase Realtime
                       │                 (変更検知)
                       │                      │
                       │ ←────────────────────┘
                       │    DB 変更イベント受信
                       │
Mobile B ←──WS────────┘
         API が WebSocket で
         接続中クライアントに配信
```

## 技術選定の理由

| 技術 | 理由 |
|------|------|
| Elysia.js + Bun | 高速、型安全、軽量。WebSocket ネイティブ対応。Bun ランタイムで起動・ビルドが速い |
| Drizzle ORM | 型安全な SQL ビルダー。軽量で Bun と相性が良い |
| Supabase | PostgreSQL + Auth + Realtime を一括提供。ローカル開発が容易 |
| Expo | React Native のビルド・デプロイを簡素化。OTA アップデート対応 |
| pnpm + Turborepo | 高速な依存解決 + タスクキャッシュでモノレポを効率管理 |

## API 経由の WebSocket を選んだ理由

- **単一エントリポイント**: Mobile は API だけと通信すればよく、Supabase の接続情報を持つ必要がない
- **ビジネスロジック集約**: 権限チェック、データ加工、フィルタリングを API 側で一元管理
- **柔軟性**: Supabase 以外のリアルタイム基盤への移行が容易

## DB スキーマ

```
trips
├── spots            (trip_id FK, CASCADE)
├── budget_items     (trip_id FK, CASCADE)
├── checklist_items  (trip_id FK, CASCADE)
├── reservations     (trip_id FK, CASCADE)
└── share_settings   (trip_id FK, CASCADE, UNIQUE)
```

全テーブルの主キーは UUID。子テーブルは親 trip の削除時にカスケード削除される。
