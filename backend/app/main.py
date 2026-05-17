"""
LexGuard AI — FastAPI Application Entry Point.

This module initializes the FastAPI application with:
- GZip response compression (efficiency)
- Security middleware (CORS, security headers)
- Rate limiting (slowapi)
- Cache-Control headers for static assets
- API router registration (upload, analyze, export)
- React SPA static file serving
- Health check endpoint

Architecture: Single Docker container on Cloud Run serving both
the FastAPI REST API (/api/*) and the React frontend (/*)
with automatic GZip compression for all responses > 1KB.
"""
import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Callable

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
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

# ── Static asset cache TTL (1 week for immutable hashed assets) ──────
ASSET_CACHE_CONTROL = "public, max-age=604800, immutable"
HTML_CACHE_CONTROL  = "no-cache, no-store, must-revalidate"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan handler.

    Runs startup logic (creating upload directory) before yielding,
    then handles graceful shutdown cleanup.

    Yields:
        None — control is returned to FastAPI during the app lifetime.
    """
    logger.info("LexGuard AI Backend starting up...")
    upload_dir = Path("/tmp/lexguard_uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Upload directory ready: {upload_dir}")
    yield
    logger.info("LexGuard AI Backend shutting down...")


# ── FastAPI application ──────────────────────────────────────────────
app = FastAPI(
    title="LexGuard AI API",
    description=(
        "AI-powered legal contract intelligence platform. "
        "Analyzes contracts using a 3-agent Gemini 2.0 Flash pipeline to detect risks, "
        "explain legal implications in plain English, and provide negotiation strategies. "
        "Supports PDF, DOCX, and scanned documents via OCR."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── GZip compression (efficiency: reduces response size 60-80%) ───────
app.add_middleware(GZipMiddleware, minimum_size=1000)

# ── Rate limiting ────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS middleware ──────────────────────────────────────────────────
ALLOWED_ORIGINS: list[str] = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
    max_age=600,
)


# ── Security + Cache headers middleware ──────────────────────────────
@app.middleware("http")
async def add_security_and_cache_headers(request: Request, call_next: Callable) -> Response:
    """
    Add HTTP security headers and smart cache-control to every response.

    Security headers added:
    - X-Content-Type-Options: Prevents MIME-type sniffing attacks
    - X-Frame-Options: Prevents clickjacking via iframe embedding
    - X-XSS-Protection: Legacy XSS protection for older browsers
    - Referrer-Policy: Controls how much referrer info is sent
    - Strict-Transport-Security: Enforces HTTPS for 1 year
    - Permissions-Policy: Disables unused browser features

    Cache headers:
    - Static assets (/assets/*): 1 week immutable cache
    - HTML/API: no-cache to ensure fresh content

    Args:
        request:   The incoming HTTP request.
        call_next: The next middleware or route handler.

    Returns:
        Response with security and cache headers attached.
    """
    response: Response = await call_next(request)

    # Security headers — applied to every response
    response.headers["X-Content-Type-Options"]  = "nosniff"
    response.headers["X-Frame-Options"]          = "DENY"
    response.headers["X-XSS-Protection"]         = "1; mode=block"
    response.headers["Referrer-Policy"]          = "strict-origin-when-cross-origin"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Permissions-Policy"]       = "camera=(), microphone=(), geolocation=()"

    # Smart cache-control for static assets (Vite hashes filenames)
    path = request.url.path
    if path.startswith("/assets/"):
        response.headers["Cache-Control"] = ASSET_CACHE_CONTROL
    elif path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    else:
        response.headers["Cache-Control"] = HTML_CACHE_CONTROL

    return response


# ── API routers ──────────────────────────────────────────────────────
app.include_router(upload.router,  prefix="/api", tags=["upload"])
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(export.router,  prefix="/api", tags=["export"])


@app.get("/api/health", tags=["health"])
async def health() -> dict:
    """
    Health check endpoint for Cloud Run uptime monitoring.

    Returns service name, version, and Gemini API key presence
    (the key value is never exposed — only a boolean flag).

    Returns:
        dict: Health status payload with gemini_configured flag.
    """
    return {
        "status":            "healthy",
        "service":           "LexGuard AI",
        "version":           "1.0.0",
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
    }


# ── React SPA static serving ─────────────────────────────────────────
_static_dir = Path(__file__).parent.parent / "static"

if _static_dir.exists():
    # Serve Vite-built assets (JS, CSS, source maps) with long-lived cache
    _assets_dir = _static_dir / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False, response_model=None)
    async def serve_frontend(full_path: str, request: Request) -> FileResponse | dict:
        """
        Catch-all SPA route — serves index.html for all non-API paths.

        Enables client-side routing (React Router) to work correctly
        when users navigate directly to /analyze or refresh the browser.
        API routes (/api/*) are explicitly rejected here to prevent
        masking real 404 errors from the API layer.

        Args:
            full_path: Everything after the root slash in the URL.
            request:   The incoming HTTP request (used for context).

        Returns:
            FileResponse serving index.html, or a dict error if not built.
        """
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")

        index_html = _static_dir / "index.html"
        if index_html.exists():
            return FileResponse(
                str(index_html),
                media_type="text/html",
                headers={"Cache-Control": HTML_CACHE_CONTROL},
            )
        return {"message": "Frontend not built. Run: cd frontend && npm run build"}
