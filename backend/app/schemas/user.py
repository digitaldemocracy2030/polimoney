from datetime import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


# Role schemas
class RoleBase(BaseModel):
    """ロールの基本スキーマ

    ユーザー権限ロールの共通フィールドを定義するベースクラス。
    """

    name: str
    description: Optional[str] = None


class Role(RoleBase):
    """ロールの完全スキーマ

    ロールの全フィールドを含むレスポンス用スキーマ。
    データベースから取得したロール情報を表現する。
    """

    id: int
    created_at: datetime
    updated_at: datetime


class RoleCreate(RoleBase):
    """ロール作成用スキーマ

    新しいロールを作成するためのリクエスト用スキーマ。
    RoleBaseの全フィールドを継承する。
    """


# User schemas
class UserBase(BaseModel):
    """ユーザーの基本スキーマ

    ユーザー情報の共通フィールドを定義するベースクラス。
    認証やプロフィール表示で使用される基本的なフィールド。
    """

    username: str = Field(..., min_length=1, max_length=50)
    email: EmailStr


class User(UserBase):
    """ユーザーの完全スキーマ

    ユーザーの全フィールドを含むレスポンス用スキーマ。
    データベースから取得したユーザー情報を表現する。
    Auth0のユーザーIDと関連するロール情報も含む。
    """

    id: int
    auth0_user_id: str
    role: Role
    is_active: bool
    email_verified: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """ユーザー更新用スキーマ

    ユーザー情報を更新するためのリクエスト用スキーマ。
    全てのフィールドがオプションで、更新したいフィールドのみ指定可能。
    """

    username: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None
    email_verified: Optional[bool] = None


# Auth0 Config schema
class Auth0Config(BaseModel):
    """Auth0設定スキーマ

    フロントエンドがAuth0を初期化するために必要な設定情報。
    """

    domain: str
    client_id: str
    audience: str
