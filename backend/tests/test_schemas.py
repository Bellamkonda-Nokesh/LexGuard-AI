"""
Pydantic schema validation tests for LexGuard AI.

Tests validate:
- ContractAnalysis model construction and field validation
- RiskSummary model constraints
- Clause model field validation and defaults
- Edge cases: empty clauses, zero scores, boundary values
"""
import pytest
from pydantic import ValidationError


class TestClauseSchema:
    """Tests for the Clause Pydantic model."""

    def test_clause_valid_construction(self):
        """Test that a valid Clause can be constructed."""
        from app.schemas.contract import Clause
        clause = Clause(
            id="clause-001",
            title="Non-Compete Restriction",
            type="non-compete",
            raw_text="Employee shall not compete for 36 months.",
            severity="CRITICAL",
            risk_factors=["Extended duration", "Wide geographic scope"],
            plain_explanation="You cannot work for competitors for 3 years.",
            real_world_consequence="You lose ability to work in your field.",
            industry_comparison="36 months exceeds standard 12-month terms.",
            negotiation_strategy="Request reduction to 12 months, 50-mile radius.",
            safer_wording="Employee shall not compete for 12 months within 50 miles.",
            scenario_simulation="If violated, company may seek injunctive relief.",
            confidence_score=0.95,
            position_start=100,
            position_end=250,
        )
        assert clause.severity == "CRITICAL"
        assert clause.confidence_score == 0.95
        assert len(clause.risk_factors) == 2

    def test_clause_confidence_score_bounds(self):
        """Test confidence score is a valid float."""
        from app.schemas.contract import Clause
        clause = Clause(
            id="test-id",
            title="Test Clause",
            type="general",
            raw_text="Some clause text.",
            severity="LOW",
            risk_factors=[],
            plain_explanation="Plain explanation.",
            real_world_consequence="Some consequence.",
            industry_comparison="Industry comparison.",
            negotiation_strategy="Strategy.",
            safer_wording="Safer wording.",
            scenario_simulation="Scenario.",
            confidence_score=1.0,
        )
        assert 0.0 <= clause.confidence_score <= 1.0

    def test_clause_severity_values(self):
        """Test all valid severity values are accepted."""
        from app.schemas.contract import Clause
        for severity in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]:
            clause = Clause(
                id=f"test-{severity}",
                title=f"{severity} Test",
                type="general",
                raw_text="Text.",
                severity=severity,
                risk_factors=[],
                plain_explanation="Explanation.",
                real_world_consequence="Consequence.",
                industry_comparison="Comparison.",
                negotiation_strategy="Strategy.",
                safer_wording="Wording.",
                scenario_simulation="Scenario.",
                confidence_score=0.8,
            )
            assert clause.severity == severity


class TestRiskSummarySchema:
    """Tests for the RiskSummary Pydantic model."""

    def test_risk_summary_valid_construction(self):
        """Test that a valid RiskSummary can be constructed."""
        from app.schemas.contract import RiskSummary
        rs = RiskSummary(
            overall_score=72,
            overall_level="HIGH",
            critical_count=2,
            high_count=4,
            medium_count=3,
            low_count=1,
            total_clauses=10,
            trust_score=28,
            top_risks=["Non-compete clause too broad", "Mandatory arbitration waives jury right"],
            contract_type="Employment Agreement",
            executive_summary="This contract has significant concerns.",
        )
        assert rs.overall_score == 72
        assert rs.total_clauses == 10
        assert len(rs.top_risks) == 2

    def test_risk_summary_score_range(self):
        """Test that overall score reflects risk level correctly."""
        from app.schemas.contract import RiskSummary
        rs = RiskSummary(
            overall_score=88,
            overall_level="CRITICAL",
            critical_count=3,
            high_count=2,
            medium_count=1,
            low_count=0,
            total_clauses=6,
            trust_score=12,
            top_risks=["Risk 1"],
            contract_type="NDA",
            executive_summary="Critical issues found.",
        )
        assert 0 <= rs.overall_score <= 100
        assert 0 <= rs.trust_score <= 100

    def test_risk_summary_empty_top_risks(self):
        """Test RiskSummary with empty top risks list."""
        from app.schemas.contract import RiskSummary
        rs = RiskSummary(
            overall_score=20,
            overall_level="LOW",
            critical_count=0,
            high_count=0,
            medium_count=1,
            low_count=5,
            total_clauses=6,
            trust_score=80,
            top_risks=[],
            contract_type="Service Agreement",
            executive_summary="This contract appears standard.",
        )
        assert rs.top_risks == []
        assert rs.overall_level == "LOW"


class TestContractAnalysisSchema:
    """Tests for the ContractAnalysis Pydantic model."""

    def test_contract_analysis_construction(self):
        """Test that a complete ContractAnalysis model can be constructed."""
        from app.schemas.contract import ContractAnalysis, Clause, RiskSummary, AgentStep, AgentStatus
        from datetime import datetime, timezone

        clause = Clause(
            id="c1", title="Test Clause", type="general",
            raw_text="Test text.", severity="LOW", risk_factors=[],
            plain_explanation="Explanation.", real_world_consequence="Consequence.",
            industry_comparison="Comparison.", negotiation_strategy="Strategy.",
            safer_wording="Safer.", scenario_simulation="Scenario.", confidence_score=0.9,
        )

        rs = RiskSummary(
            overall_score=30, overall_level="LOW", critical_count=0,
            high_count=0, medium_count=1, low_count=1, total_clauses=2,
            trust_score=70, top_risks=[], contract_type="General",
            executive_summary="Low risk contract.",
        )

        analysis = ContractAnalysis(
            analysis_id="analysis-001",
            filename="test.pdf",
            file_size=1024,
            contract_text="Sample contract text.",
            clauses=[clause],
            risk_summary=rs,
            agent_timeline=[],
            created_at=datetime.now(timezone.utc).isoformat(),
            processing_time_ms=5000.0,
        )
        assert analysis.analysis_id == "analysis-001"
        assert len(analysis.clauses) == 1
        assert analysis.risk_summary.overall_level == "LOW"
