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
│  WebSocket ←── Bun pub/sub ←── 書き込みハンドラ     │
└──────────┬──────────────────────────────────────────┘
           │ Drizzle ORM
           ▼
┌─────────────────────────────────────────────────────┐
│                    PostgreSQL                        │
│                (Supabase / Docker)                   │
└─────────────────────────────────────────────────────┘
```

Mobile は API サーバーとだけ通信する（単一エントリポイント）。
Supabase は PostgreSQL + Auth（ユーザー管理）として利用。
リアルタイム配信は Elysia が Bun の native pub/sub で直接処理する。

## モバイル API クライアント層

```
screens/ ──→ api/*.ts ──→ fetcher.ts ──→ Elysia API
                              │
                        SecureStore から
                        JWT を自動付与
```

- **`fetcher.ts`**: 全 API 呼び出しの共通基盤。`expo-secure-store` から `auth_access_token` を取得し `Authorization: Bearer` ヘッダーに付与
- **`config.ts`**: `EXPO_PUBLIC_API_TUNNEL_URL`（ngrok）→ `expo-constants` の `hostUri`（LAN）→ `localhost` の優先順位で API URL を解決
- **リソース API モジュール** (`trips.ts`, `spots.ts`, `budgetItems.ts`, `checklistItems.ts`, `reservations.ts`, `shares.ts`): 各 CRUD 操作を型安全な関数として提供
- **カスタム Hooks**: `useFocusData` でフォーカス時データ取得を抽象化、`useDeleteConfirmation` で削除確認 + 楽観的 UI 更新
- **画面連携パターン**: `useFocusData` でフォーカス時にデータ再取得、楽観的更新 + ロールバック（チェックリスト等）、`saving` state でボタン制御

## 認証・認可

```
Mobile ──Bearer JWT──→ Elysia (ローカル JWT 検証) ──→ ルートハンドラ
                            │
                      SUPABASE_JWT_SECRET で
                      Web Crypto API 検証
                      (外部ライブラリ不要)
```

- **認証**: Supabase Auth が JWT を発行。API は `SUPABASE_JWT_SECRET` でローカル検証
- **認可**: `trip_members` テーブルでロールベースアクセス制御（owner > editor > viewer）
- **Auth API**: signup / login / refresh は Supabase Auth REST API に fetch で直接通信
- **レート制限**: 認証エンドポイント（signup / login / refresh）は IP ベースの固定ウィンドウ制限（15分間に10回まで）

## モノレポ構成

```
trip-plan-app/
├── apps/
│   ├── api/           # バックエンド API
│   │   ├── src/
│   │   │   ├── index.ts          # Elysia サーバー (REST + WebSocket)
│   │   │   ├── db.ts             # Drizzle クライアント
│   │   │   ├── schema.ts         # テーブル定義
│   │   │   ├── jwt.ts            # JWT 検証 (Web Crypto API)
│   │   │   ├── broadcast.ts      # WebSocket ブロードキャスト
│   │   │   ├── validators.ts     # 入力バリデーションスキーマ
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts       # JWT 認証ミドルウェア
│   │   │   │   ├── authorize.ts  # ロールベース認可
│   │   │   │   └── rateLimit.ts  # IP ベースレート制限
│   │   │   └── routes/           # ルートハンドラ
│   │   └── drizzle.config.ts
│   ├── mobile/        # モバイルアプリ
│   │   ├── App.tsx
│   │   └── src/
│   │       ├── api/            # API クライアント
│   │       │   ├── config.ts   # ベース URL（ngrok / Expo hostUri / localhost）
│   │       │   ├── fetcher.ts  # 共通 fetch（JWT 自動付与）
│   │       │   ├── auth.ts     # 認証 API (signup/login/refresh)
│   │       │   ├── trips.ts
│   │       │   ├── spots.ts
│   │       │   ├── budgetItems.ts
│   │       │   ├── checklistItems.ts
│   │       │   ├── reservations.ts
│   │       │   └── shares.ts         # 共有設定・参加 API
│   │       ├── components/     # UI コンポーネント（Ionicons 使用）
│   │       │   ├── TripCard.tsx        # トリップ一覧カード
│   │       │   ├── SpotCard.tsx        # スポットカード
│   │       │   ├── BudgetItemCard.tsx  # 予算カード
│   │       │   ├── ChecklistItemRow.tsx# チェックリスト行
│   │       │   ├── ReservationCard.tsx # 予約カード
│   │       │   ├── ShareSheet.tsx      # 合言葉共有ボトムシート
│   │       │   ├── FAB.tsx             # Floating Action Button
│   │       │   ├── GradientButton.tsx  # グラデーションボタン
│   │       │   ├── FormInput.tsx       # フォーム入力
│   │       │   └── EmptyState.tsx      # 空リストプレースホルダー
│   │       ├── contexts/
│   │       │   ├── AuthContext.tsx      # 認証状態管理（JWT 保存・復元）
│   │       │   └── TripContext.tsx      # トリップデータ管理
│   │       ├── hooks/
│   │       │   ├── useFocusData.ts     # フォーカス時データ取得
│   │       │   └── useDeleteConfirmation.ts # 削除確認ダイアログ
│   │       ├── utils/
│   │       │   └── date.ts             # 日付フォーマット
│   │       ├── screens/        # 画面（DateTimePicker 使用）
│   │       ├── navigation/
│   │       ├── theme/
│   │       └── types/
│   └── supabase/      # Supabase ローカル設定
│       ├── config.toml
│       ├── seed.sql
│       └── migrations/
├── .env
├── .env.example
├── biome.json
├── lefthook.yml
├── turbo.json
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
Mobile A ──POST──→ Elysia.js ──Drizzle──→ PostgreSQL
                       │
                       ├── JSON レスポンス → Mobile A
                       │
                       └── broadcast() → Bun pub/sub
                                            │
Mobile B ←──────── WebSocket ──────────────┘
         { type: "INSERT", table: "spots", record: {...} }
```

API 自身が書き込み元なので DB 変更検知は不要。
書き込みハンドラ内で `broadcast()` を呼び、Bun の native pub/sub でトリップルームの全クライアントに配信する。

### WebSocket 接続

```
Mobile ──ws://host/api/v1/trips/:tripId/ws?token=JWT──→ Elysia
                                                          │
                                                    JWT 検証 + 認可
                                                          │
                                                    ws.subscribe(`trip:${tripId}`)
```

## 認可マトリクス

| リソース | GET | POST/PUT | DELETE |
|---------|-----|----------|--------|
| trips | viewer（一覧はメンバーフィルタ） | editor | owner |
| spots / budgetItems / checklistItems / reservations | viewer | editor | editor |
| shareSettings | owner | owner | owner |
| tripMembers | viewer | - (共有リンク参加) | owner |

## 技術選定の理由

| 技術 | 理由 |
|------|------|
| Elysia.js + Bun | 高速、型安全、軽量。WebSocket ネイティブ対応。Bun ランタイムで起動・ビルドが速い |
| Drizzle ORM | 型安全な SQL ビルダー。軽量で Bun と相性が良い |
| Supabase (PostgreSQL + Auth) | PostgreSQL + ユーザー認証を一括提供。ローカル開発が容易 |
| Bun WebSocket (pub/sub) | 外部依存なしでリアルタイム配信。Elysia と統合済み |
| Expo | React Native のビルド・デプロイを簡素化。OTA アップデート対応 |
| pnpm + Turborepo | 高速な依存解決 + タスクキャッシュでモノレポを効率管理 |

## Elysia WebSocket を選んだ理由

- **単一エントリポイント**: Mobile は API だけと通信すればよい
- **外部依存ゼロ**: Supabase Realtime / RLS 不要。Bun の native pub/sub で完結
- **ビジネスロジック集約**: 認証・認可・データ加工を API 側で一元管理
- **シンプル**: 書き込み元 = API なので DB 変更検知が不要。ハンドラ内で直接 broadcast

## DB スキーマ

```
trips (owner_id → auth.users)
├── spots            (trip_id FK, CASCADE)
├── budget_items     (trip_id FK, CASCADE)
├── checklist_items  (trip_id FK, CASCADE)
├── reservations     (trip_id FK, CASCADE)
├── share_settings   (trip_id FK, CASCADE, UNIQUE, share_token)
└── trip_members     (trip_id FK, CASCADE, user_id → auth.users, role)
```

全テーブルの主キーは UUID。子テーブルは親 trip の削除時にカスケード削除される。
`trip_members` の `role` は `owner | editor | viewer` の ENUM で認可制御に使用。
