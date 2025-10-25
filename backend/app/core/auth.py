from typing import Any, Dict, Optional

from sqlalchemy.orm import Session, joinedload

from app import models


class AuthService:
    """認証サービス

    Auth0と連携したユーザー管理のための認証サービスクラス。
    """

    def __init__(self, db: Session):
        """AuthServiceを初期化する

        Args:
            db (Session): データベースセッション
        """
        self.db = db

    def get_user_by_id(self, auth0_user_id: str) -> Optional[models.User]:
        """Auth0ユーザーIDで現在のユーザーを取得する

        Auth0のユーザーID（sub）でデータベースからユーザーを検索する。

        Args:
            auth0_user_id (str): Auth0のユーザーID（sub）

        Returns:
            Optional[models.User]: 見つかった場合はユーザーオブジェクト、見つからない場合はNone
        """
        return (
            self.db.query(models.User)
            .options(joinedload(models.User.role))
            .filter(models.User.auth0_user_id == auth0_user_id)
            .first()
        )

    def sync_user(self, auth0_payload: Dict[str, Any]) -> models.User:
        """Auth0ユーザーをローカルデータベースに同期する

        Auth0のJWTペイロードからユーザー情報を取得し、
        ローカルデータベースに新規ユーザーとして作成する。
        初回ログイン時に呼び出される。

        Args:
            auth0_payload (Dict[str, Any]): Auth0のJWTペイロード

        Returns:
            models.User: 作成されたユーザーオブジェクト

        Raises:
            ValueError: デフォルトロールが見つからない場合
        """
        auth0_user_id = auth0_payload.get("sub")
        email = auth0_payload.get("email", f"{auth0_user_id}@auth0.user")
        username = (
            auth0_payload.get("nickname")
            or auth0_payload.get("name")
            or auth0_user_id.split("|")[-1]
        )
        email_verified = auth0_payload.get("email_verified", False)

        # デフォルトのユーザーロールを取得
        user_role = (
            self.db.query(models.Role).filter(models.Role.name == "user").first()
        )
        if not user_role:
            raise ValueError("デフォルトのユーザーロールが見つかりません")

        # 新規ユーザーを作成
        db_user = models.User(
            auth0_user_id=auth0_user_id,
            username=username,
            email=email,
            email_verified=email_verified,
            role_id=user_role.id,
        )

        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)

        return db_user
