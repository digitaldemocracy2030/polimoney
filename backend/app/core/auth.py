from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app import models, schemas
from app.core.security import create_password_hash, verify_password, create_access_token
from app.utils.validators import validate_email


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register_user(self, user_data: schemas.UserCreate) -> models.User:
        """
        Register a new user
        """
        # Validate email format
        if not validate_email(user_data.email):
            raise ValueError("無効なメールアドレスです")

        # Check if user already exists
        existing_user = self.db.query(models.User).filter(
            (models.User.email == user_data.email) | (models.User.username == user_data.username)
        ).first()
        if existing_user:
            if existing_user.email == user_data.email:
                raise ValueError("このメールアドレスは既に登録されています")
            else:
                raise ValueError("このユーザー名は既に使用されています")

        # Get default user role
        user_role = self.db.query(models.Role).filter(models.Role.name == "user").first()
        if not user_role:
            raise ValueError("デフォルトのユーザーロールが見つかりません")

        # Create password hash
        password_hash = create_password_hash(user_data.password)

        # Create user
        db_user = models.User(
            username=user_data.username,
            email=user_data.email,
            password_hash=password_hash,
            role_id=user_role.id
        )

        try:
            self.db.add(db_user)
            self.db.commit()
            self.db.refresh(db_user)
            return db_user
        except IntegrityError:
            self.db.rollback()
            raise ValueError("ユーザー登録に失敗しました")

    def authenticate_user(self, email: str, password: str) -> Optional[models.User]:
        """
        Authenticate user with email and password
        """
        user = self.db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return None

        if not verify_password(password, user.password_hash):
            return None

        # Update last login
        user.last_login = datetime.utcnow()
        self.db.commit()

        return user

    def create_access_token_for_user(self, user: models.User) -> str:
        """
        Create JWT access token for user
        """
        return create_access_token({"sub": str(user.id)})

    def get_current_user(self, user_id: int) -> Optional[models.User]:
        """
        Get current user by ID
        """
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_user_with_role(self, user_id: int) -> Optional[models.User]:
        """
        Get user with role information
        """
        return self.db.query(models.User).options(
            self.db.joinedload(models.User.role)
        ).filter(models.User.id == user_id).first()
