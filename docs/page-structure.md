# ページ構成

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Mobile | Expo (React Native) |
| API | Elysia.js (Bun) |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Supabase) |
| Realtime | Elysia WebSocket (Bun native pub/sub) |
| Auth | Supabase Auth (JWT ローカル検証) |

---

## API 連携共通パターン

全画面で以下のパターンを使用:

- **データ取得**: `useFocusData` フックで画面フォーカス時に API から取得（`loading` state → `ActivityIndicator`）
- **データ作成**: `saving` state でボタン無効化（`GradientButton` の `disabled` prop）、成功後に `navigation.goBack()`
- **データ削除**: `useDeleteConfirmation` フックで確認ダイアログ → API 呼び出し → 楽観的にローカル state から除去
- **楽観的更新**: チェックリストの toggle 等は UI を即座に更新し、API 失敗時にロールバック
- **認証**: `fetcher.ts` が SecureStore の JWT トークンを自動付与

---

## 1. ログイン / サインアップ（Auth）

- メール + パスワードによるサインアップ・ログイン
- Supabase Auth REST API に直接通信
- JWT トークンを `expo-secure-store` に保存
- `AuthContext` で認証状態をグローバル管理
- 未認証時は AuthNavigator（Login/Signup）、認証済みは RootNavigator に自動遷移

---

## 2. 旅行一覧ページ（Trip List）

- API: `GET /trips`
- 作成した旅行の一覧を表示
- 縦スクロールのカードリスト（1列）
- プルダウンで更新（`RefreshControl`）
- FAB（Floating Action Button）で新規作成
- 空リスト時のプレースホルダー表示

---

## 3. 旅行作成ページ（Trip Create / Edit）

- API: `POST /trips`（新規）、`PUT /trips/:id`（編集）
- 旅行タイトル
- 行き先（`destination` — API 必須フィールド）
- 日程（ネイティブ DateTimePicker — `mode="date"`）
- 人数
- メモ
- 編集モード時: `GET /trips/:id` で既存値を読み込み
- キーボード表示時に入力欄が隠れないようスクロール対応
- 画面下部に固定の「保存」ボタン（保存中は無効化）

---

## 4. 行程編集ページ（Schedule Editor）

- API: `GET /trips/:id`（日数計算）、`GET /trips/:id/spots?dayIndex=N`、`DELETE /trips/:id/spots/:spotId`
- 日ごとのスケジュール一覧
- 上部に日付の横スクロールタブ（旅行の日数から動的生成）
- スポット追加（名称、住所、時間、メモ）
- スポットカードの長押しで削除メニュー
- 「+」FAB でスポット追加画面へ遷移

---

## 5. スポット追加ページ（Add Spot）

- API: `POST /trips/:id/spots`
- 名称（必須）、住所、開始時間・終了時間（ネイティブ DateTimePicker — `mode="time"`）、メモ
- 保存中はボタン無効化

---

## 6. 予算管理ページ（Budget Manager）

- API: `GET /trips/:id/budget-items`、`GET /trips/:id`（人数取得）、`DELETE /trips/:id/budget-items/:itemId`
- 支出項目の追加（交通費、宿泊、食事、アクティビティ、その他）
- 上部にサマリーカード（合計・1人あたり）
- カード形式のリスト表示
- 長押しで削除メニュー
- カテゴリ別のシンプルな円グラフ（`totalAmount > 0` 時のみ表示）
- FAB で項目追加

---

## 7. 予算項目追加ページ（Add Budget Item）

- API: `POST /trips/:id/budget-items`
- カテゴリ選択、名称（必須）、金額（必須）、料金タイプ（全体/人あたり）、メモ
- 保存中はボタン無効化

---

## 8. チェックリストページ（Packing & To-Do List）

- API: `GET /trips/:id/checklist-items`（`?type=packing|todo` でフィルタ可）、`PATCH /trips/:id/checklist-items/:id/toggle`、`PUT /trips/:id/checklist-items/:id`、`DELETE /trips/:id/checklist-items/:id`
- タブで切り替え（持ち物 / やること）
- 進捗バー表示（完了数 / 合計）
- **行タップ** でチェック toggle（楽観的更新、API 失敗時ロールバック）
- **行長押し** で削除ダイアログ
- 完了項目は下部に移動

---

## 9. チェックリスト項目追加ページ（Add Checklist Item）

- API: `POST /trips/:id/checklist-items`（単一）、`POST /trips/:id/checklist-items/batch`（一括）
- テキスト入力 + よく使う項目からの複数選択
- 一括登録（バッチ API）
- 保存中はボタン無効化

---

## 10. 予約情報ページ（Reservation Info）

- API: `GET /trips/:id/reservations`、`DELETE /trips/:id/reservations/:reservationId`
- 航空、ホテル、レンタカー、レストラン、アクティビティ、その他
- 日付でグループ化して表示
- 予約番号、時刻、リンク、メモ
- タップで詳細表示 + 削除メニュー

---

## 11. 予約追加ページ（Add Reservation）

- API: `POST /trips/:id/reservations`
- 予約タイプ選択（6種類）、名称（必須）、予約番号、日付（DateTimePicker `mode="date"`）・時間（`mode="time"`）、リンク、メモ
- 保存中はボタン無効化

---

## 12. 設定ページ（Settings）

- アカウント設定（プロフィール編集、メールアドレス表示、パスワード変更）
- 表示設定（テーマ切り替え: ライト / ダーク / システム設定）
- 通知設定（プッシュ通知、出発前リマインダーの ON/OFF）
- その他（利用規約、プライバシーポリシー、お問い合わせ）
- ログアウト（確認ダイアログ付き）
- アプリ情報・バージョン表示

---

## 13. 共有シート（Share Sheet）

- コンポーネント: `ShareSheet`（ボトムシート Modal）
- 旅行詳細画面からオーナーが開く
- API: `GET /trips/:id/share`、`POST /trips/:id/share`、`PUT /trips/:id/share`
- **状態A（未作成）**: 権限選択（閲覧のみ / 編集も可能）→「共有を有効にする」で合言葉を生成
- **状態B（有効）**: 6文字の合言葉を大きく表示、クリップボードコピー（ハプティクス付き）、権限の変更、「共有を停止する」で無効化
- **状態C（停止中）**: 「共有を再開する」で再有効化
- 合言葉生成: `A-Z`（O/I/L除外）+ `2-9`（0/1除外）の30文字種 × 6桁、DB UNIQUE 制約 + アプリ側リトライで一意性担保

---

## 14. 旅行参加ページ（Join Trip）

- 画面: `JoinTripScreen`（モーダル表示）
- 旅行一覧画面から遷移
- API: `GET /share/preview/:token`、`POST /share/join`
- **ステップ1**: 6文字の合言葉を入力 → 「検索する」で旅行をプレビュー取得
- **ステップ2**: 旅行情報（タイトル、行き先、日程、権限）を確認 → 「この旅行に参加する」で参加
- 参加成功後、旅行詳細画面（Schedule）に `replace` で遷移
- 既にメンバーの場合は重複参加せず（`ON CONFLICT DO NOTHING`）

---

## 未実装の機能

- マップページ（Map View）— react-native-maps によるスポット表示
- スワイプで削除・アーカイブ
- ドラッグ&ドロップ並び替え
