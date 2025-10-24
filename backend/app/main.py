from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
from app.database import create_tables, init_db
from app.routers import auth, users, health, political_funds, election_funds, profile

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.env == "development" else logging.WARNING,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI application
    """
    logger.info("Starting Polimoney API server...")

    # Create database tables
    try:
        create_tables()
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

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
    openapi_url="/openapi.json"
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
    """
    Add request ID to response headers
    """
    import uuid
    request_id = str(uuid.uuid4())

    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler
    """
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )


# Include routers
app.include_router(
    health.router,
    prefix="/api/v1",
    tags=["health"]
)

app.include_router(
    auth.router,
    prefix="/api/v1",
    tags=["authentication"]
)

app.include_router(
    users.router,
    prefix="/api/v1/admin",
    tags=["users"],
    dependencies=[]  # Will be protected by individual endpoints
)

app.include_router(
    profile.router,
    prefix="/api/v1",
    tags=["profile"]
)

app.include_router(
    political_funds.router,
    prefix="/api/v1/admin",
    tags=["political-funds"],
    dependencies=[]  # Will be protected by individual endpoints
)

app.include_router(
    election_funds.router,
    prefix="/api/v1/admin",
    tags=["election-funds"],
    dependencies=[]  # Will be protected by individual endpoints
)


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Welcome to Polimoney API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )
