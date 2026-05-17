"""
Shared Gemini AI client helper for LexGuard AI agents.

Uses the current `google.genai` SDK (successor to the deprecated
`google.generativeai` package). Provides a single `gemini_generate`
function used by all three AI agents to keep the calling pattern
consistent and easy to swap in the future.
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# Default model — gemini-2.0-flash is fast and widely available on current API
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def gemini_generate(prompt: str, temperature: float = 0.1, max_tokens: int = 8192) -> Optional[str]:
    """
    Call Google Gemini and return the text response.

    Uses the `google.genai` SDK (Client-based API, not the deprecated
    `google.generativeai` module). Falls back gracefully and returns
    None if the API key is missing or the call fails.

    Args:
        prompt:      The full prompt string to send to Gemini.
        temperature: Sampling temperature (0.0 = deterministic, 1.0 = creative).
        max_tokens:  Maximum number of tokens in the response.

    Returns:
        The model's text response, or None if the call fails.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        logger.warning("GEMINI_API_KEY not set — skipping Gemini call")
        return None

    try:
        from google import genai
        from google.genai import types as genai_types

        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt,
            config=genai_types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
            ),
        )
        return response.text

    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        return None
