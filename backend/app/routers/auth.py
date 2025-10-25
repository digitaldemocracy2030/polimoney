from fastapi import APIRouter

from app import schemas
from app.config import settings

router = APIRouter()


@router.get("/auth/config", response_model=schemas.Auth0Config)
async def get_auth0_config():
    """Auth0設定情報を取得するエンドポイント

    フロントエンドがAuth0を初期化するために必要な設定情報を返却する。
    この情報は公開情報であり、認証は不要。

    Returns:
        schemas.Auth0Config: Auth0の設定情報（domain, client_id, audience）

    Note:
        - domain: Auth0のテナントドメイン
        - client_id: Auth0アプリケーションのクライアントID（フロントエンド用）
        - audience: Auth0 APIのオーディエンス識別子
    """
    return schemas.Auth0Config(
        domain=settings.auth0_domain,
        client_id=settings.auth0_client_id,
        audience=settings.auth0_api_audience,
    )
