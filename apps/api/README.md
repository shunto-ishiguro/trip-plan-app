# API

Trip Plan AppのバックエンドAPI（Go / Gin）

## 技術スタック

- Go 1.24+
- Gin Web Framework
- golangci-lint

## 開発

```bash
# ルートディレクトリから
pnpm dev:api

# または直接
cd apps/api
go run main.go
```

http://localhost:8080 で起動

## エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/health` | ヘルスチェック |
| GET | `/api/v1/` | API情報 |

## ビルド

```bash
cd apps/api
go build -o bin/api main.go
```

## Lint

```bash
golangci-lint run
```

## 依存関係

```bash
go mod download    # インストール
go mod tidy        # 整理
```
