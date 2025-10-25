import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session
from app.routers.health import health_check


class TestHealthAPI:
    """ヘルスチェックAPIのテストケース

    ヘルスチェックエンドポイントをテストするクラス。
    """
    @pytest.mark.asyncio
    async def test_health_check(self, db_session: Session):
        """ヘルスチェックAPIテスト"""
        # 直接関数を呼び出してテスト
        result = await health_check(db=db_session)

        assert result["status"] == "healthy"
        assert result["database"] == "healthy"
        assert "timestamp" in result
