# Polimoney Backend - Python FastAPI 移行仕様書

## 概要

このドキュメントは、既存のGo/GinベースのPolimoneyバックエンドをPython FastAPIにリプレイスするための完全な仕様書です。

### 現在のシステム概要

Polimoneyは、政治資金収支報告書と選挙運動費用収支報告書の管理システムです。

**現在の技術スタック（Go版）:**
- 言語: Go 1.23+
- フレームワーク: Gin
- データベース: PostgreSQL 17
- コンテナ化: Docker + docker-compose
- 認証: JWT + bcrypt

**新技術スタック（Python FastAPI版）:**
- 言語: Python 3.11+
- フレームワーク: FastAPI
- データベース: Azure SQL Database (SQL Server)
- ORM: SQLAlchemy 2.0 + Alembic (マイグレーション)
- 認証: JWT + passlib
- コンテナ化: Docker + docker-compose
- バリデーション: Pydantic
- ドキュメント: Swagger UI / ReDoc (FastAPI自動生成)

## アーキテクチャ

### ディレクトリ構造（Python版）

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPIアプリケーションエントリーポイント
│   ├── config.py               # 設定管理
│   ├── database.py             # データベース接続・セッション管理
│   ├── models/                 # SQLAlchemyモデル定義
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── political_funds.py
│   │   └── election_funds.py
│   ├── schemas/                # Pydanticスキーマ定義
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── political_funds.py
│   │   └── election_funds.py
│   ├── routers/                # APIルーター
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── political_funds.py
│   │   ├── election_funds.py
│   │   └── health.py
│   ├── core/                   # コア機能
│   │   ├── __init__.py
│   │   ├── auth.py             # JWT認証ロジック
│   │   └── security.py         # パスワードハッシュ化
│   ├── dependencies/           # 依存性注入
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── database.py
│   └── utils/                  # ユーティリティ関数
│       ├── __init__.py
│       └── validators.py
├── tests/                      # テスト
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   ├── test_political_funds.py
│   └── test_election_funds.py
├── alembic/                    # データベースマイグレーション
│   ├── versions/
│   ├── env.py
│   └── script.py.mako
├── scripts/                    # ユーティリティスクリプト
│   └── create_admin.py
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
├── pytest.ini
└── README.md
```

## API仕様

### エンドポイント一覧

#### ヘルスチェック
- `GET /api/v1/health` - ヘルスチェック

#### 認証
- `POST /api/v1/auth/signup` - ユーザー登録
- `POST /api/v1/auth/login` - ログイン

#### ユーザー管理（管理者専用）
- `GET /api/v1/admin/users` - 全ユーザー取得
- `GET /api/v1/admin/users/{user_id}` - 特定ユーザー取得

#### マイページ
- `GET /api/v1/profile` - マイページ情報取得

#### 政治資金収支報告書（管理者専用）
- `POST /api/v1/admin/political-funds` - 政治資金データ登録
- `GET /api/v1/admin/political-funds` - 政治資金データ一覧取得（TODO）
- `GET /api/v1/admin/political-funds/{id}` - 政治資金データ詳細取得（TODO）

#### 選挙運動費用収支報告書（管理者専用）
- `POST /api/v1/admin/election-funds` - 選挙資金データ登録
- `GET /api/v1/admin/election-funds` - 選挙資金データ一覧取得（TODO）
- `GET /api/v1/admin/election-funds/{id}` - 選挙資金データ詳細取得（TODO）

### 認証・認可

- JWTトークンベース認証
- 管理者権限が必要なエンドポイントは `admin` プレフィックス
- マイページは認証済みユーザーのみアクセス可能

## データモデル

### User（ユーザー）

```python
class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(Integer, ForeignKey("roles.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # リレーション
    role: Mapped["Role"] = relationship("Role", back_populates="users")
```

### Role（ロール）

```python
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # リレーション
    users: Mapped[List["User"]] = relationship("User", back_populates="role")
```

### PoliticalFunds（政治資金収支報告書）

```python
class PoliticalFunds(Base):
    __tablename__ = "political_funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, comment="ユーザーID")
    organization_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="団体名")
    organization_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="団体種別")
    representative_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="代表者名")
    report_year: Mapped[int] = mapped_column(Integer, nullable=False, comment="報告年度")

    # TODO: 政治資金収支報告書の具体的なデータ構造を定義
    # income: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収入合計")
    # expenditure: Mapped[Optional[int]] = mapped_column(BigInteger, comment="支出合計")
    # balance: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収支差額")
    # income_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="収入内訳（JSON形式）")
    # expenditure_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="支出内訳（JSON形式）")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

