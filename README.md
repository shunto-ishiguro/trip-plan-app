# Trip Plan App

旅行計画モバイルアプリ（リアルタイム共同編集対応）

## 機能

- 旅行プランの作成・管理
- スポット（観光地・飲食店など）の登録
- 予算管理（費目ごとの金額記録）
- チェックリスト（持ち物・TODO）
- 予約情報の管理
- リアルタイム共同編集（WebSocket）
- 合言葉による旅行プランの共有・参加
- ロールベースの権限管理（owner / editor / viewer）

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Mobile | Expo SDK 54 (React Native), TypeScript |
| API | Go (Echo), sqlc |
| DB | PostgreSQL (Supabase) |
| Auth | Supabase Auth + golang-jwt |
| Realtime | Echo WebSocket (goroutine Hub) |

## API エンドポイント

| リソース | Path | 操作 |
|---------|------|------|
| Auth | `/api/v1/auth` | signup, login, refresh, me |
| Trips | `/api/v1/trips` | CRUD |
| Spots | `/api/v1/trips/:tripId/spots` | CRUD + dayIndex フィルタ |
| Budget Items | `/api/v1/trips/:tripId/budget-items` | CRUD |
| Checklist Items | `/api/v1/trips/:tripId/checklist-items` | CRUD + batch 作成 + toggle |
| Reservations | `/api/v1/trips/:tripId/reservations` | CRUD |
| Share Settings | `/api/v1/trips/:tripId/share` | CRUD (owner のみ) |
| Share Join | `/api/v1/share` | preview + join (合言葉) |
| Members | `/api/v1/trips/:tripId/members` | 一覧 / ロール変更 / 削除 |
| WebSocket | `/api/v1/trips/:tripId/ws` | リアルタイムイベント配信 |

## 構成

```
apps/
  mobile/    # Expo SDK 54 (React Native)
  api/       # Go (Echo) + sqlc
  supabase/  # Supabase ローカル開発設定
```

## ドキュメント

- [アーキテクチャ](docs/architecture.md) — 全体構成、認証・認可、DB スキーマ、技術選定
- [開発ガイド](docs/development.md) — セットアップ、コマンド一覧、WSL2 実機テスト
