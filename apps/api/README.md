# API

Trip Plan App のバックエンド API（Elysia.js / Bun）

## 技術スタック

- Elysia.js (Bun runtime)
- Drizzle ORM (PostgreSQL)
- Supabase Auth (ユーザー管理、JWT ローカル検証)
- Bun WebSocket (リアルタイム配信)
- TypeScript

## アーキテクチャ

```
Mobile App ── REST ──→ Elysia.js ──→ Drizzle ORM ──→ PostgreSQL
Mobile App ←── WS ─── Elysia.js     (変更時に即時通知、Bun native pub/sub)
```

- **REST API**: Elysia.js でバリデーション・認証・認可を処理
- **DB**: Drizzle ORM で PostgreSQL に直接アクセス
- **Realtime**: API の書き込みハンドラが成功時に WebSocket でブロードキャスト
- **Auth**: Supabase Auth でユーザー管理。JWT は `SUPABASE_JWT_SECRET` でローカル検証（外部ライブラリ不要）

## ファイル構成

```
src/
├── index.ts              # Elysia サーバー (REST + WebSocket)
├── db.ts                 # Drizzle クライアント (PostgreSQL 接続)
├── schema.ts             # テーブル定義 (Drizzle ORM)
├── validators.ts         # 入力バリデーションスキーマ
├── jwt.ts                # JWT 検証 (Web Crypto API)
├── broadcast.ts          # WebSocket ブロードキャスト (Bun pub/sub)
├── middleware/
│   ├── auth.ts           # JWT 認証ミドルウェア
│   └── authorize.ts      # ロールベース認可
└── routes/
    ├── auth.ts           # signup / login / refresh / me
    ├── ws.ts             # WebSocket (トリップ単位のルーム)
    ├── trips.ts          # トリップ CRUD
    ├── tripMembers.ts    # メンバー管理
    ├── spots.ts          # スポット CRUD
    ├── budgetItems.ts    # 予算 CRUD
    ├── checklistItems.ts # チェックリスト CRUD + バッチ + toggle
    ├── reservations.ts   # 予約 CRUD
    ├── shareSettings.ts  # 共有設定（トークン生成）
    └── shareJoin.ts      # 共有リンク参加 / プレビュー
```

## 環境変数

| 変数 | 説明 |
|------|------|
| `SUPABASE_URL` | Supabase API URL (Auth REST API 用) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (管理者操作用) |
| `DATABASE_URL` | PostgreSQL 接続文字列 |
| `SUPABASE_JWT_SECRET` | JWT 署名検証用シークレット |
| `API_URL` | API サーバー URL (デフォルト: `http://localhost:3000`) |
| `PORT` | API サーバーポート (デフォルト: `3000`) |
| `LOG_LEVEL` | ログレベル (`debug` / `info` / `warn` / `error`) |

## 開発

```bash
# ルートディレクトリから
pnpm dev:api

# または直接
cd apps/api
bun run dev
```

http://localhost:3000 で起動。

### WSL2 実機テスト

WSL2 環境で実機の Expo Go からアクセスする場合、ngrok でトンネルする:

```bash
ngrok http 3000
```

出力される URL を `apps/mobile/src/api/config.ts` の `NGROK_URL` に設定する。

## エンドポイント

### 認証

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| POST | `/api/v1/auth/signup` | 不要 | ユーザー登録 |
| POST | `/api/v1/auth/login` | 不要 | ログイン |
| POST | `/api/v1/auth/refresh` | 不要 | トークンリフレッシュ |
| GET | `/api/v1/auth/me` | 必要 | 現在のユーザー情報 |

### トリップ

| メソッド | パス | 認可 | 説明 |
|---------|------|------|------|
| GET | `/api/v1/trips` | viewer | 自分のトリップ一覧 |
| POST | `/api/v1/trips` | - | トリップ作成 |
| GET | `/api/v1/trips/:id` | viewer | トリップ詳細 |
| PUT | `/api/v1/trips/:id` | editor | トリップ更新 |
| DELETE | `/api/v1/trips/:id` | owner | トリップ削除 |

### 子リソース（spots / budget-items / reservations）

| メソッド | パス | 認可 |
|---------|------|------|
| GET | `/api/v1/trips/:tripId/{resource}` | viewer |
| POST | `/api/v1/trips/:tripId/{resource}` | editor |
| PUT | `/api/v1/trips/:tripId/{resource}/:id` | editor |
| DELETE | `/api/v1/trips/:tripId/{resource}/:id` | editor |

> spots は `?dayIndex=N` クエリパラメータで日ごとにフィルタ可能。

### チェックリスト（checklist-items）

| メソッド | パス | 認可 | 説明 |
|---------|------|------|------|
| GET | `/api/v1/trips/:tripId/checklist-items` | viewer | 一覧（`?type=packing\|todo` でフィルタ可） |
| POST | `/api/v1/trips/:tripId/checklist-items` | editor | 単一作成 |
| POST | `/api/v1/trips/:tripId/checklist-items/batch` | editor | 一括作成 |
| PATCH | `/api/v1/trips/:tripId/checklist-items/:id/toggle` | editor | チェック状態を反転 |
| PUT | `/api/v1/trips/:tripId/checklist-items/:id` | editor | 更新 |
| DELETE | `/api/v1/trips/:tripId/checklist-items/:id` | editor | 削除 |

### メンバー管理

| メソッド | パス | 認可 | 説明 |
|---------|------|------|------|
| GET | `/api/v1/trips/:tripId/members` | viewer | メンバー一覧 |
| PUT | `/api/v1/trips/:tripId/members/:userId` | owner | ロール変更 |
| DELETE | `/api/v1/trips/:tripId/members/:userId` | owner | メンバー削除 |

### 共有

| メソッド | パス | 認証 | 説明 |
|---------|------|------|------|
| GET | `/api/v1/share/preview/:token` | 必要 | トリッププレビュー |
| POST | `/api/v1/share/join` | 必要 | 共有リンクで参加 |
| GET | `/api/v1/trips/:tripId/share` | owner | 共有設定取得 |
| POST | `/api/v1/trips/:tripId/share` | owner | 共有リンク生成 |
| PUT | `/api/v1/trips/:tripId/share` | owner | 共有設定更新 |
| DELETE | `/api/v1/trips/:tripId/share` | owner | 共有設定削除 |

### WebSocket

| パス | 説明 |
|------|------|
| `ws://host/api/v1/trips/:tripId/ws?token=JWT` | トリップのリアルタイム更新を購読 |

イベント形式:
```json
{ "type": "INSERT|UPDATE|DELETE", "table": "spots", "record": { ... } }
```

## DB コマンド

```bash
pnpm --filter api run db:pull       # DB スキーマを Drizzle に取り込み

# Supabase（プロジェクトルートで実行）
supabase start                      # ローカル Supabase 起動
supabase db reset                   # マイグレーション + シード適用
```
