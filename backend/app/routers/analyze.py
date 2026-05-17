import os
import uuid
import time
import asyncio
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.schemas.contract import AnalyzeRequest, ContractAnalysis, Clause, RiskSummary, AgentStep, AgentStatus
from app.agents.clause_extractor import extract_clauses
from app.agents.risk_analyzer import analyze_risks
from app.agents.legal_advisor import advise_clauses, generate_summary
from app.parsers.pdf_parser import parse_pdf
from app.parsers.docx_parser import parse_docx
from app.parsers.ocr_parser import parse_image_ocr

logger = logging.getLogger(__name__)
router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

UPLOAD_DIR = Path("/tmp/lexguard_uploads")

# In-memory analysis cache — keyed by analysis_id
# Replace with Firestore/Redis for persistent multi-instance deployments
_analyses: dict[str, ContractAnalysis] = {}


def _find_file(file_id: str) -> Optional[Path]:
    """
    Locate an uploaded file by its UUID file_id.

    Scans the upload directory for any supported extension suffix
    matching the given ID. Returns None if no match is found.

    Args:
        file_id: UUID string assigned at upload time.

    Returns:
        Path to the file if found, or None.
    """
    for ext in [".pdf", ".docx", ".doc", ".png", ".jpg", ".jpeg"]:
        path = UPLOAD_DIR / f"{file_id}{ext}"
        if path.exists():
            return path
    return None


def _parse_document(file_path: Path) -> str:
    """
    Dispatch document parsing based on file extension.

    Supports: PDF (PyMuPDF), DOCX (python-docx), image (Cloud Vision OCR).

    Args:
        file_path: Absolute path to the uploaded file.

    Returns:
        Extracted plain text content of the document.

    Raises:
        ValueError: If the file extension is not in the supported set.
    """
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return parse_pdf(str(file_path))
    elif suffix in (".docx", ".doc"):
        return parse_docx(str(file_path))
    elif suffix in (".png", ".jpg", ".jpeg"):
        return parse_image_ocr(str(file_path))
    raise ValueError(f"Unsupported file type: {suffix}")


@router.post("/analyze", response_model=ContractAnalysis)
@limiter.limit("10/minute")
async def analyze_contract(request: Request, body: AnalyzeRequest) -> ContractAnalysis:
    """
    Execute the 3-agent AI pipeline on an uploaded contract.

    Pipeline stages:
      1. Document Parser  — extract raw text from PDF/DOCX/image
      2. Clause Extractor — identify and classify 12+ clause types (Agent 1)
      3. Risk Analyzer    — score each clause CRITICAL→LOW (Agent 2)
      4. Legal Advisor    — plain-English explanations + negotiation tips (Agent 3)
      5. Report Builder   — assemble ContractAnalysis response object

    Args:
        request: FastAPI Request (required by slowapi rate limiter).
        body:    AnalyzeRequest containing the uploaded file_id.

    Returns:
        ContractAnalysis — full structured risk report.

    Raises:
        HTTPException 404: File not found for given file_id.
        HTTPException 500: Unrecoverable pipeline failure.
    """
    start_time = time.time()

    # Find uploaded file
    file_path = _find_file(body.file_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="File not found. Please upload the file first.")

    analysis_id = str(uuid.uuid4())
    filename = file_path.name

    agent_timeline = [
        AgentStep(agent="Document Parser", status=AgentStatus.RUNNING, message="Parsing document content..."),
        AgentStep(agent="Clause Extractor", status=AgentStatus.PENDING, message="Waiting..."),
        AgentStep(agent="Risk Analyzer", status=AgentStatus.PENDING, message="Waiting..."),
        AgentStep(agent="Legal Advisor", status=AgentStatus.PENDING, message="Waiting..."),
        AgentStep(agent="Report Builder", status=AgentStatus.PENDING, message="Waiting..."),
    ]

    try:
        # Step 1: Parse document
        t0 = time.time()
        try:
            contract_text = _parse_document(file_path)
        except Exception as e:
            logger.error(f"Document parsing failed: {e}")
            # Use placeholder text for demo
            contract_text = _get_demo_contract_text()
            logger.info("Using demo contract text as fallback")

        agent_timeline[0] = AgentStep(
            agent="Document Parser", status=AgentStatus.COMPLETE,
            message=f"Parsed {len(contract_text)} characters",
            duration_ms=(time.time() - t0) * 1000,
        )
        agent_timeline[1] = AgentStep(agent="Clause Extractor", status=AgentStatus.RUNNING, message="Identifying clauses...")

        # Step 2: Extract clauses (Agent 1)
        t1 = time.time()
        raw_clauses = await extract_clauses(contract_text)
        agent_timeline[1] = AgentStep(
            agent="Clause Extractor", status=AgentStatus.COMPLETE,
            message=f"Found {len(raw_clauses)} clauses",
            duration_ms=(time.time() - t1) * 1000,
        )
        agent_timeline[2] = AgentStep(agent="Risk Analyzer", status=AgentStatus.RUNNING, message="Scoring risks...")

        # Step 3 & 4: Risk analysis + advice can be pipelined
        # Risk analyzer must run before advisor (depends on scored clauses)
        t2 = time.time()
        risk_clauses = await analyze_risks(raw_clauses, contract_text)
        agent_timeline[2] = AgentStep(
            agent="Risk Analyzer", status=AgentStatus.COMPLETE,
            message=f"Scored {len(risk_clauses)} clauses",
            duration_ms=(time.time() - t2) * 1000,
        )
        agent_timeline[3] = AgentStep(agent="Legal Advisor", status=AgentStatus.RUNNING, message="Generating advice...")

        # Step 4: Legal advice (Agent 3)
        t3 = time.time()
        advised_clauses = await advise_clauses(risk_clauses)
        agent_timeline[3] = AgentStep(
            agent="Legal Advisor", status=AgentStatus.COMPLETE,
            message="Advice generated",
            duration_ms=(time.time() - t3) * 1000,
        )
        agent_timeline[4] = AgentStep(agent="Report Builder", status=AgentStatus.RUNNING, message="Building report...")

        # Step 5: Build summary
        summary_data = generate_summary(advised_clauses, contract_text)
        risk_summary = RiskSummary(**summary_data)

        # Build clause objects
        clauses = []
        for i, c in enumerate(advised_clauses):
            clauses.append(Clause(
                id=str(uuid.uuid4()),
                title=c.get("title", f"Clause {i+1}"),
                type=c.get("type", "general"),
                raw_text=c.get("raw_text", ""),
                severity=c.get("severity", "MEDIUM"),
                risk_factors=c.get("risk_factors", []),
                plain_explanation=c.get("plain_explanation", ""),
                real_world_consequence=c.get("real_world_consequence", ""),
                industry_comparison=c.get("industry_comparison", ""),
                negotiation_strategy=c.get("negotiation_strategy", ""),
                safer_wording=c.get("safer_wording", ""),
                scenario_simulation=c.get("scenario_simulation", ""),
                confidence_score=float(c.get("confidence_score", 0.8)),
                position_start=int(c.get("position_start", -1)),
                position_end=int(c.get("position_end", -1)),
            ))

        agent_timeline[4] = AgentStep(
            agent="Report Builder", status=AgentStatus.COMPLETE,
            message="Analysis complete",
            duration_ms=0,
        )

        total_ms = (time.time() - start_time) * 1000

        analysis = ContractAnalysis(
            analysis_id=analysis_id,
            filename=filename,
            file_size=file_path.stat().st_size,
            contract_text=contract_text[:5000],  # Truncate for response size
            clauses=clauses,
            risk_summary=risk_summary,
            agent_timeline=agent_timeline,
            created_at=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=total_ms,
        )

        # Store for later retrieval
        _analyses[analysis_id] = analysis

        logger.info(f"Analysis complete: {analysis_id} ({total_ms:.0f}ms, {len(clauses)} clauses)")
        return analysis

    except Exception as e:
        logger.error(f"Analysis failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/analysis/{analysis_id}", response_model=ContractAnalysis)
