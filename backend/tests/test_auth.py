import pytest
from sqlalchemy.orm import Session
from app.core.auth import AuthService
from app.models.user import User, Role
from app.schemas.user import UserCreate
from app.core.security import verify_password


class TestAuthService:
    """AuthServiceのテストケース

    AuthServiceクラスの機能をテストするクラス。
    """
    def test_register_user_success(self, db_session: Session):
        """正常なユーザー登録テスト"""
        auth_service = AuthService(db_session)

        user_data = UserCreate(
            email="test@example.com",
            password="password123",
            username="testuser",
            role="user"
        )

        user = auth_service.register_user(user_data)

        assert user.email == "test@example.com"
        assert user.username == "testuser"
        assert user.role.name == "user"
        assert verify_password("password123", user.password_hash)

        # DBに保存されていることを確認
        db_user = db_session.query(User).filter(User.email == "test@example.com").first()
        assert db_user is not None
        assert db_user.email == "test@example.com"

    def test_register_user_duplicate_email(self, db_session: Session):
        """重複メールアドレスでの登録テスト"""
        auth_service = AuthService(db_session)

        # 最初のユーザー作成
        user_data1 = UserCreate(
            email="duplicate@example.com",
            password="password123",
            username="user1",
            role="user"
        )
        auth_service.register_user(user_data1)

        # 同じメールアドレスで2人目のユーザー作成（エラーになるはず）
        user_data2 = UserCreate(
            email="duplicate@example.com",
            password="password456",
            username="user2",
            role="user"
        )

        with pytest.raises(ValueError, match="このメールアドレスは既に登録されています"):
            auth_service.register_user(user_data2)

    def test_authenticate_user_success(self, db_session: Session):
        """正常なユーザー認証テスト"""
        auth_service = AuthService(db_session)

        # ユーザー作成
        user_data = UserCreate(
            email="auth@example.com",
            password="password123",
            username="authuser",
            role="user"
        )
        created_user = auth_service.register_user(user_data)

        # 認証
        authenticated_user = auth_service.authenticate_user("auth@example.com", "password123")

        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id
        assert authenticated_user.email == "auth@example.com"

    def test_authenticate_user_wrong_password(self, db_session: Session):
        """誤ったパスワードでの認証テスト"""
        auth_service = AuthService(db_session)

        # ユーザー作成
        user_data = UserCreate(
            email="wrongpass@example.com",
            password="correctpassword",
            username="wrongpassuser",
            role="user"
        )
        auth_service.register_user(user_data)

        # 誤ったパスワードで認証
        authenticated_user = auth_service.authenticate_user("wrongpass@example.com", "wrongpassword")

        assert authenticated_user is None

    def test_authenticate_user_nonexistent_email(self, db_session: Session):
        """存在しないメールアドレスでの認証テスト"""
        auth_service = AuthService(db_session)

        # 存在しないメールアドレスで認証
        authenticated_user = auth_service.authenticate_user("nonexistent@example.com", "password123")

        assert authenticated_user is None
