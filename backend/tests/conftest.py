import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from httpx import AsyncClient
from fastapi.testclient import TestClient
from pytest_asyncio import fixture as async_fixture

from app.database import Base
from app.config import Settings
from app.main import app


@pytest.fixture(scope="session")
def test_settings():
    """Test settings with in-memory SQLite database"""
    return Settings(
        database_url="sqlite:///:memory:",
        jwt_secret="test_secret",
        password_salt="test_salt",
        env="testing",
        debug=False
    )


@pytest.fixture(scope="session")
def test_engine(test_settings):
    """Create test database engine"""
    engine = create_engine(
        test_settings.database_url,
        connect_args={"check_same_thread": False} if "sqlite" in test_settings.database_url else {},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)

    # Create initial data for tests
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()

    try:
        # Create roles
        from app.models.user import Role
        user_role = Role(name="user", description="Regular user")
        admin_role = Role(name="admin", description="Administrator")
        session.add(user_role)
        session.add(admin_role)
        session.commit()
    except Exception as e:
        session.rollback()
        print(f"Error creating initial test data: {e}")
    finally:
        session.close()

    yield engine
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session(test_engine):
    """Create test database session"""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client():
    """Synchronous test client"""
    return TestClient(app)


@async_fixture
async def async_client():
    """Asynchronous test client using httpx"""
    from httpx import ASGITransport
    from fastapi import FastAPI

    # Create test app without lifespan to avoid database initialization conflicts
    test_app = FastAPI(
        title="Polimoney API - Test",
        description="政治資金収支報告書・選挙運動費用収支報告書管理システム",
        version="1.0.0",
    )

    # Include routers (same as main app)
    from app.routers import auth, users, health, political_funds, election_funds, profile

    test_app.include_router(health.router, prefix="/api/v1", tags=["health"])
    test_app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])
    test_app.include_router(users.router, prefix="/api/v1/admin", tags=["users"])
    test_app.include_router(profile.router, prefix="/api/v1", tags=["profile"])
    test_app.include_router(political_funds.router, prefix="/api/v1/admin", tags=["political-funds"])
    test_app.include_router(election_funds.router, prefix="/api/v1/admin", tags=["election-funds"])

    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://testserver") as client:
        yield client
