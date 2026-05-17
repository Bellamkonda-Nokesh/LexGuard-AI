"""Pytest configuration and shared fixtures."""
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def sample_contract_text():
    return """EMPLOYMENT AGREEMENT

1. NON-COMPETE RESTRICTION
Employee agrees not to engage in any competing business activities for 36 months following termination within a 200-mile radius.

2. MANDATORY ARBITRATION  
Any disputes shall be resolved through binding JAMS arbitration. Parties waive jury trial rights.

3. INTELLECTUAL PROPERTY ASSIGNMENT
Employee assigns all IP rights including work created on personal time related to Company business.

4. LIABILITY LIMITATION
Company liability is capped at one month salary. No consequential damages.

5. AUTOMATIC RENEWAL
Agreement renews automatically unless 90 days written notice provided.
"""


@pytest.fixture
def sample_clause():
    return {
        "title": "Non-Compete Restriction",
        "type": "non-compete",
        "raw_text": "Employee agrees not to engage in competing activities for 36 months within 200 miles.",
        "position_start": 0,
        "position_end": 85,
    }


@pytest.fixture
def sample_risk_clause(sample_clause):
    return {
        **sample_clause,
        "severity": "CRITICAL",
        "risk_factors": ["Excessive duration", "Broad geographic scope"],
        "industry_comparison": "Well above industry standard",
        "confidence_score": 0.95,
    }


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://testserver"
    ) as client:
        yield client
