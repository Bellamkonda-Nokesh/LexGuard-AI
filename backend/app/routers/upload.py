import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.contract import UploadResponse

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

UPLOAD_DIR = Path("/tmp/lexguard_uploads")
ALLOWED_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/png",
    "image/jpeg",
    "image/jpg",
}
MAX_SIZE = 20 * 1024 * 1024  # 20MB


@router.post("/upload", response_model=UploadResponse)
@limiter.limit("20/minute")
async def upload_contract(request: Request, file: UploadFile = File(...)):
    """Upload a contract file for analysis."""

    # Validate content type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {content_type}. Supported: PDF, DOCX, PNG, JPG",
        )

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File exceeds 20MB limit")

    if len(content) < 100:
        raise HTTPException(status_code=400, detail="File appears to be empty or too small")

    # Save file
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    file_id = str(uuid.uuid4())
    extension = Path(file.filename or "contract.pdf").suffix or ".pdf"
    save_path = UPLOAD_DIR / f"{file_id}{extension}"

    with open(save_path, "wb") as f:
        f.write(content)

    logger.info(f"Uploaded: {file.filename} ({len(content)} bytes) → {save_path}")

    return UploadResponse(
        file_id=file_id,
        filename=file.filename or "contract",
        size=len(content),
        content_type=content_type,
    )
