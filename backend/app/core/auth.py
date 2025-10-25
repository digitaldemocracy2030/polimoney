from datetime import datetime
from typing import Optional

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.security import create_access_token, create_password_hash, verify_password
from app.utils.validators import validate_email


class AuthService:
    """認証サービス

    ユーザー管理のための認証サービスクラス。
    """
    def __init__(self, db: Session):
        """AuthServiceを初期化する

        Args:
            db (Session): データベースセッション
        """
        self.db = db

    def register_user(self, user_data: schemas.UserCreate) -> models.User:
        """新規ユーザーを登録する

        メールアドレスとユーザー名の重複チェックを行い、
        パスワードをハッシュ化して新しいユーザーを作成する。

        Args:
            user_data (schemas.UserCreate): ユーザー作成データ

        Returns:
            models.User: 作成されたユーザーオブジェクト

        Raises:
            ValueError: メールアドレスまたはユーザー名が既に存在する場合、
                       メールアドレス形式が無効な場合、デフォルトロールが見つからない場合
        """
        # Validate email format
        if not validate_email(user_data.email):
            raise ValueError("無効なメールアドレスです")

        # Check if user already exists
        existing_user = (
            self.db.query(models.User)
            .filter(
                (models.User.email == user_data.email)
                | (models.User.username == user_data.username)
            )
            .first()
        )
        if existing_user:
            if existing_user.email == user_data.email:
                raise ValueError("このメールアドレスは既に登録されています")
            else:
                raise ValueError("このユーザー名は既に使用されています")

        # Get default user role
        user_role = (
            self.db.query(models.Role).filter(models.Role.name == "user").first()
        )
        if not user_role:
            raise ValueError("デフォルトのユーザーロールが見つかりません")

        # Create password hash
        password_hash = create_password_hash(user_data.password)

        # Create user
        db_user = models.User(
            username=user_data.username,
            email=user_data.email,
            password_hash=password_hash,
            role_id=user_role.id,
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
        """メールアドレスとパスワードでユーザーを認証する

        メールアドレスでユーザーを検索し、パスワードを検証する。
        認証成功時は最終ログイン時刻を更新する。

        Args:
            email (str): ユーザーのメールアドレス
            password (str): ユーザーのパスワード（平文）

        Returns:
            Optional[models.User]: 認証成功時はユーザーオブジェクト、失敗時はNone
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
        """ユーザー用のJWTアクセストークンを作成する

        ユーザーのIDをペイロードに含むJWTトークンを生成する。

        Args:
            user (models.User): トークンを作成する対象ユーザー

        Returns:
            str: 生成されたJWTアクセストークン
        """
        return create_access_token({"sub": str(user.id)})

    def get_current_user(self, user_id: int) -> Optional[models.User]:
        """IDで現在のユーザーを取得する

        指定されたユーザーIDでデータベースからユーザーを検索する。

        Args:
            user_id (int): 取得するユーザーのID

        Returns:
            Optional[models.User]: 見つかった場合はユーザーオブジェクト、見つからない場合はNone
        """
        return self.db.query(models.User).filter(models.User.id == user_id).first()

    def get_user_with_role(self, user_id: int) -> Optional[models.User]:
        """ロール情報付きでユーザーを取得する

        指定されたユーザーIDでデータベースからユーザーを検索し、
        関連するロール情報も同時に読み込む。

        Args:
            user_id (int): 取得するユーザーのID

        Returns:
            Optional[models.User]: 見つかった場合はロール情報付きのユーザーオブジェクト、
                                 見つからない場合はNone
        """
        return (
            self.db.query(models.User)
            .options(self.db.joinedload(models.User.role))
            .filter(models.User.id == user_id)
            .first()
        )
