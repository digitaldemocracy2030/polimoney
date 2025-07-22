# Polimoney バックエンド

- 言語：Go
- フレームワーク：Gin
- データベース：PostgreSQL
- コンテナ化：Docker & docker-compose

## セットアップ手順

### 前提条件

- Docker
- Docker Compose

### 実行方法

まず最初に、環境変数を設定してください：

```bash
cp .env.example .env
```

## Docker Composeで起動（推奨）

プロジェクトディレクトリで以下のコマンドを実行してください：

```bash
docker-compose up --build
```

これで以下のサービスが起動します：

- APIサーバー: `http://localhost:8080`
- PostgreSQLデータベース: `localhost:5432`

## 開発用（ローカル実行）

Docker Composeを使わずにローカルで実行する場合：

1. **Goのインストール**
   Go 1.23以上をインストールしてください。

2. **依存パッケージのインストール**

   ```bash
   go mod tidy
   ```

3. **サーバーの起動**

   ```bash
   go run main.go
   ```

## データベース設定

PostgreSQL 17を使用しています。Docker Composeで自動的にセットアップされる設定：

- データベース名: `polimoney`
- ユーザー名: `postgres`
- パスワード: `postgres123`
- ポート: `5432`
