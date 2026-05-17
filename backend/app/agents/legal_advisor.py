"""
Agent 3: Legal Advisor
Generates plain-English explanations, real-world consequences,
scenario simulations, negotiation strategies, and final summary.
"""
import os
import json
import logging
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple

from app.agents.gemini_client import gemini_generate

logger = logging.getLogger(__name__)

ADVISOR_PROMPT = """You are a senior legal advisor helping someone understand their contract.

CLAUSE TITLE: {title}
SEVERITY: {severity}
CLAUSE TEXT: {clause_text}
RISK FACTORS: {risk_factors}

Provide in JSON format:
{{
  "plain_explanation": "Explain this clause in simple English (2-3 sentences, no legal jargon)",
  "real_world_consequence": "What practically happens to the person because of this clause? (2-3 sentences)",
  "negotiation_strategy": "Specific actionable advice on how to negotiate this clause (2-3 sentences)",
  "safer_wording": "Suggest safer alternative wording for this clause (1-2 sentences)",
  "scenario_simulation": "What happens if this clause is violated? Describe a realistic scenario (2-3 sentences)"
}}

Use clear, everyday language. Be specific about real consequences.
Respond ONLY with valid JSON:"""

SUMMARY_PROMPT = """You are a legal risk expert creating an executive summary for a contract analysis.

CONTRACT TYPE: {contract_type}
TOTAL CLAUSES: {total_clauses}
CRITICAL: {critical_count}
HIGH: {high_count}  
MEDIUM: {medium_count}
LOW: {low_count}

TOP RISK CLAUSES:
{top_clauses}

Provide:
{{
  "executive_summary": "3-4 sentence executive summary of the overall contract risk and key concerns",
  "top_risks": ["Risk 1 description", "Risk 2 description", "Risk 3 description", "Risk 4 description", "Risk 5 description"],
  "contract_type": "Detected contract type (e.g., Employment Agreement, SaaS Agreement, NDA)",
  "overall_score": 75,
  "trust_score": 35
}}

overall_score: 0-100 (higher = more risky)
trust_score: 0-100 (higher = more trustworthy contract)

Respond ONLY with valid JSON:"""

