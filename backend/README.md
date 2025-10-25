# Polimoney バックエンド

- 言語：Python 3.11+
- フレームワーク：FastAPI
- 認証：Auth0
- データベース：Azure SQL Database
- ORM：SQLAlchemy 2.0 + Alembic
- コンテナ化：Docker & docker-compose

## セットアップ手順

### 前提条件

- Python 3.11+
- Auth0 アカウント
- Azure SQL Database アカウント
- Docker & Docker Compose (オプション)

### Auth0の設定

1. **Auth0アカウントの作成**
   - [Auth0](https://auth0.com/)でアカウントを作成

2. **APIの作成**
   - Auth0ダッシュボードで「Applications」→「APIs」→「Create API」
   - Name: `Polimoney API`
   - Identifier: `https://api.polimoney.com` (任意のURL)
   - Signing Algorithm: `RS256`

3. **アプリケーションの作成**
   - Auth0ダッシュボードで「Applications」→「Applications」→「Create Application」
   - Name: `Polimoney Frontend`
   - Type: `Single Page Application`
   - Allowed Callback URLs, Allowed Logout URLs, Allowed Web Originsを設定

4. **必要な情報を取得**
   - Domain: `your-tenant.auth0.com`
   - API Audience: `https://api.polimoney.com`
   - Client ID: アプリケーションのClient ID

### 環境変数の設定

環境変数を設定してください：

```bash
cp .env.example .env
# .envファイルを編集してAuth0とAzure SQL Databaseの接続情報を設定
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
   Python 3.13以上をインストールしてください。

2. **依存パッケージ・環境変数のインストール**

   ```bash
   uv pip install -r requirements.txt

   # mac, linux
   cp -i .env.example .env

   # windows
   Copy-Item .env.example .env

   ```

3. **データベースマイグレーション** (必要なら)

   ```bash
   # マイグレーション実行
   alembic upgrade head
   ```

4. **サーバーの起動**

   ```bash
   python -m uvicorn app.main:app --reload
   ```

## 環境変数

以下の環境変数を`.env`ファイルに設定してください：

### Auth0設定

```bash
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_API_AUDIENCE=https://api.polimoney.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_ISSUER=https://your-tenant.auth0.com/
AUTH0_ALGORITHMS=["RS256"]
```

### データベース設定

Azure SQL Databaseを使用しています：

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

### アプリケーション設定

```bash
ENV=development
DEBUG=true
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=["http://localhost:3000","http://localhost:8080"]
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

## アーキテクチャ

このプロジェクトはFastAPIをベースとした**3層クリーンアーキテクチャ**を採用しています。各層が明確に分離されており、保守性とテスト容易性を確保しています。

### 全体構造

```
┌─────────────────┐
│   Presentation  │  ← APIルーター (HTTPリクエスト/レスポンス)
├─────────────────┤
│ Business Logic  │  ← サービス層 (ビジネスルール・認証)
├─────────────────┤
│ Data Access    │  ← リポジトリ層 (データ永続化)
└─────────────────┘
```

### 各層の詳細

#### 1. プレゼンテーション層 (Presentation Layer)
**場所**: `app/routers/`
**役割**: HTTPリクエストの処理とレスポンスの生成
- APIエンドポイントの定義 (`@router.get`, `@router.post` など)
- リクエストデータのバリデーションとレスポンスのシリアライズ
- HTTPステータスコードとエラーレスポンスの管理
- **主なファイル**: `auth.py`, `users.py`, `political_funds.py` など

#### 2. ビジネスロジック層 (Business Logic Layer)
**場所**: `app/core/`
**役割**: アプリケーションのビジネスルールとドメインlogic
- 認証・認可ロジック
- データのバリデーションと処理
- ビジネスルールの適用
- サービスクラスの実装
- **主なファイル**: `auth.py` (AuthService), `security.py`

#### 3. データアクセス層 (Data Access Layer)
**場所**: `app/models/`, `app/database.py`
**役割**: データの永続化と取得
- SQLAlchemyモデル定義
- データベース接続とセッション管理
- CRUD操作の実行
- **主なファイル**: `user.py`, `political_funds.py` (モデル定義)

### 補助層

#### スキーマ層 (Schema Layer)
**場所**: `app/schemas/`
**役割**: データ構造の定義とバリデーション
- Pydanticモデルによるリクエスト/レスポンス定義
- APIデータのシリアライズ/デシリアライズ
- 入力データのバリデーション

#### 依存関係層 (Dependencies Layer)
**場所**: `app/dependencies/`
**役割**: FastAPIの依存性注入管理
- データベースセッションの注入
- 認証済みユーザーの取得
- サービスインスタンスの生成

#### 設定層 (Configuration Layer)
**場所**: `app/config.py`
**役割**: アプリケーション設定の集中管理
- 環境変数の読み込み
- 設定値のバリデーション

### アーキテクチャの特徴

#### 依存性の逆転
- 上位層（プレゼンテーション層）は下位層（ビジネスロジック層）に依存
- 下位層はインターフェース（抽象）に依存することで、具体的な実装との疎結合を実現

#### 依存性注入 (DI)
FastAPIの強力な依存性注入システムを活用：
```python
# 依存関係の定義
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    # Auth0トークン検証とユーザー取得
    payload = verify_auth0_token(credentials.credentials)
    # ...
```

#### 関心の分離
各層が独立した責任を持ち、変更が他の層に影響しにくい設計：
- **プレゼンテーション層**: HTTP通信のみ担当
- **ビジネスロジック層**: ビジネスルールのみ担当
- **データアクセス層**: データ永続化のみ担当

### 利点

1. **保守性**: 各層の責任が明確で変更の影響範囲が限定される
2. **テスト容易性**: 各層を独立してユニットテスト可能
3. **再利用性**: ビジネスロジックを複数のAPIで再利用可能
4. **拡張性**: 新機能の追加や既存機能の変更が容易

## 環境変数一覧

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `AUTH0_DOMAIN` | Auth0テナントドメイン | ○ |
| `AUTH0_API_AUDIENCE` | Auth0 API識別子 | ○ |
| `AUTH0_CLIENT_ID` | Auth0クライアントID | ○ |
| `AUTH0_ISSUER` | Auth0発行者URL | ○ |
| `DATABASE_URL` | Azure SQL Database接続文字列 | ○ |
| `ENV` | 実行環境 (development/production) | △ |
| `DEBUG` | デバッグモード | △ |
| `CORS_ORIGINS` | 許可するオリジンのリスト | △ |

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

# ドキュメントビルド
cd docs
make html
```
