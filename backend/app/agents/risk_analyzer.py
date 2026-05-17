"""
Agent 2: Risk Analyzer
Scores each clause for legal risk, detects exploitative language,
and compares against industry benchmarks.
"""
import os
import json
import logging
from typing import List, Dict, Any

import google.generativeai as genai

logger = logging.getLogger(__name__)

RISK_PROMPT = """You are an expert legal risk analyst. Analyze the following contract clause and assess its risk level.

CONTRACT TYPE: {contract_type}
CLAUSE TITLE: {title}
CLAUSE TYPE: {clause_type}
CLAUSE TEXT: {clause_text}

Analyze for:
1. Legal imbalance (one-sided obligations)
2. Ambiguous language that could be exploited
3. Financial exposure
4. Rights forfeiture
5. Unusual deviations from industry norms
6. Privacy/data concerns
7. Employment restrictions severity

Return a JSON object:
{{
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "risk_factors": ["factor 1", "factor 2", "..."],
  "industry_comparison": "How this clause compares to industry standards...",
  "confidence_score": 0.85
}}

CRITICAL = highly exploitative, major rights violation, extreme financial risk
HIGH = significant imbalance, unusual restriction, notable financial risk
MEDIUM = some imbalance, could be negotiated, moderate concern
LOW = standard clause, reasonable terms, minor or no concern

Respond ONLY with valid JSON:"""


MOCK_RISK_SCORES = {
    "non-compete": {
        "severity": "CRITICAL",
        "risk_factors": [
            "36-month restriction is 3x the industry standard (6-12 months)",
            "200-mile radius is excessively broad",
            "Applies regardless of cause of termination",
            "No geographic or role limitation",
        ],
        "industry_comparison": "Industry standard non-compete clauses are typically 6-12 months and limited to the specific role's competitive activities. A 36-month blanket restriction in a 200-mile radius significantly exceeds normal practice and may be unenforceable in many jurisdictions.",
        "confidence_score": 0.95,
    },
    "arbitration": {
        "severity": "HIGH",
        "risk_factors": [
            "Mandatory binding arbitration waives right to jury trial",
            "JAMS arbitration is expensive (filing fees $1,750+)",
            "No class action rights",
            "Arbitrator selected by Company",
        ],
        "industry_comparison": "While arbitration clauses are common, mandatory JAMS arbitration with jury waiver is more restrictive than average. Many courts have begun scrutinizing these clauses, especially in employment contracts.",
        "confidence_score": 0.88,
    },
    "intellectual-property-transfer": {
        "severity": "CRITICAL",
        "risk_factors": [
            "Assigns ALL IP including personal-time work",
            "Includes inventions unrelated to current role",
            "No carve-out for pre-existing work",
            "Perpetual assignment with no reversion clause",
        ],
        "industry_comparison": "Standard IP assignment clauses cover work created using company resources during work hours. Extending ownership to personal-time projects is highly unusual and potentially overreaching. California and other states have specific laws limiting such assignments.",
        "confidence_score": 0.97,
    },
    "liability-limitation": {
        "severity": "HIGH",
        "risk_factors": [
            "Caps company liability at only 1 month salary",
            "Excludes all consequential damages",
            "Extremely one-sided — employee has no cap",
            "Prevents recovery for significant harms",
        ],
        "industry_comparison": "Liability caps are common in commercial contracts but limiting company liability to 1 month salary in an employment context is unusually restrictive. Standard practice allows for actual damages recovery.",
        "confidence_score": 0.91,
    },
    "automatic-renewal": {
        "severity": "MEDIUM",
        "risk_factors": [
            "90-day notice window is unusually long",
            "Easy to miss renewal dates",
            "Could result in unwanted year-long commitment",
        ],
        "industry_comparison": "Auto-renewal clauses are common but 90-day cancellation windows are above average (30-60 days is typical). The automatic renewal aspect is standard but the long notice period could trap parties unexpectedly.",
        "confidence_score": 0.82,
    },
    "confidentiality-nda": {
        "severity": "MEDIUM",
        "risk_factors": [
            "5-year post-termination obligation is above average",
            "Injunctive relief clause is aggressive",
            "Broad definition of confidential information",
        ],
        "industry_comparison": "NDA clauses are standard in most contracts. A 5-year duration is above average (2-3 years is typical) but not extreme. The right to injunctive relief is normal for NDA breaches.",
        "confidence_score": 0.78,
    },
    "unilateral-termination": {
        "severity": "HIGH",
        "risk_factors": [
            "Highly asymmetric notice requirements (2 weeks vs 60 days)",
            "Company can terminate without cause",
            "No severance obligation mentioned",
            "Employee notice period is 30x company's",
        ],
        "industry_comparison": "Termination clauses often favor employers, but requiring employees to give 60 days notice while the company only provides 2 weeks is extremely asymmetric. This is significantly outside normal practice.",
        "confidence_score": 0.93,
    },
    "privacy-data-collection": {
        "severity": "HIGH",
        "risk_factors": [
            "Monitoring extends to personal communications",
            "No privacy expectation established",
            "May violate state wiretapping laws",
            "Consent obtained through employment terms",
        ],
        "industry_comparison": "While employer monitoring of company systems is generally permitted, extending monitoring to personal communications on company networks raises significant privacy concerns. Several states require explicit notice and have stronger protections.",
        "confidence_score": 0.89,
    },
}

DEFAULT_RISK = {
    "severity": "MEDIUM",
    "risk_factors": ["Standard clause with some concerns", "Review with legal counsel"],
    "industry_comparison": "This clause appears to be within normal industry ranges but warrants careful review.",
    "confidence_score": 0.70,
}


async def analyze_risks(clauses: List[dict], contract_type: str = "General Contract") -> List[dict]:
    """
    Agent 2: Analyze risk for each clause.
    Returns enriched clause list with risk metadata.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    enriched = []

    for clause in clauses:
        clause_type = clause.get("type", "general")

        if not api_key:
            # Use mock risk data
            risk_data = MOCK_RISK_SCORES.get(clause_type, DEFAULT_RISK)
        else:
            risk_data = await _analyze_with_gemini(clause, contract_type, api_key)

        enriched.append({
            **clause,
            "severity": risk_data.get("severity", "MEDIUM"),
            "risk_factors": risk_data.get("risk_factors", []),
            "industry_comparison": risk_data.get("industry_comparison", ""),
            "confidence_score": risk_data.get("confidence_score", 0.75),
        })

    logger.info(f"Risk Analyzer: processed {len(enriched)} clauses")
    return enriched


async def _analyze_with_gemini(clause: dict, contract_type: str, api_key: str) -> dict:
    """Call Gemini for risk analysis of a single clause."""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            "gemini-1.5-pro",
            generation_config=genai.GenerationConfig(temperature=0.1, max_output_tokens=2048),
        )

        prompt = RISK_PROMPT.format(
            contract_type=contract_type,
            title=clause.get("title", ""),
            clause_type=clause.get("type", "general"),
            clause_text=clause.get("raw_text", "")[:2000],
        )

        response = model.generate_content(prompt)
        raw = response.text.strip()

        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        return json.loads(raw.strip())

    except Exception as e:
        logger.error(f"Risk analysis error for clause '{clause.get('title')}': {e}")
        return MOCK_RISK_SCORES.get(clause.get("type", "general"), DEFAULT_RISK)
