from sqlalchemy.orm import Session

from app.database import get_db


def get_database_session() -> Session:
    """依存性注入で使用するためのデータベースセッション取得関数

    get_db()関数のエイリアスで、依存性注入の文脈で
    データベースセッションが必要な場合に使用する。
    実際にはget_db()を呼び出してセッションを取得する。

    Returns:
        Session: SQLAlchemyのデータベースセッション
    """
    return next(get_db())
