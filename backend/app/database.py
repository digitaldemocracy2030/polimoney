import logging

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# SQLAlchemy database engine
engine = create_engine(
    settings.sqlalchemy_database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=settings.debug,  # SQLクエリをログに出力（開発時のみ）
    poolclass=StaticPool if settings.env == "testing" else None,
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()


def get_db() -> Session:
    """データベースセッションを取得する依存関数

    FastAPIの依存性注入で使用するためのジェネレータ関数。
    リクエストごとに新しいデータベースセッションを作成し、
    リクエスト終了後に自動的にクローズする。

    Yields:
        Session: SQLAlchemyのデータベースセッション
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """すべてのデータベーステーブルを作成する

    Base.metadata.create_all()を使用して、定義されたすべての
    SQLAlchemyモデルに対応するデータベーステーブルを作成する。

    Raises:
        Exception: テーブル作成に失敗した場合
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def drop_tables():
    """すべてのデータベーステーブルを削除する（注意して使用すること！）

    Base.metadata.drop_all()を使用して、定義されたすべての
    SQLAlchemyモデルに対応するデータベーステーブルを削除する。
    この操作はデータを完全に失うため、本番環境では使用しないこと。

    Raises:
        Exception: テーブル削除に失敗した場合
    """
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {e}")
        raise


def init_db():
    """データベースを基本データで初期化する

    デフォルトのユーザーロール（admin, user）を作成する。
    これらのロールが存在しない場合のみ新規作成し、既存のデータは保持する。

    Raises:
        Exception: データベース初期化に失敗した場合
    """
    from app.models.user import Role

    db = SessionLocal()
    try:
        # Create default roles if they don't exist
        admin_role = db.query(Role).filter(Role.name == "admin").first()
        if not admin_role:
            admin_role = Role(name="admin", description="管理者権限")
            db.add(admin_role)

        user_role = db.query(Role).filter(Role.name == "user").first()
        if not user_role:
            user_role = Role(name="user", description="一般ユーザー")
            db.add(user_role)

        db.commit()
        logger.info("Database initialized with default roles")

    except Exception as e:
        db.rollback()
        logger.error(f"Failed to initialize database: {e}")
        raise
    finally:
        db.close()
