"""
Upload router for LexGuard AI.

Handles contract file uploads with strict validation:
- MIME type whitelist (PDF, DOCX, images only)
- File size limit (20 MB maximum)
- Minimum content length (rejects empty/corrupt files)
- UUID-based file naming (prevents path traversal)
- Extension validation against ALLOWED_EXTENSIONS whitelist
"""
import os
import uuid
import logging
import re
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.contract import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

UPLOAD_DIR = Path("/tmp/lexguard_uploads")

# Strict whitelist of allowed MIME types
ALLOWED_TYPES: set[str] = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg",
}

# Allowed file extensions (double validation alongside MIME type)
ALLOWED_EXTENSIONS: set[str] = {".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"}

MAX_SIZE: int = 20 * 1024 * 1024   # 20 MB
MIN_SIZE: int = 100                  # 100 bytes minimum


def _sanitize_filename(filename: str) -> str:
    """
    Sanitize an uploaded filename to prevent path traversal and injection.

    Strips directory components and replaces unsafe characters with underscores.

    Args:
        filename: The original filename from the upload.

    Returns:
        A sanitized filename safe for logging (NOT used for actual storage).
    """
    # Strip path separators
    name = Path(filename).name
    # Replace unsafe characters
    name = re.sub(r"[^a-zA-Z0-9._\-]", "_", name)
    return name[:128]  # Limit length


@router.post("/upload", response_model=UploadResponse)
@limiter.limit("20/minute")
async def upload_contract(request: Request, file: UploadFile = File(...)) -> UploadResponse:
    """
    Upload a contract file for AI analysis.

    Validates file type, size, and content before storing it with a UUID-based
    filename to prevent path traversal and filename injection attacks.

    Args:
        request: FastAPI request (used by rate limiter).
        file: The uploaded file (multipart/form-data).

    Returns:
        UploadResponse containing file_id, filename, size, and content_type.

    Raises:
        HTTPException 400: If file type, size, or content validation fails.
    """
    # --- MIME type validation ---
    content_type = (file.content_type or "").split(";")[0].strip()
    if content_type not in ALLOWED_TYPES:
        logger.warning(f"Rejected upload: unsupported type '{content_type}'")
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: '{content_type}'. Allowed: PDF, DOCX, PNG, JPG",
        )

    # --- Extension validation (defense in depth) ---
    original_name = file.filename or "contract.pdf"
    extension = Path(original_name).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        logger.warning(f"Rejected upload: disallowed extension '{extension}'")
        raise HTTPException(
            status_code=400,
            detail=f"File extension '{extension}' not allowed.",
        )

    # --- Read and validate size ---
    content = await file.read()
    file_size = len(content)

    if file_size > MAX_SIZE:
        raise HTTPException(status_code=400, detail=f"File exceeds 20 MB limit ({file_size} bytes)")

    if file_size < MIN_SIZE:
        raise HTTPException(status_code=400, detail="File appears to be empty or corrupt (too small)")

    # --- Store with UUID filename (prevents path traversal) ---
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())
    save_path = UPLOAD_DIR / f"{file_id}{extension}"

    try:
        with open(save_path, "wb") as f:
            f.write(content)
    except OSError as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="File storage error. Please try again.")

    safe_display_name = _sanitize_filename(original_name)
    logger.info(f"Uploaded: '{safe_display_name}' ({file_size:,} bytes) → {save_path.name}")

    return UploadResponse(
        file_id=file_id,
        filename=original_name,
        size=file_size,
        content_type=content_type,
    )