### ElectionFunds（選挙運動費用収支報告書）

```python
class ElectionFunds(Base):
    __tablename__ = "election_funds"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, comment="ユーザーID")
    candidate_name: Mapped[str] = mapped_column(String(255), nullable=False, comment="候補者名")
    election_type: Mapped[str] = mapped_column(String(100), nullable=False, comment="選挙種別")
    election_area: Mapped[str] = mapped_column(String(255), nullable=False, comment="選挙区")
    election_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, comment="選挙実施日")
    political_party: Mapped[Optional[str]] = mapped_column(String(255), comment="所属政党")

    # TODO: 選挙資金収支報告書の具体的なデータ構造を定義
    # total_income: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収入合計")
    # total_expenditure: Mapped[Optional[int]] = mapped_column(BigInteger, comment="支出合計")
    # balance: Mapped[Optional[int]] = mapped_column(BigInteger, comment="収支差額")
    # donations: Mapped[Optional[int]] = mapped_column(BigInteger, comment="寄付金額")
    # personal_funds: Mapped[Optional[int]] = mapped_column(BigInteger, comment="自己資金")
    # party_support: Mapped[Optional[int]] = mapped_column(BigInteger, comment="政党支援金")
    # income_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="収入内訳（JSON形式）")
    # expenditure_breakdown: Mapped[Optional[str]] = mapped_column(Text, comment="支出内訳（JSON形式）")

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
```

## Pydanticスキーマ

### 認証スキーマ

```python
class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None
```

### ユーザー管理スキーマ

```python
class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None

class Role(RoleBase):
    id: int
    created_at: datetime
    updated_at: datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class User(UserBase):
    id: int
    role: Role
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime
```

### 政治資金スキーマ

```python
class PoliticalFundsBase(BaseModel):
    organization_name: str
    organization_type: str
    representative_name: str
    report_year: int

class PoliticalFundsCreate(PoliticalFundsBase):
    pass

class PoliticalFunds(PoliticalFundsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
```

### 選挙資金スキーマ

```python
class ElectionFundsBase(BaseModel):
    candidate_name: str
    election_type: str
    election_area: str
    election_date: datetime
    political_party: Optional[str] = None

class ElectionFundsCreate(ElectionFundsBase):
    pass

class ElectionFunds(ElectionFundsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
```

## データベーススキーマ

### マイグレーションスクリプト

Alembicを使用して以下のテーブルを作成：

1. `roles` - ロールテーブル
2. `users` - ユーザーテーブル
3. `user_sessions` - セッションテーブル
4. `login_attempts` - ログイン試行ログ
5. `password_reset_tokens` - パスワードリセットトークン
6. `political_funds` - 政治資金テーブル
7. `election_funds` - 選挙資金テーブル

### 初期データ

- ロール: admin, user
- 管理者ユーザー（開発用）

## セキュリティ仕様

### パスワードハッシュ化
- SHA256 + bcryptを使用（Go版との互換性維持）
- コストファクター: 12

### JWT設定
- アルゴリズム: HS256
- 有効期限: 24時間
- 秘密鍵: 環境変数 `JWT_SECRET`

### CORS設定
- 開発環境: 全許可
- 本番環境: 制限付き

## 環境設定

### 必須環境変数