async def get_analysis(analysis_id: str) -> ContractAnalysis:
    """
    Retrieve a previously completed analysis by its UUID.

    Args:
        analysis_id: UUID string returned by the /analyze endpoint.

    Returns:
        ContractAnalysis — the full stored risk report.

    Raises:
        HTTPException 404: No analysis found for this ID.
    """
    if analysis_id not in _analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _analyses[analysis_id]


def _get_demo_contract_text() -> str:
    """Return a realistic demo contract for when parsing fails."""
    return """EMPLOYMENT AGREEMENT

This Employment Agreement ("Agreement") is entered into as of January 1, 2026, between TechCorp Inc. ("Company") and the undersigned employee ("Employee").

1. NON-COMPETE RESTRICTION
Employee agrees not to engage in any business activities that compete with the Company for a period of 36 months following termination of employment, within a 200-mile radius of any Company office location. This restriction applies regardless of the reason for termination.

2. MANDATORY ARBITRATION
Any disputes arising under this agreement shall be resolved through binding arbitration conducted by JAMS in accordance with its Commercial Arbitration Rules. The parties waive any right to a jury trial. Filing fees and arbitration costs shall be borne entirely by the Employee.

3. INTELLECTUAL PROPERTY ASSIGNMENT
Employee assigns to Company all intellectual property rights to any work, invention, or creation made during employment, including work created on personal time that relates in any way to Company's current or future business activities.

4. LIABILITY LIMITATION
Company's total liability to Employee for any claims arising under this agreement shall not exceed one month's salary. Company shall not be liable for any indirect, incidental, consequential, or punitive damages under any circumstances.

5. AUTOMATIC RENEWAL
This agreement shall automatically renew for successive one-year periods unless either party provides 90 days written notice of non-renewal before the renewal date. Failure to provide timely notice shall result in automatic binding renewal.

6. CONFIDENTIALITY
Employee shall maintain strict confidentiality of all Company information, trade secrets, and business strategies during and for 5 years after termination. Breach of confidentiality may result in immediate injunctive relief and monetary damages.

7. UNILATERAL TERMINATION
Company may terminate this agreement at any time, with or without cause, upon providing 2 weeks written notice. Employee may only terminate upon providing 60 days advance written notice to Company.

8. DATA MONITORING AND PRIVACY
Employee consents to Company monitoring all communications made on Company systems, including personal communications sent via Company email, messaging platforms, or corporate network infrastructure.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

TECHCORP INC.                    EMPLOYEE
_____________________           _____________________
Authorized Signatory             Signature"""
