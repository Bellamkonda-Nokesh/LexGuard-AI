"""OCR parser using Google Cloud Vision API."""
import os
import logging

logger = logging.getLogger(__name__)


def parse_image_ocr(file_path: str) -> str:
    """Extract text from image using Google Cloud Vision OCR."""
    try:
        from google.cloud import vision
        client = vision.ImageAnnotatorClient()
        with open(file_path, "rb") as image_file:
            content = image_file.read()
        image = vision.Image(content=content)
        response = client.text_detection(image=image)
        if response.error.message:
            raise RuntimeError(f"Vision API error: {response.error.message}")
        texts = response.text_annotations
        if texts:
            full_text = texts[0].description
            logger.info(f"OCR parsed: {len(full_text)} characters")
            return full_text
        return ""
    except ImportError:
        logger.warning("google-cloud-vision not available, attempting basic OCR fallback")
        return _tesseract_fallback(file_path)
    except Exception as e:
        logger.error(f"OCR error: {e}")
        return _tesseract_fallback(file_path)


def _tesseract_fallback(file_path: str) -> str:
    """Fallback OCR using pytesseract if available."""
    try:
        import pytesseract
        from PIL import Image
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        logger.info(f"Tesseract OCR: {len(text)} characters")
        return text
    except Exception as e:
        logger.error(f"Tesseract fallback failed: {e}")
        raise RuntimeError("No OCR engine available. Install google-cloud-vision or pytesseract.")