```bash
# Azure SQL Database設定
DATABASE_SERVER=your-server.database.windows.net
DATABASE_NAME=your-database-name
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
DATABASE_DRIVER={ODBC Driver 18 for SQL Server}

# または接続文字列形式
DATABASE_URL=mssql+pyodbc://username:password@server.database.windows.net/database?driver=ODBC+Driver+18+for+SQL+Server

# セキュリティ設定
JWT_SECRET=your_jwt_secret_key_here
PASSWORD_SALT=your_password_salt_here

# アプリケーション設定
ENV=development  # development/production
DEBUG=True       # 開発時のみTrue

# サーバー設定
HOST=0.0.0.0
PORT=8000
```

## 依存関係（requirements.txt）

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
alembic==1.12.1
pyodbc==5.0.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
email-validator==2.1.0

# 開発・テスト用
pytest==7.4.3
pytest-asyncio==0.21.1
httpx==0.25.2
faker==20.1.0
```

## Docker設定

### Dockerfile

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# システム依存関係インストール（ODBCドライバー用）
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    unixodbc-dev \
    curl \
    gnupg \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/11/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードコピー
COPY . .

# ポート公開
EXPOSE 8000

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

# 起動コマンド
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml（開発環境用）

```yaml
services:
  app:
    build: .
    container_name: polimoney_api
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      PASSWORD_SALT: ${PASSWORD_SALT}
      ENV: development
      DEBUG: "True"
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    restart: unless-stopped
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 開発・テスト手順

### 開発環境セットアップ

1. リポジトリクローン
2. Python 3.11+ インストール
3. 依存関係インストール: `pip install -r requirements.txt`
4. 環境変数設定: `cp .env.example .env`
5. Azure SQL Database接続設定確認
6. マイグレーション実行: `alembic upgrade head`
7. サーバー起動: `uvicorn app.main:app --reload`

### テスト実行

```bash
# 全テスト実行
pytest

# カバレッジ付きテスト
pytest --cov=app --cov-report=html

# 特定テスト実行
pytest tests/test_auth.py
```

### APIドキュメント

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 移行タスクリスト

### Phase 1: プロジェクト構造作成
- [ ] Pythonプロジェクト構造作成
- [ ] requirements.txt作成
- [ ] Docker設定作成
- [ ] 環境設定ファイル作成

### Phase 2: コア機能実装
- [ ] データベース設定（SQLAlchemy）
- [ ] モデル定義
- [ ] Pydanticスキーマ定義
- [ ] 認証機能（JWT）
- [ ] セキュリティユーティリティ

### Phase 3: API実装
- [ ] ヘルスチェックエンドポイント
- [ ] 認証API（サインアップ/ログイン）
- [ ] ユーザー管理API
- [ ] マイページAPI
- [ ] 政治資金API
- [ ] 選挙資金API

### Phase 4: データベースマイグレーション
- [ ] Alembic設定
- [ ] 初期マイグレーション作成
- [ ] データ移行スクリプト（Go→Python）

### Phase 5: テスト・ドキュメント
- [ ] ユニットテスト作成
- [ ] 統合テスト作成
- [ ] APIドキュメント更新
- [ ] README更新

### Phase 6: デプロイ・運用
- [ ] Docker Compose設定
- [ ] 本番環境設定
- [ ] CI/CDパイプライン設定
- [ ] モニタリング設定

## 注意事項

1. **データ互換性**: Go版とのパスワードハッシュ互換性を維持
2. **API互換性**: エンドポイント構造を可能な限り維持
3. **パフォーマンス**: SQLAlchemy N+1問題に注意
4. **セキュリティ**: JWT秘密鍵の適切な管理
5. **テスト**: 十分なテストカバレッジを確保

## リスクと対策

1. **データ移行リスク**: 事前テストとバックアップ必須
2. **API互換性**: 既存クライアント影響を最小限に
3. **学習コスト**: FastAPI/SQLAlchemyの学習期間確保
4. **パフォーマンス**: 最適化のためのプロファイリング実施
