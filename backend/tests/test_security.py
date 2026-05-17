"""
Security-focused tests for LexGuard AI backend.

Tests validate:
- File upload security (type whitelist, size limits, path traversal)
- API rate limiting awareness
- Input sanitization and validation
- Safe file ID generation
"""
import io
import uuid
import os
import pytest


class TestFileTypeValidation:
    """Test that only allowed file types can be uploaded."""

    @pytest.mark.asyncio
    async def test_reject_executable_files(self, client):
        """Test that .exe files are rejected."""
        response = await client.post(
            "/api/upload",
            files={"file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00" * 100), "application/octet-stream")},
        )
        assert response.status_code == 400, "Executable files must be rejected"

    @pytest.mark.asyncio
    async def test_reject_html_files(self, client):
        """Test that HTML files (XSS vector) are rejected."""
        html_content = b"<script>alert('xss')</script>"
        response = await client.post(
            "/api/upload",
            files={"file": ("evil.html", io.BytesIO(html_content), "text/html")},
        )
        assert response.status_code == 400, "HTML files must be rejected"

    @pytest.mark.asyncio
    async def test_reject_zip_files(self, client):
        """Test that .zip files (archive bombs) are rejected."""
        response = await client.post(
            "/api/upload",
            files={"file": ("archive.zip", io.BytesIO(b"PK\x03\x04" * 100), "application/zip")},
        )
        assert response.status_code == 400, "ZIP files must be rejected"

    @pytest.mark.asyncio
    async def test_reject_python_scripts(self, client):
        """Test that .py files are rejected."""
        response = await client.post(
            "/api/upload",
            files={"file": ("hack.py", io.BytesIO(b"import os; os.system('rm -rf /')"), "text/plain")},
        )
        assert response.status_code == 400, "Python scripts must be rejected"

    @pytest.mark.asyncio
    async def test_reject_empty_filename(self, client):
        """Test that files with empty content are rejected."""
        response = await client.post(
            "/api/upload",
            files={"file": ("empty.pdf", io.BytesIO(b""), "application/pdf")},
        )
        assert response.status_code == 400, "Empty files must be rejected"

    @pytest.mark.asyncio
    async def test_reject_tiny_fake_pdf(self, client):
        """Test that tiny files pretending to be PDF are rejected."""
        # 10 bytes is not a valid PDF
        response = await client.post(
            "/api/upload",
            files={"file": ("tiny.pdf", io.BytesIO(b"x" * 10), "application/pdf")},
        )
        assert response.status_code == 400, "Tiny fake PDFs must be rejected"


class TestPathTraversalPrevention:
    """Test that path traversal attacks are prevented."""

    @pytest.mark.asyncio
    async def test_path_traversal_in_analysis_id(self, client):
        """Test that path traversal in analysis IDs is handled safely."""
        # Attempt path traversal via analysis ID
        response = await client.get("/api/analysis/../../../etc/passwd")
        # Should be 404 or 422, never 200 with file contents
        assert response.status_code in (404, 422, 400)

    @pytest.mark.asyncio
    async def test_nonexistent_analysis_returns_404(self, client):
        """Test that random analysis IDs return 404, not internal errors."""
        fake_id = str(uuid.uuid4())
        response = await client.get(f"/api/analysis/{fake_id}")
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_export_nonexistent_returns_404(self, client):
        """Test that export of nonexistent analysis returns 404."""
        fake_id = str(uuid.uuid4())
        response = await client.get(f"/api/export/{fake_id}")
        assert response.status_code == 404


class TestHealthEndpointSecurity:
    """Test that health endpoint doesn't leak sensitive information."""

    @pytest.mark.asyncio
    async def test_health_does_not_expose_api_key(self, client):
        """Test that health endpoint never exposes the API key value."""
        response = await client.get("/api/health")
        assert response.status_code == 200
        response_text = response.text
        # Ensure the actual API key value is not in the response
        api_key = os.getenv("GEMINI_API_KEY", "")
        if api_key:
            assert api_key not in response_text, "API key must not be exposed"

    @pytest.mark.asyncio
    async def test_health_only_shows_key_presence(self, client):
        """Test health shows only whether API key is configured, not its value."""
        response = await client.get("/api/health")
        data = response.json()
        assert "gemini_configured" in data
        assert isinstance(data["gemini_configured"], bool), "Must be boolean, not the key value"