MOCK_ADVICE = {
    "non-compete": {
        "plain_explanation": "This clause prevents you from working for any competing company for 3 years after you leave, within 200 miles of any of their offices.",
        "real_world_consequence": "If you leave this job, you could be legally barred from working in your field for up to 3 years, effectively forcing a career change or relocation. Violating this could expose you to a costly lawsuit.",
        "negotiation_strategy": "Request reducing the duration to 6-12 months and limiting geographic scope to your immediate work area. Also push for a carve-out for roles that don't directly compete with your specific responsibilities.",
        "safer_wording": "Employee agrees not to work for direct competitors in the same specific role capacity for 6 months within a 50-mile radius of Employee's primary work location.",
        "scenario_simulation": "If you leave and join a competitor, the company could file for a court injunction stopping you from working there, then seek damages covering their estimated business losses — potentially tens of thousands of dollars.",
    },
    "arbitration": {
        "plain_explanation": "You agree to resolve any legal disputes through private arbitration instead of suing in court, and you give up your right to a jury trial.",
        "real_world_consequence": "If the company wrongs you, you cannot sue in court. Arbitration proceedings cost $1,750+ in filing fees alone and can take 12-18 months, often favoring repeat players like employers.",
        "negotiation_strategy": "Request mutual arbitration (applies to both parties), fee-sharing provisions, and the right to choose the arbitrator. Consider asking to carve out small claims and injunctive relief.",
        "safer_wording": "Disputes shall be resolved through mutually agreed arbitration, with costs shared equally, and each party retaining the right to seek emergency injunctive relief in court.",
        "scenario_simulation": "If the company fails to pay you earned commissions, you cannot file a lawsuit. You must file with JAMS, pay a $1,750 filing fee upfront, wait for an arbitrator assignment, and proceed through a private 12-month process with limited discovery rights.",
    },
    "intellectual-property-transfer": {
        "plain_explanation": "You're giving the company ownership of virtually everything you create — even side projects built in your free time — if they relate to the company's business in any way.",
        "real_world_consequence": "That mobile app you built on weekends, your photography business, or your freelance consulting work could become company property if they can argue it relates to their business.",
        "negotiation_strategy": "Request explicit carve-outs for: (1) work created on personal time using personal equipment, (2) pre-existing personal projects, and (3) work unrelated to your specific role.",
        "safer_wording": "Employee assigns IP rights only for work created using Company resources, during work hours, directly related to Employee's assigned responsibilities. Personal projects created on personal time and equipment are excluded.",
        "scenario_simulation": "You spend 18 months building a productivity app on weekends. After leaving the company, they claim ownership because your role involved productivity software. You face a lawsuit and must either give up the app or prove it had no relation to your work.",
    },
    "liability-limitation": {
        "plain_explanation": "The company's maximum financial responsibility to you is capped at one month's salary, no matter what they do wrong.",
        "real_world_consequence": "If the company causes significant harm — wrongful termination costing you 6 months of income, a data breach exposing your information, or breach of contract — you can only recover a fraction of your actual losses.",
        "negotiation_strategy": "Negotiate for a higher cap (at minimum 3-6 months salary), carve-outs for intentional misconduct, and mutual liability caps that apply equally to both parties.",
        "safer_wording": "Liability shall not be limited in cases of willful misconduct, gross negligence, or fraud. For other claims, liability is capped at 6 months of the Employee's base compensation.",
        "scenario_simulation": "The company wrongfully terminates you, costing you 6 months of income and benefits worth $75,000. Due to this clause, you can only recover $8,000 (one month salary), leaving you with a $67,000 unrecoverable loss.",
    },
    "automatic-renewal": {
        "plain_explanation": "Your contract automatically extends for another full year unless you give 90 days advance notice — meaning you must decide to leave 3 months before you actually want to.",
        "real_world_consequence": "If you forget to give notice 90 days before renewal, you're legally committed for another year. Missing this window, even by one day, could result in penalties or breach of contract claims.",
        "negotiation_strategy": "Request a shorter notice window (30 days is standard), automatic reminder notifications before the renewal date, and a grace period for late cancellation.",
        "safer_wording": "This agreement renews annually unless either party provides 30 days written notice. Either party may terminate within 15 days of renewal if proper notice was not given.",
        "scenario_simulation": "Your agreement renews on March 1st. You decide to leave in January but forget the 90-day rule. By November 30th, you needed to give notice. Now you're locked in for another year or risk a breach claim if you leave early.",
    },
    "confidentiality-nda": {
        "plain_explanation": "You must keep all company information secret for 5 years after leaving, and the company can take you to court immediately if you violate this.",
        "real_world_consequence": "Even 5 years after leaving, discussing your work experiences, sharing industry knowledge gained there, or using general skills in your next job could potentially be characterized as an NDA violation.",
        "negotiation_strategy": "Request a clear definition of what constitutes confidential information, a shorter duration (2-3 years is standard), and explicit carve-outs for publicly available information and general skills.",
        "safer_wording": "Employee agrees to keep Company's marked confidential information confidential for 2 years post-termination, excluding information that becomes publicly known through no fault of Employee.",
        "scenario_simulation": "Two years after leaving, you write a blog post about general industry trends based on your experience. The company claims it reveals confidential strategies and sues for injunctive relief and damages, forcing you to spend $30,000+ in legal fees.",
    },
    "unilateral-termination": {
        "plain_explanation": "The company can fire you with just 2 weeks notice for any reason. But if you want to quit, you must give 60 days notice — a 30x asymmetry.",
        "real_world_consequence": "You could be unemployed with 2 weeks notice, but if you take another job offer and leave sooner than 60 days, you could face a breach of contract lawsuit.",
        "negotiation_strategy": "Request mutual notice periods, or accept the 60-day employee notice in exchange for severance pay (e.g., 2 weeks per year of service) and a no-cause termination provision with enhanced notice.",
        "safer_wording": "Either party may terminate this agreement with 30 days written notice. If Company terminates without cause, Company shall provide severance equal to 1 month salary per year of service.",
        "scenario_simulation": "You receive a dream job offer starting in 4 weeks. You resign, but your contract requires 60 days notice. Your new employer won't wait. Your current employer sues for breach of contract, seeking damages equal to the cost of finding your replacement.",
    },
    "privacy-data-collection": {
        "plain_explanation": "By working here, you agree the company can monitor all your communications — including personal messages — sent through their systems or network.",
        "real_world_consequence": "Any email, chat, or web activity on company wifi or devices could be read by the company, including personal bank communications, medical inquiries, or private conversations.",
        "negotiation_strategy": "Request explicit limits on what can be monitored (work communications only), written notice of monitoring activities, prohibition on monitoring personal device communications, and secure handling of any personal data accessed.",
        "safer_wording": "Company may monitor business communications on Company-owned systems for legitimate business purposes. Personal devices and communications remain private. Employees will be notified of specific monitoring activities.",
        "scenario_simulation": "You check your personal email on company wifi. An HR email to your personal account discussing your medical condition is accessed during routine monitoring. This information later affects decisions about your promotion without your knowledge.",
    },
}

DEFAULT_ADVICE = {
    "plain_explanation": "This clause creates certain obligations or restrictions that you should carefully review before signing.",
    "real_world_consequence": "Depending on your specific situation, this clause could have significant practical implications for your rights and obligations.",
    "negotiation_strategy": "Consider discussing this clause with a legal professional to understand your options and negotiate more favorable terms.",
    "safer_wording": "Consider requesting clearer, more balanced language that specifies mutual obligations and limits.",
    "scenario_simulation": "If this clause is triggered or violated, it could lead to legal disputes that may be costly to resolve.",
}


