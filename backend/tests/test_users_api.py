import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.core.security import create_access_token


class TestUsersAPI:
    """ユーザーAPIのテストケース

    ユーザー関連のAPIエンドポイントをテストするクラス。
    """
    @pytest.mark.asyncio
    async def test_get_all_users_as_admin(self, async_client: AsyncClient, db_session: Session):
        """管理者として全ユーザー取得テスト"""
        # 管理者ユーザー作成
        admin_user = User(
            email="admin@example.com",
            username="admin",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 一般ユーザー作成
        regular_user = User(
            email="user@example.com",
            username="user",
            hashed_password="hashed_password",
            role=Role.USER
        )
        db_session.add(regular_user)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # 全ユーザー取得
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.get("/api/v1/admin/users", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 2  # 少なくとも2人のユーザーがいるはず

        # 管理者と一般ユーザーが含まれていることを確認
        emails = [user["email"] for user in data]
        assert "admin@example.com" in emails
        assert "user@example.com" in emails

    @pytest.mark.asyncio
    async def test_get_all_users_as_regular_user(self, async_client: AsyncClient, db_session: Session):
        """一般ユーザーとして全ユーザー取得テスト（アクセス拒否されるはず）"""
        # 一般ユーザー作成
        regular_user = User(
            email="regular@example.com",
            username="regular",
            hashed_password="hashed_password",
            role=Role.USER
        )
        db_session.add(regular_user)
        db_session.commit()

        # 一般ユーザートークン生成
        user_token = create_access_token({"sub": str(regular_user.id), "role": regular_user.role.value})

        # 全ユーザー取得試行
        headers = {"Authorization": f"Bearer {user_token}"}
        response = await async_client.get("/api/v1/admin/users", headers=headers)

        assert response.status_code == 403
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_get_user_by_id_as_admin(self, async_client: AsyncClient, db_session: Session):
        """管理者としてユーザー詳細取得テスト"""
        # 一般ユーザー作成
        user = User(
            email="detail@example.com",
            username="detailuser",
            hashed_password="hashed_password",
            role=Role.USER
        )
        db_session.add(user)
        db_session.commit()

        # 管理者ユーザー作成
        admin_user = User(
            email="admin2@example.com",
            username="admin2",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # ユーザー詳細取得
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.get(f"/api/v1/admin/users/{user.id}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "detail@example.com"
        assert data["username"] == "detailuser"
        assert data["role"] == "user"

    @pytest.mark.asyncio
    async def test_get_user_by_id_not_found(self, async_client: AsyncClient, db_session: Session):
        """存在しないユーザーIDでの詳細取得テスト"""
        # 管理者ユーザー作成
        admin_user = User(
            email="admin3@example.com",
            username="admin3",
            hashed_password="hashed_password",
            role=Role.ADMIN
        )
        db_session.add(admin_user)
        db_session.commit()

        # 管理者トークン生成
        admin_token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role.value})

        # 存在しないユーザーIDで取得試行
        headers = {"Authorization": f"Bearer {admin_token}"}
        response = await async_client.get("/api/v1/admin/users/99999", headers=headers)

        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
