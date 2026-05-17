from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    ERROR = "error"


class AgentStep(BaseModel):
    agent: str
    status: AgentStatus = AgentStatus.PENDING
    message: str = ""
    duration_ms: Optional[float] = None


class Clause(BaseModel):
    id: str
    title: str
    type: str
    raw_text: str
    severity: RiskLevel
    risk_factors: List[str] = Field(default_factory=list)
    plain_explanation: str = ""
    real_world_consequence: str = ""
    industry_comparison: str = ""
    negotiation_strategy: str = ""
    safer_wording: str = ""
    scenario_simulation: str = ""
    confidence_score: float = Field(default=0.8, ge=0.0, le=1.0)
    position_start: int = -1
    position_end: int = -1


class RiskSummary(BaseModel):
    overall_score: int = Field(ge=0, le=100)
    overall_level: RiskLevel
    total_clauses: int
    critical_count: int = 0
    high_count: int = 0
    medium_count: int = 0
    low_count: int = 0
    contract_type: str = "Unknown"
    top_risks: List[str] = Field(default_factory=list)
    executive_summary: str = ""
    trust_score: int = Field(default=75, ge=0, le=100)


class ContractAnalysis(BaseModel):
    analysis_id: str
    filename: str
    file_size: int
    contract_text: str = ""
    clauses: List[Clause] = Field(default_factory=list)
    risk_summary: RiskSummary
    agent_timeline: List[AgentStep] = Field(default_factory=list)
    created_at: str
    processing_time_ms: Optional[float] = None


class UploadResponse(BaseModel):
    file_id: str
    filename: str
    size: int
    content_type: str


class AnalyzeRequest(BaseModel):
    file_id: str
