import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database import create_tables, init_db
from app.dependencies.auth import get_current_admin_user
from app.routers import election_funds, health, profile

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.env == "development" else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPIアプリケーションのライフサイクルを管理するコンテキストマネージャー

    アプリケーション起動時にデータベースの初期化を行い、
    シャットダウン時にクリーンアップ処理を実行する。

    Args:
        app (FastAPI): FastAPIアプリケーションインスタンス

    Yields:
        None: アプリケーションの実行期間を示す

    Raises:
        Exception: データベース初期化に失敗した場合
    """
    logger.info("Starting Polimoney API server...")

    # Create database tables
    if not settings.debug:
        try:
            create_tables()
            init_db()
            logger.info("Database initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise
    else:
        logger.warning("Database initialization skipped (DEBUG=true)")

    yield

    logger.info("Shutting down Polimoney API server...")


# Create FastAPI application
app = FastAPI(
    title="Polimoney API",
    description="政治資金収支報告書・選挙運動費用収支報告書管理システム",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """HTTPリクエストに一意のリクエストIDを付与するミドルウェア

    各リクエストに対してUUIDを生成し、レスポンスヘッダーに
    X-Request-IDとして追加する。これによりログの追跡と
    デバッグが容易になる。

    Args:
        request (Request): FastAPIのリクエストオブジェクト
        call_next (Callable): 次のミドルウェアまたはエンドポイントを呼び出す関数

    Returns:
        Response: リクエストIDが追加されたレスポンスオブジェクト
    """
    import uuid

    request_id = str(uuid.uuid4())

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """アプリケーション全体の未処理例外をキャッチするグローバル例外ハンドラー

    予期せぬエラーが発生した場合に、適切なエラーレスポンスを返却し、
    ログにエラー情報を記録する。デバッグモード時は詳細なエラー情報を、
    本番環境時は一般的なエラーメッセージを返す。

    Args:
        request (Request): エラーが発生したリクエスト
        exc (Exception): 発生した例外オブジェクト

    Returns:
        JSONResponse: エラーレスポンスを含むJSONレスポンス
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred",
        },
    )


# Include routers
app.include_router(health.router, prefix="/api/v1", tags=["health"])

# app.include_router(auth.router, prefix="/api/v1", tags=["authentication"])

# app.include_router(
#     users.router,
#     prefix="/api/v1/admin",
#     tags=["users"],
#     dependencies=[Depends(get_current_admin_user)],
# )

# 本来はユーザーのマイページのためのエンドポイント
# auth0のテストをするためだけのコード
app.include_router(profile.router, prefix="/api/v1", tags=["profile"])

# app.include_router(
#     political_funds.router,
#     prefix="/api/v1/admin",
#     tags=["political-funds"],
#     dependencies=[
#         Depends(get_current_admin_user)
#     ],  # Will be protected by individual endpoints
# )

app.include_router(
    election_funds.router,
    prefix="/api/v1/admin",
    tags=["election-funds"],
    dependencies=[
        Depends(get_current_admin_user)
    ],  # Will be protected by individual endpoints
)


@app.get("/")
async def root():
    """APIのルートエンドポイント

    アプリケーションの基本情報を返却し、利用可能なエンドポイントへの
    リンクを提供する。APIの状態確認やドキュメントへのナビゲーションに使用する。

    Returns:
        dict: APIの基本情報と利用可能なエンドポイントのリンク
            - message (str): ウェルカムメッセージ
            - version (str): APIバージョン
            - docs (str): APIドキュメントのURL
            - health (str): ヘルスチェックエンドポイントのURL
    """
    return {
        "message": "Welcome to Polimoney API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
