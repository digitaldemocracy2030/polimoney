# Polimoney バックエンド

- 言語：Python 3.11+
- フレームワーク：FastAPI
- データベース：Azure SQL Database
- ORM：SQLAlchemy 2.0 + Alembic
- コンテナ化：Docker & docker-compose

## セットアップ手順

### 前提条件

- Python 3.11+
- Azure SQL Database アカウント
- Docker & Docker Compose (オプション)

### 実行方法

まず最初に、環境変数を設定してください：

```bash
cp .env.example .env
# .envファイルを編集してAzure SQL Databaseの接続情報を設定
```

## Docker Composeで起動（推奨）

プロジェクトディレクトリで以下のコマンドを実行してください：

```bash
docker-compose up --build
```

これで以下のサービスが起動します：

- APIサーバー: `http://localhost:8000`
- 自動生成APIドキュメント: `http://localhost:8000/docs`

## 開発用（ローカル実行）

Docker Composeを使わずにローカルで実行する場合：

1. **Pythonのインストール**
   Python 3.11以上をインストールしてください。

2. **依存パッケージのインストール**

   ```bash
   uv pip install -r requirements.txt
   ```

3. **データベースマイグレーション**

   ```bash
   # マイグレーション実行
   alembic upgrade head

   # 初期データ投入（オプション）
   python scripts/create_admin.py
   ```

4. **サーバーの起動**

   ```bash
   uvicorn app.main:app --reload
   ```

## データベース設定

Azure SQL Databaseを使用しています。以下の環境変数を設定してください：

```bash
# 接続文字列形式
DATABASE_URL=mssql+pyodbc://username:password@server.database.windows.net/database?driver=ODBC+Driver+18+for+SQL+Server

# または個別設定
DATABASE_SERVER=your-server.database.windows.net
DATABASE_NAME=your-database-name
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
DATABASE_DRIVER={ODBC Driver 18 for SQL Server}
```

## APIドキュメント

FastAPIにより自動生成されるAPIドキュメント：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI Schema: `http://localhost:8000/openapi.json`

## テスト実行

```bash
# 全テスト実行
pytest

# カバレッジレポート付き
pytest --cov=app --cov-report=html

# 特定のテスト実行
pytest tests/test_auth.py
```

## プロジェクト構造

```
backend/
├── app/
│   ├── main.py                 # FastAPIアプリケーション
│   ├── config.py               # 設定管理
│   ├── database.py             # DB接続・セッション管理
│   ├── models/                 # SQLAlchemyモデル
│   ├── schemas/                # Pydanticスキーマ
│   ├── routers/                # APIルーター
│   ├── core/                   # 認証・セキュリティ
│   ├── dependencies/           # 依存性注入
│   └── utils/                  # ユーティリティ
├── tests/                      # テスト
├── alembic/                    # DBマイグレーション
├── scripts/                    # ユーティリティスクリプト
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── pytest.ini
```

## 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `DATABASE_URL` | Azure SQL Database接続文字列 | ○ |
| `JWT_SECRET` | JWT署名用の秘密鍵 | ○ |
| `PASSWORD_SALT` | パスワードハッシュ用のソルト | ○ |
| `ENV` | 実行環境 (development/production) | △ |
| `DEBUG` | デバッグモード | △ |

## 開発コマンド

```bash
# 依存関係インストール
uv pip install -r requirements.txt

# マイグレーション作成
alembic revision --autogenerate -m "migration message"

# マイグレーション実行
alembic upgrade head

# サーバー起動
uvicorn app.main:app --reload

# テスト実行
pytest

# フォーマット
black .
isort .
```
