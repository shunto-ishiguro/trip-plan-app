# ページ構成

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Mobile | Expo (React Native) |
| API | Elysia.js (Bun) |
| ORM | Drizzle ORM |
| Database | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSocket) |
| Auth | Supabase Auth |

---

## 1. トップ / 旅行一覧ページ（Trip List）

- 作成した旅行の一覧を表示
- 縦スクロールのカードリスト（1列）
- プルダウンで更新
- FAB（Floating Action Button）で新規作成
- スワイプで削除・アーカイブ

---

## 2. 旅行作成ページ（Trip Create / Edit）

- 旅行タイトル
- 行き先
- 日程（ネイティブの DateTimePicker またはボトムシート型カレンダー）
- 人数
- メモ
- キーボード表示時に入力欄が隠れないようスクロール対応
- 画面下部に固定の「保存」ボタン

---

## 3. 行程編集ページ（Schedule Editor）

旅行ごとの中心ページ。

- 日ごとのスケジュール一覧
- 上部に日付の横スクロールタブ
- スポット追加（名称、住所、時間、メモ）
- スポットカードの長押しでドラッグ&ドロップ（react-native-draggable-flatlist）
- スワイプで編集・削除メニュー表示
- 「+」FAB でスポット追加モーダル

---

## 4. マップページ（Map View）

- フルスクリーンの地図（react-native-maps）
- スポットをピンとして表示
- 現在の行程順のルート表示
- 下部にスポットリストのボトムシート（スワイプで展開/縮小）
- ピンタップで詳細カード表示
- 「経路を開く」ボタンで OS 標準の地図アプリに連携（Apple Maps / Google Maps）
- 現在地表示対応

---

## 5. 予算管理ページ（Budget Manager）

- 支出項目の追加（交通費、宿泊、食事、アクティビティ、その他）
- 上部にサマリーカード（合計・1人あたり）
- カード形式のリスト表示
- スワイプで編集・削除
- カテゴリ別のシンプルな円グラフ
- FAB で項目追加

---

## 6. 共有設定（Share Settings）

- 共有用の URL / QR コード生成（react-native-qrcode-svg）
- 閲覧のみ / 編集可 の権限設定（セグメントコントロール）
- URL コピーボタン（expo-clipboard）
- 「共有する」ボタンで OS 標準の共有シート（Share API）
  - LINE、メール、AirDrop 等に直接共有可能

---

## 7. チェックリストページ（Packing & To-Do List）

- タブで切り替え（荷物 / やること）
- チェックボックスは大きめのタップ領域
- 完了項目は下部に移動 or 非表示オプション
- 振動フィードバック（Haptics）でチェック時の触感

---

## 8. 予約情報ページ（Reservation Info）

- 航空、ホテル、レンタカーなどの予約情報を登録
- 予約番号、時刻、リンク、メモ
- 予約カードのリスト表示
- 予約番号の長押しでコピー
- リンクはアプリ内ブラウザ or 外部ブラウザで開く
- カレンダーアプリへのエクスポート対応

---

## 9. 設定ページ（Settings）

- ユーザー設定
- テーマ切り替え（即時プレビュー）
- 通知設定（expo-notifications）
- ネイティブスタイルの設定リスト（iOS: grouped、Android: Material Design）
- アプリ情報・バージョン表示
