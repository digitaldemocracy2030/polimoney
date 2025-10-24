from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import logging

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
    """
    Dependency function to get database session.
    Use this in FastAPI dependency injection.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all database tables"""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def drop_tables():
    """Drop all database tables (use with caution!)"""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Failed to drop database tables: {e}")
        raise


def init_db():
    """Initialize database with basic data"""
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