async def advise_clauses(clauses: List[dict]) -> List[dict]:
    """
    Agent 3: Generate advice for each risky clause.
    Returns fully enriched clause list.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    advised = []

    for clause in clauses:
        clause_type = clause.get("type", "general")

        if not api_key:
            advice = MOCK_ADVICE.get(clause_type, DEFAULT_ADVICE)
        else:
            advice = await _get_advice_from_gemini(clause, api_key)

        advised.append({**clause, **advice})

    logger.info(f"Legal Advisor: generated advice for {len(advised)} clauses")
    return advised


async def _get_advice_from_gemini(clause: dict, api_key: str) -> dict:
    """Get advice for a single clause from Gemini."""
    try:
        prompt = ADVISOR_PROMPT.format(
            title=clause.get("title", ""),
            severity=clause.get("severity", "MEDIUM"),
            clause_text=clause.get("raw_text", "")[:1500],
            risk_factors=", ".join(clause.get("risk_factors", [])),
        )

        raw = gemini_generate(prompt, temperature=0.3, max_tokens=2048)
        if not raw:
            return MOCK_ADVICE.get(clause.get("type", "general"), DEFAULT_ADVICE)

        raw = raw.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]

        return json.loads(raw.strip())

    except Exception as e:
        logger.error(f"Advisor error for clause '{clause.get('title')}': {e}")
        return MOCK_ADVICE.get(clause.get("type", "general"), DEFAULT_ADVICE)


def generate_summary(clauses: List[dict], contract_text: str = "") -> dict:
    """Generate overall risk summary from all analyzed clauses."""
    if not clauses:
        return {
            "overall_score": 0,
            "overall_level": "LOW",
            "total_clauses": 0,
            "critical_count": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
            "contract_type": "Unknown",
            "top_risks": [],
            "executive_summary": "No clauses were extracted from this document.",
            "trust_score": 90,
        }

    counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for c in clauses:
        level = c.get("severity", "MEDIUM")
        counts[level] = counts.get(level, 0) + 1

    # Weighted risk score
    score = min(100, (
        counts["CRITICAL"] * 20 +
        counts["HIGH"] * 10 +
        counts["MEDIUM"] * 4 +
        counts["LOW"] * 1
    ))

    if score >= 70:
        overall_level = "CRITICAL"
    elif score >= 45:
        overall_level = "HIGH"
    elif score >= 20:
        overall_level = "MEDIUM"
    else:
        overall_level = "LOW"

    # Detect contract type from keywords
    text_lower = contract_text.lower()
    if "employment" in text_lower or "employee" in text_lower:
        contract_type = "Employment Agreement"
    elif "non-disclosure" in text_lower or "nda" in text_lower:
        contract_type = "Non-Disclosure Agreement"
    elif "saas" in text_lower or "software as a service" in text_lower:
        contract_type = "SaaS Agreement"
    elif "lease" in text_lower or "tenant" in text_lower or "rental" in text_lower:
        contract_type = "Rental/Lease Agreement"
    elif "vendor" in text_lower or "supplier" in text_lower:
        contract_type = "Vendor Agreement"
    elif "freelance" in text_lower or "contractor" in text_lower:
        contract_type = "Freelance/Contractor Agreement"
    elif "privacy" in text_lower or "data processing" in text_lower:
        contract_type = "Privacy Policy"
    elif "insurance" in text_lower:
        contract_type = "Insurance Agreement"
    else:
        contract_type = "General Contract"

    # Top risks from high/critical clauses
    risky_clauses = sorted(
        [c for c in clauses if c.get("severity") in ("CRITICAL", "HIGH")],
        key=lambda x: {"CRITICAL": 0, "HIGH": 1}.get(x.get("severity", "HIGH"), 2),
    )
    top_risks = []
    for c in risky_clauses[:5]:
        explanation = c.get("plain_explanation", "")
        if explanation:
            top_risks.append(f"{c['title']}: {explanation[:120]}...")

    if not top_risks:
        top_risks = ["Review all clauses carefully before signing"]

    trust_score = max(10, 100 - score)

    # Executive summary
    critical = counts["CRITICAL"]
    high = counts["HIGH"]
    exec_summary = (
        f"This {contract_type} contains {len(clauses)} clauses with a risk score of {score}/100. "
        f"{'CRITICAL CONCERN: ' if critical > 0 else ''}"
        f"There {'are' if critical != 1 else 'is'} {critical} critical "
        f"and {high} high-risk clause{'s' if high != 1 else ''} that require immediate attention before signing. "
        f"{'We strongly recommend negotiating or seeking legal counsel before proceeding.' if score > 60 else 'Some clauses should be reviewed and potentially renegotiated.'}"
    )

    return {
        "overall_score": score,
        "overall_level": overall_level,
        "total_clauses": len(clauses),
        "critical_count": counts["CRITICAL"],
        "high_count": counts["HIGH"],
        "medium_count": counts["MEDIUM"],
        "low_count": counts["LOW"],
        "contract_type": contract_type,
        "top_risks": top_risks,
        "executive_summary": exec_summary,
        "trust_score": trust_score,
    }
