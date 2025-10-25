from typing import List

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Role(Base):
    """ユーザーの権限ロールを表すモデル

    システム内のユーザーロールを管理するテーブル。
    各ロールは固有の名前と説明を持ち、複数のユーザーが関連付けられる。

    Attributes:
        id (int): プライマリキー
        name (str): ロール名（ユニーク制約）
        description (str): ロールの説明
        created_at (datetime): 作成日時
        updated_at (datetime): 更新日時
        users (List[User]): このロールを持つユーザーのリスト
    """

    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    users: Mapped[List["User"]] = relationship("User", back_populates="role")


class User(Base):
    """システムユーザーを表すモデル

    アプリケーションのユーザー情報を管理するテーブル。
    認証、プロフィール、権限管理のための基本情報を含む。

    Attributes:
        id (int): プライマリキー
        username (str): ユーザー名（ユニーク制約）
        email (str): メールアドレス（ユニーク制約）
        password_hash (str): パスワードのハッシュ値
        role_id (int): ロールID（外部キー）
        is_active (bool): アカウントが有効かどうか
        email_verified (bool): メールアドレスが検証済みかどうか
        last_login (datetime): 最終ログイン日時
        created_at (datetime): アカウント作成日時
        updated_at (datetime): アカウント更新日時
        role (Role): 関連付けられたロール情報
    """

    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    email: Mapped[str] = mapped_column(
        String(100), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("roles.id"), nullable=False
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login: Mapped[DateTime] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    role: Mapped["Role"] = relationship("Role", back_populates="users")
