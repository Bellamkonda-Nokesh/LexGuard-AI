"""
PDF document parser using PyMuPDF (fitz).

Extracts plain text from PDF files page by page.
Handles encrypted, corrupt, and empty PDFs gracefully.
"""
import logging
from pathlib import Path

logger = logging.getLogger(__name__)


def parse_pdf(file_path: str) -> str:
    """
    Extract all text content from a PDF file.

    Opens the PDF, iterates through every page, collects non-empty text blocks,
    then closes the document before logging or returning.

    Args:
        file_path: Absolute path to the PDF file.

    Returns:
        Full extracted text joined by double newlines between pages.

    Raises:
        RuntimeError: If PyMuPDF is not installed or the file cannot be parsed.
    """
    try:
        import fitz  # PyMuPDF

        doc = fitz.open(file_path)
        text_parts: list[str] = []
        page_count = len(doc)  # record page count BEFORE closing

        for page_num in range(page_count):
            page = doc[page_num]
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text)

        doc.close()  # close BEFORE using page_count in logs

        full_text = "\n\n".join(text_parts)
        logger.info(
            f"PDF parsed: {len(full_text):,} characters from {page_count} page(s)"
        )
        return full_text

    except ImportError:
        logger.error("PyMuPDF is not installed. Run: pip install PyMuPDF")
        raise RuntimeError("PDF parser not available — PyMuPDF not installed")
    except Exception as e:
        logger.error(f"PDF parsing error for '{file_path}': {e}")
        raise RuntimeError(f"Failed to parse PDF: {e}") from e
