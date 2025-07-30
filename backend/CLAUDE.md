# 最重要

すべての基本指針については[../CLAUDE.md](../CLAUDE.md)を参照してください。

## Backend 固有の開発コマンド

詳細は[README.md](README.md)を参照。

### Docker Compose使用（推奨）
```bash
# 全サービス起動
docker-compose up --build

# バックグラウンド実行
docker-compose up -d

# ログ確認
docker-compose logs -f

# サービス停止
docker-compose down
```

### ローカル開発
```bash
# 依存関係インストール
go mod tidy

# 開発サーバー起動
go run main.go

# テスト実行
go test ./...

# 特定パッケージのテスト
go test ./controllers

# カバレッジ付きテスト
go test -cover ./...
```

## Architecture

### 技術スタック
- **言語**: Go 1.23+
- **フレームワーク**: Gin
- **データベース**: PostgreSQL 17
- **コンテナ化**: Docker + docker-compose

### ディレクトリ構造
```
backend/
├── controllers/     # APIハンドラー
├── middleware/      # 認証・ロギング等のミドルウェア
├── models/         # データモデル定義
├── config/         # 設定・DB接続
├── test/           # テストヘルパー・モック
└── init-db/        # DB初期化スクリプト
```

### サービス構成
- **APIサーバー**: localhost:8080
- **PostgreSQL**: localhost:5432
  - DB名: polimoney
  - ユーザー: postgres
  - パスワード: postgres123

## 開発ガイドライン

### API設計
- RESTful API設計原則に従う
- JSONレスポンス形式を統一
- 適切なHTTPステータスコード使用
- エラーハンドリングの統一

### データベース
- マイグレーションスクリプトは`init-db/`に配置
- テスト用のサンプルデータも同ディレクトリに管理

### テスト
- ユニットテスト必須（各パッケージに`*_test.go`）
- テストヘルパーは`test/`ディレクトリを活用
- モックを使用した独立したテスト作成

## 環境設定

### 必要な環境変数
```bash
# .env.example をコピーして設定
cp .env.example .env
```

主要な設定項目：
- DB接続情報
- JWT秘密鍵
- API設定