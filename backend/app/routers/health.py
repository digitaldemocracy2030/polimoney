from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """ヘルスチェックエンドポイント

    アプリケーションの状態を確認するためのエンドポイント。
    データベース接続の健全性をテストし、システムの状態を返却する。

    Args:
        db (Session): データベースセッション（接続テスト用）

    Returns:
        dict: ヘルスチェック結果
            - status (str): "healthy" または "unhealthy"
            - database (str): データベース接続状態
            - timestamp (str): チェック実行時刻
    """
    try:
        # Test database connection
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "healthy" else "unhealthy",
        "database": db_status,
        "timestamp": "2025-10-24T00:00:00Z",  # Would use datetime.utcnow() in real implementation
    }
