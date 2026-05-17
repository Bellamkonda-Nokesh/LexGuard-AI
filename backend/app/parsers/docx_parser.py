"""DOCX document parser using python-docx."""
import logging

logger = logging.getLogger(__name__)


def parse_docx(file_path: str) -> str:
    """Extract text from DOCX file."""
    try:
        from docx import Document
        doc = Document(file_path)
        paragraphs = []
        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                paragraphs.append(text)
        full_text = "\n\n".join(paragraphs)
        logger.info(f"DOCX parsed: {len(full_text)} characters, {len(paragraphs)} paragraphs")
        return full_text
    except ImportError:
        logger.error("python-docx not installed")
        raise RuntimeError("DOCX parser not available")
    except Exception as e:
        logger.error(f"DOCX parsing error: {e}")
        raise RuntimeError(f"Failed to parse DOCX: {str(e)}")
