"""Tests for AI agents (using mock data since no API key in tests)."""
import pytest
import asyncio
import os


class TestClauseExtractor:
    def test_extract_returns_list(self, sample_contract_text):
        """Test that extraction returns a list."""
        from app.agents.clause_extractor import _get_mock_clauses
        result = _get_mock_clauses(sample_contract_text)
        assert isinstance(result, list)
        assert len(result) > 0

    def test_each_clause_has_required_fields(self, sample_contract_text):
        """Test that each clause has required fields."""
        from app.agents.clause_extractor import _get_mock_clauses
        clauses = _get_mock_clauses(sample_contract_text)
        for clause in clauses:
            assert "title" in clause
            assert "type" in clause
            assert "raw_text" in clause
            assert "position_start" in clause
            assert "position_end" in clause

    def test_clause_positions_are_valid(self, sample_contract_text):
        """Test that clause positions are non-negative integers."""
        from app.agents.clause_extractor import _get_mock_clauses
        clauses = _get_mock_clauses(sample_contract_text)
        for clause in clauses:
            assert isinstance(clause["position_start"], (int, float))
            assert isinstance(clause["position_end"], (int, float))
            assert clause["position_start"] >= 0

    @pytest.mark.asyncio
    async def test_extract_clauses_without_api_key(self, sample_contract_text):
        """Test extraction falls back to mock when no API key."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.clause_extractor import extract_clauses
        result = await extract_clauses(sample_contract_text)
        assert isinstance(result, list)
        assert len(result) > 0

    def test_empty_contract_returns_clauses(self):
        """Test behavior with minimal contract text."""
        from app.agents.clause_extractor import _get_mock_clauses
        result = _get_mock_clauses("This is a contract.")
        assert isinstance(result, list)


class TestRiskAnalyzer:
    @pytest.mark.asyncio
    async def test_analyze_returns_enriched_clauses(self, sample_clause):
        """Test risk analyzer enriches clauses with risk data."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.risk_analyzer import analyze_risks
        result = await analyze_risks([sample_clause])
        assert len(result) == 1
        assert "severity" in result[0]
        assert "risk_factors" in result[0]
        assert "industry_comparison" in result[0]
        assert "confidence_score" in result[0]

    @pytest.mark.asyncio
    async def test_severity_is_valid_enum(self, sample_clause):
        """Test that severity is one of the valid enum values."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.risk_analyzer import analyze_risks
        result = await analyze_risks([sample_clause])
        valid_levels = {"LOW", "MEDIUM", "HIGH", "CRITICAL"}
        for clause in result:
            assert clause["severity"] in valid_levels

    @pytest.mark.asyncio
    async def test_non_compete_is_critical(self):
        """Test that non-compete clause gets CRITICAL rating."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.risk_analyzer import analyze_risks
        clause = {
            "title": "Non-Compete",
            "type": "non-compete",
            "raw_text": "Employee shall not compete for 36 months.",
        }
        result = await analyze_risks([clause])
        assert result[0]["severity"] == "CRITICAL"

    @pytest.mark.asyncio
    async def test_confidence_score_in_range(self, sample_clause):
        """Test confidence score is between 0 and 1."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.risk_analyzer import analyze_risks
        result = await analyze_risks([sample_clause])
        for clause in result:
            assert 0.0 <= clause["confidence_score"] <= 1.0

    @pytest.mark.asyncio
    async def test_multiple_clauses_all_scored(self):
        """Test all clauses in a batch get scored."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.risk_analyzer import analyze_risks
        clauses = [
            {"title": "NDA", "type": "confidentiality-nda", "raw_text": "Keep secrets."},
            {"title": "IP", "type": "intellectual-property-transfer", "raw_text": "All IP assigned."},
            {"title": "Renewal", "type": "automatic-renewal", "raw_text": "Auto renews annually."},
        ]
        result = await analyze_risks(clauses)
        assert len(result) == 3
        for r in result:
            assert "severity" in r


class TestLegalAdvisor:
    @pytest.mark.asyncio
    async def test_advisor_adds_explanation(self, sample_risk_clause):
        """Test advisor adds plain English explanation."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.legal_advisor import advise_clauses
        result = await advise_clauses([sample_risk_clause])
        assert len(result) == 1
        assert "plain_explanation" in result[0]
        assert len(result[0]["plain_explanation"]) > 0

    @pytest.mark.asyncio
    async def test_advisor_adds_all_required_fields(self, sample_risk_clause):
        """Test advisor adds all required advisory fields."""
        os.environ.pop("GEMINI_API_KEY", None)
        from app.agents.legal_advisor import advise_clauses
        result = await advise_clauses([sample_risk_clause])
        required = ["plain_explanation", "real_world_consequence", "negotiation_strategy", 
                    "safer_wording", "scenario_simulation"]
        for field in required:
            assert field in result[0], f"Missing field: {field}"

    def test_generate_summary_with_clauses(self):
        """Test summary generation with mixed clauses."""
        from app.agents.legal_advisor import generate_summary
        clauses = [
            {"severity": "CRITICAL", "title": "Non-Compete", "plain_explanation": "Bad clause."},
            {"severity": "HIGH", "title": "Arbitration", "plain_explanation": "Risky."},
            {"severity": "MEDIUM", "title": "NDA", "plain_explanation": "Some concern."},
            {"severity": "LOW", "title": "Governing Law", "plain_explanation": "Standard."},
        ]
        summary = generate_summary(clauses, "This employment agreement...")
        assert summary["total_clauses"] == 4
        assert summary["critical_count"] == 1
        assert summary["high_count"] == 1
        assert summary["overall_score"] >= 0
        assert 0 <= summary["trust_score"] <= 100

    def test_generate_summary_empty_clauses(self):
        """Test summary with no clauses."""
        from app.agents.legal_advisor import generate_summary
        summary = generate_summary([], "")
        assert summary["total_clauses"] == 0
        assert summary["overall_score"] == 0

    def test_contract_type_detection(self):
        """Test contract type is correctly detected from text."""
        from app.agents.legal_advisor import generate_summary
        clauses = [{"severity": "LOW", "title": "Test", "plain_explanation": "test"}]
        
        emp_summary = generate_summary(clauses, "This employment agreement between employer and employee")
        assert "Employment" in emp_summary["contract_type"]

        nda_summary = generate_summary(clauses, "This non-disclosure agreement NDA is strictly confidential")
        assert "Non-Disclosure" in nda_summary["contract_type"]
