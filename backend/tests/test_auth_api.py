import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import create_access_token


class TestAuthAPI:
    """認証APIのテストケース

    認証関連のAPIエンドポイントをテストするクラス。
    """
    @pytest.mark.asyncio
    async def test_signup_success(self, db_session: Session):
        """正常なユーザー登録APIテスト"""
        from app.core.auth import AuthService
        from app.schemas.user import UserCreate

        # 直接サービスを呼び出してテスト
        auth_service = AuthService(db_session)

        user_data = UserCreate(
            email="signup@example.com",
            password="password123",
            username="signupuser",
            role="user"
        )

        user = auth_service.register_user(user_data)

        assert user.email == "signup@example.com"
        assert user.username == "signupuser"
        assert user.role.name == "user"

        # DBに保存されていることを確認
        db_user = db_session.query(User).filter(User.email == "signup@example.com").first()
        assert db_user is not None

    @pytest.mark.asyncio
    async def test_signup_duplicate_email(self, async_client: AsyncClient, db_session: Session):
        """重複メールアドレスでの登録APIテスト"""
        # 最初のユーザー作成
        user_data1 = {
            "email": "duplicate@example.com",
            "password": "password123",
            "username": "user1",
            "role": "user"
        }
        response1 = await async_client.post("/api/v1/signup", json=user_data1)
        assert response1.status_code == 201

        # 同じメールアドレスで2人目のユーザー作成
        user_data2 = {
            "email": "duplicate@example.com",
            "password": "password456",
            "username": "user2",
            "role": "user"
        }
        response2 = await async_client.post("/api/v1/signup", json=user_data2)

        assert response2.status_code == 400
        data = response2.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_login_success(self, async_client: AsyncClient, db_session: Session):
        """正常なログインAPIテスト"""
        # ユーザー作成
        user_data = {
            "email": "login@example.com",
            "password": "password123",
            "username": "loginuser",
            "role": "user"
        }
        await async_client.post("/api/v1/signup", json=user_data)

        # ログイン
        login_data = {
            "email": "login@example.com",
            "password": "password123"
        }
        response = await async_client.post("/api/v1/login", json=login_data)

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "token_type" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client: AsyncClient, db_session: Session):
        """誤ったパスワードでのログインAPIテスト"""
        # ユーザー作成
        user_data = {
            "email": "wrongpass@example.com",
            "password": "correctpassword",
            "username": "wrongpassuser",
            "role": "user"
        }
        await async_client.post("/api/v1/signup", json=user_data)

        # 誤ったパスワードでログイン
        login_data = {
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        }
        response = await async_client.post("/api/v1/login", json=login_data)

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client: AsyncClient):
        """存在しないユーザーでのログインAPIテスト"""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = await async_client.post("/api/v1/login", json=login_data)

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data


class TestProtectedRoutes:
    """保護されたルートのテストケース

    認証が必要なAPIエンドポイントをテストするクラス。
    """
    @pytest.mark.asyncio
    async def test_profile_access_with_valid_token(self, async_client: AsyncClient, db_session: Session):
        """有効なトークンでのプロファイルアクセステスト"""
        # ユーザー作成とログイン
        user_data = {
            "email": "profile@example.com",
            "password": "password123",
            "username": "profileuser",
            "role": "user"
        }
        await async_client.post("/api/v1/signup", json=user_data)

        login_data = {
            "email": "profile@example.com",
            "password": "password123"
        }
        login_response = await async_client.post("/api/v1/login", json=login_data)
        token = login_response.json()["access_token"]

        # プロファイル取得
        headers = {"Authorization": f"Bearer {token}"}
        response = await async_client.get("/api/v1/profile", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "profile@example.com"
        assert data["username"] == "profileuser"

    @pytest.mark.asyncio
    async def test_profile_access_without_token(self, async_client: AsyncClient):
        """トークンなしでのプロファイルアクセステスト"""
        response = await async_client.get("/api/v1/profile")

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_profile_access_with_invalid_token(self, async_client: AsyncClient):
        """無効なトークンでのプロファイルアクセステスト"""
        headers = {"Authorization": "Bearer invalid_token"}
        response = await async_client.get("/api/v1/profile", headers=headers)

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
