"""PDF document parser using PyMuPDF."""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def parse_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(file_path)
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text)
        doc.close()
        full_text = "\n\n".join(text_parts)
        logger.info(f"PDF parsed: {len(full_text)} characters from {len(doc)} pages")
        return full_text
    except ImportError:
        logger.error("PyMuPDF not installed")
        raise RuntimeError("PDF parser not available")
    except Exception as e:
        logger.error(f"PDF parsing error: {e}")
        raise RuntimeError(f"Failed to parse PDF: {str(e)}")
