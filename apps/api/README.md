# API Server

Trip Plan App のバックエンド API（Go / Echo + sqlc）

## 技術スタック

- Go 1.23+
- Echo (HTTP フレームワーク)
- sqlc (SQL → Go コード生成)
- gorilla/websocket (リアルタイム通信)
- golang-jwt (JWT 検証)

## 開発

```bash
# API サーバー起動
go run ./cmd/server   # http://localhost:3000

# テスト
go test ./...

# sqlc コード生成（SQL 変更後）
sqlc generate
```

## ディレクトリ構成

```
cmd/server/main.go    # エントリポイント
internal/
  handler/            # ルートハンドラ (REST + WS)
  middleware/         # JWT 認証・認可・レート制限
  ws/                 # WebSocket Hub・ブロードキャスト
  config/             # 環境変数・設定
  auth/               # Supabase Auth クライアント
db/
  query/              # sqlc SQL クエリ (.sql)
  generated/          # sqlc 生成コード (編集不可)
  sqlc.yaml           # sqlc 設定
go.mod
go.sum
```
