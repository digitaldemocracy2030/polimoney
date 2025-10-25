from typing import Any, Dict, Optional

import requests
from jose import JWTError, jwk, jwt

from app.config import settings


def get_auth0_public_key(token: str) -> Optional[Dict[str, Any]]:
    """Auth0のJWKSから公開鍵を取得する

    JWTトークンのヘッダーからkidを取得し、
    Auth0のJWKSエンドポイントから対応する公開鍵を取得する。

    Args:
        token (str): JWTトークン

    Returns:
        Optional[Dict[str, Any]]: JWK形式の公開鍵。取得できない場合はNone
    """
    try:
        # JWTヘッダーからkidを取得
        headers = jwt.get_unverified_header(token)
        kid = headers.get("kid")
        if not kid:
            return None

        # JWKSエンドポイントから鍵を取得
        jwks_url = f"https://{settings.auth0_domain}/.well-known/jwks.json"
        response = requests.get(jwks_url)
        response.raise_for_status()
        jwks = response.json()

        # kidに一致する鍵を探す
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key

        return None
    except Exception:
        return None


def verify_auth0_token(token: str) -> Optional[Dict[str, Any]]:
    """Auth0 JWTトークンを検証する

    Auth0が発行したJWTトークンをRS256アルゴリズムで検証する。
    audience、issuer、署名をチェックする。

    Args:
        token (str): 検証するJWTトークン

    Returns:
        Optional[Dict[str, Any]]: トークンが有効な場合はデコードされたペイロード、無効な場合はNone
    """
    try:
        # 公開鍵を取得
        jwk_key = get_auth0_public_key(token)
        if not jwk_key:
            return None

        # JWKから公開鍵を構築
        public_key = jwk.construct(jwk_key)

        # トークンを検証
        payload = jwt.decode(
            token,
            public_key,
            algorithms=settings.auth0_algorithms,
            audience=settings.auth0_api_audience,
            issuer=settings.auth0_issuer,
        )

        return payload
    except JWTError:
        return None
