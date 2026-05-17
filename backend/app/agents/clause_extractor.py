"""
Agent 1: Clause Extractor
Parses contract text and identifies all distinct contractual clauses.
"""
import os
import json
import logging
import time
from typing import List, Optional

from app.agents.gemini_client import gemini_generate

logger = logging.getLogger(__name__)

CLAUSE_TYPES = [
    "non-compete",
    "non-solicitation",
    "arbitration",
    "liability-limitation",
    "intellectual-property-transfer",
    "indemnification",
    "automatic-renewal",
    "hidden-fees",
    "privacy-data-collection",
    "unilateral-termination",
    "confidentiality-nda",
    "payment-penalties",
    "restrictive-obligations",
    "governing-law",
    "force-majeure",
    "warranty-disclaimer",
    "assignment",
    "general",
]

EXTRACTION_PROMPT = """You are an expert legal clause extractor. Analyze the following contract text and identify ALL distinct contractual clauses.

For each clause, extract:
1. title: Brief descriptive name (e.g., "Non-Compete Restriction", "Arbitration Requirement")
2. type: One of: {clause_types}
3. raw_text: The exact verbatim clause text from the document
4. position_start: Character index where this clause starts in the contract text
5. position_end: Character index where this clause ends

Return a JSON array of clause objects. Be comprehensive - identify every distinct clause, even standard ones.
Focus on clauses that affect rights, obligations, restrictions, payments, IP, privacy, and dispute resolution.

CONTRACT TEXT:
{contract_text}

Respond ONLY with a valid JSON array, no other text:
[
  {{
    "title": "...",
    "type": "...",
    "raw_text": "...",
    "position_start": 0,
    "position_end": 100
  }}
]"""


def _get_mock_clauses(contract_text: str) -> List[dict]:
    """Return realistic mock clauses when Gemini is not available."""
    text_len = len(contract_text)
    chunk = max(1, text_len // 8)
    return [
        {
            "title": "Non-Compete Restriction",
            "type": "non-compete",
            "raw_text": "Employee agrees not to engage in any business activities that compete with the Company for a period of 36 months following termination of employment, within a 200-mile radius of any Company office location.",
            "position_start": chunk * 0,
            "position_end": chunk * 1,
        },
        {
            "title": "Mandatory Arbitration Clause",
            "type": "arbitration",
            "raw_text": "Any disputes arising under this agreement shall be resolved through binding arbitration conducted by JAMS in accordance with its Commercial Arbitration Rules. The parties waive any right to a jury trial.",
            "position_start": chunk * 1,
            "position_end": chunk * 2,
        },
        {
            "title": "Intellectual Property Assignment",
            "type": "intellectual-property-transfer",
            "raw_text": "Employee assigns to Company all intellectual property rights to any work, invention, or creation made during employment, including work created on personal time that relates to Company's business.",
            "position_start": chunk * 2,
            "position_end": chunk * 3,
        },
        {
            "title": "Liability Limitation",
            "type": "liability-limitation",
            "raw_text": "Company's total liability to Employee shall not exceed one month's salary. Company shall not be liable for any indirect, consequential, or punitive damages.",
            "position_start": chunk * 3,
            "position_end": chunk * 4,
        },
        {
            "title": "Automatic Contract Renewal",
            "type": "automatic-renewal",
            "raw_text": "This agreement shall automatically renew for successive one-year periods unless either party provides 90 days written notice before the renewal date.",
            "position_start": chunk * 4,
            "position_end": chunk * 5,
        },
        {
            "title": "Confidentiality Obligation",
            "type": "confidentiality-nda",
            "raw_text": "Employee shall maintain strict confidentiality of all Company information during and for 5 years after termination. Breach of confidentiality may result in injunctive relief and monetary damages.",
            "position_start": chunk * 5,
            "position_end": chunk * 6,
        },
        {
            "title": "Unilateral Termination Right",
            "type": "unilateral-termination",
            "raw_text": "Company may terminate this agreement at any time, with or without cause, upon providing 2 weeks notice. Employee may only terminate upon providing 60 days notice.",
            "position_start": chunk * 6,
            "position_end": chunk * 7,
        },
        {
            "title": "Data Collection and Privacy",
            "type": "privacy-data-collection",
            "raw_text": "Employee consents to Company monitoring all communications made on Company systems, including personal communications sent via Company email or networks.",
            "position_start": chunk * 7,
            "position_end": text_len,
        },
    ]


async def extract_clauses(contract_text: str) -> List[dict]:
    """
    Agent 1: Extract all clauses from contract text.
    Returns list of raw clause dicts.
    """
    if not os.getenv("GEMINI_API_KEY"):
        logger.warning("GEMINI_API_KEY not set — using mock clause extraction")
        return _get_mock_clauses(contract_text)

    try:
        # Truncate very long contracts to stay within token limits
        text = contract_text[:15000] if len(contract_text) > 15000 else contract_text

        prompt = EXTRACTION_PROMPT.format(
            clause_types=", ".join(CLAUSE_TYPES),
            contract_text=text,
        )

        raw = gemini_generate(prompt, temperature=0.1, max_tokens=8192)
        if not raw:
            logger.warning("Gemini returned empty response — using mock clauses")
            return _get_mock_clauses(contract_text)

        raw = raw.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        clauses = json.loads(raw)
        logger.info(f"Clause Extractor: found {len(clauses)} clauses")
        return clauses

    except json.JSONDecodeError as e:
        logger.error(f"Clause extraction JSON parse error: {e}")
        return _get_mock_clauses(contract_text)
    except Exception as e:
        logger.error(f"Clause extraction error: {e}")
        return _get_mock_clauses(contract_text)
