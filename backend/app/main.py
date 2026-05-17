"""
LexGuard AI — FastAPI Application Entry Point.

This module initializes the FastAPI application with:
- Security middleware (CORS, security headers)
- Rate limiting (slowapi)
- API router registration (upload, analyze, export)
- React SPA static file serving
- Health check endpoint

Architecture: Single Docker container on Cloud Run serving both
the FastAPI REST API (/api/*) and the React frontend (/*).
"""
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.routers import upload, analyze, export

# ── Logging configuration ────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

# ── Rate limiter (global) ────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan handler.

    Runs startup logic (creating upload directory) before yielding,
    then handles shutdown cleanup.
    """
    logger.info("LexGuard AI Backend starting up...")
    upload_dir = Path("/tmp/lexguard_uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Upload directory ready: {upload_dir}")
    yield
    logger.info("LexGuard AI Backend shutting down.")


# ── FastAPI application ──────────────────────────────────────────────
app = FastAPI(
    title="LexGuard AI API",
    description=(
        "AI-powered legal contract intelligence platform. "
        "Analyzes contracts using a 3-agent Gemini 1.5 Pro pipeline to detect risks, "
        "explain legal implications, and provide negotiation strategies."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── Rate limiting ────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS middleware ──────────────────────────────────────────────────
# In production, restrict allow_origins to your domain
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,
)


# ── Security headers middleware ──────────────────────────────────────
@app.middleware("http")
async def add_security_headers(request: Request, call_next: Callable) -> Response:
    """
    Add HTTP security headers to every response.

    Headers added:
    - X-Content-Type-Options: Prevents MIME sniffing
    - X-Frame-Options: Prevents clickjacking
    - X-XSS-Protection: Legacy XSS protection for older browsers
    - Referrer-Policy: Controls referrer information
    - Strict-Transport-Security: Enforces HTTPS
    - Permissions-Policy: Restricts browser feature access
    """
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


# ── API routers ──────────────────────────────────────────────────────
app.include_router(upload.router, prefix="/api", tags=["upload"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(export.router, prefix="/api", tags=["export"])


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    """
    Health check endpoint.

    Returns service status, version, and whether the Gemini API key
    is configured (without revealing the key value itself).
    """
    return {
        "status": "healthy",
        "service": "LexGuard AI",
        "version": "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }


# ── React SPA static serving ─────────────────────────────────────────
static_dir = Path(__file__).parent.parent / "static"

if static_dir.exists():
    # Serve Vite-built assets (JS, CSS, images)
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str, request: Request) -> FileResponse | dict:
        """
        Catch-all route that serves the React SPA for all non-API paths.

        This enables client-side routing (React Router) to work correctly
        when users navigate directly to /analyze or refresh the page.
        """
        # Never intercept actual API routes
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")

        index_html = static_dir / "index.html"
        if index_html.exists():
            return FileResponse(
                str(index_html),
                media_type="text/html",
                headers={"Cache-Control": "no-cache, no-store, must-revalidate"},
            )
        return {"message": "Frontend not built. Run: cd frontend && npm run build"}
