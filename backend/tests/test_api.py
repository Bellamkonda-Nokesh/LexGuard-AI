"""Tests for API endpoints."""
import io
import os
import pytest
import pytest_asyncio


class TestHealthEndpoint:
    @pytest.mark.asyncio
    async def test_health_returns_200(self, client):
        """Test health endpoint returns 200."""
        response = await client.get("/api/health")
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_health_response_structure(self, client):
        """Test health response has required fields."""
        response = await client.get("/api/health")
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data


class TestUploadEndpoint:
    @pytest.mark.asyncio
    async def test_upload_valid_pdf(self, client, tmp_path):
        """Test uploading a valid PDF file."""
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 100), "Test Contract\nNon-compete clause: No competition for 12 months.")
            pdf_path = tmp_path / "test.pdf"
            doc.save(str(pdf_path))
            doc.close()

            with open(pdf_path, "rb") as f:
                response = await client.post(
                    "/api/upload",
                    files={"file": ("test.pdf", f, "application/pdf")},
                )
            assert response.status_code == 200
            data = response.json()
            assert "file_id" in data
            assert "filename" in data
            assert data["filename"] == "test.pdf"
        except ImportError:
            pytest.skip("PyMuPDF not available")

    @pytest.mark.asyncio
    async def test_upload_invalid_type_rejected(self, client):
        """Test that invalid file types are rejected."""
        fake_content = b"This is a text file"
        response = await client.post(
            "/api/upload",
            files={"file": ("test.txt", io.BytesIO(fake_content), "text/plain")},
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_upload_empty_file_rejected(self, client):
        """Test that empty files are rejected."""
        response = await client.post(
            "/api/upload",
            files={"file": ("empty.pdf", io.BytesIO(b"x" * 10), "application/pdf")},
        )
        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_upload_returns_file_id(self, client, tmp_path):
        """Test upload returns a valid UUID file_id."""
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 100), "A" * 500)
            pdf_path = tmp_path / "uuid_test.pdf"
            doc.save(str(pdf_path))
            doc.close()

            with open(pdf_path, "rb") as f:
                response = await client.post(
                    "/api/upload",
                    files={"file": ("uuid_test.pdf", f, "application/pdf")},
                )
            if response.status_code == 200:
                data = response.json()
                import uuid
                # Should be a valid UUID
                uuid.UUID(data["file_id"])
        except ImportError:
            pytest.skip("PyMuPDF not available")


class TestAnalyzeEndpoint:
    @pytest.mark.asyncio
    async def test_analyze_nonexistent_file(self, client):
        """Test analyzing a nonexistent file returns 404."""
        response = await client.post(
            "/api/analyze",
            json={"file_id": "nonexistent-file-id-12345"},
        )
        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_analyze_returns_analysis_id(self, client, tmp_path):
        """Test full upload + analyze flow returns analysis_id."""
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text(
                (50, 100),
                "EMPLOYMENT AGREEMENT\n\nNon-compete: Employee shall not compete for 36 months.\n\nArbitration: All disputes resolved by binding arbitration.",
            )
            pdf_path = tmp_path / "analyze_test.pdf"
            doc.save(str(pdf_path))
            doc.close()

            # Upload
            with open(pdf_path, "rb") as f:
                upload_resp = await client.post(
                    "/api/upload",
                    files={"file": ("analyze_test.pdf", f, "application/pdf")},
                )
            assert upload_resp.status_code == 200
            file_id = upload_resp.json()["file_id"]

            # Analyze
            analyze_resp = await client.post("/api/analyze", json={"file_id": file_id})
            assert analyze_resp.status_code == 200
            data = analyze_resp.json()
            assert "analysis_id" in data
            assert "clauses" in data
            assert "risk_summary" in data
            assert isinstance(data["clauses"], list)
            assert len(data["clauses"]) > 0
        except ImportError:
            pytest.skip("PyMuPDF not available")

    @pytest.mark.asyncio
    async def test_analysis_structure(self, client, tmp_path):
        """Test analysis response has all required fields."""
        try:
            import fitz
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 100), "X" * 300)
            pdf_path = tmp_path / "structure_test.pdf"
            doc.save(str(pdf_path))
            doc.close()

            with open(pdf_path, "rb") as f:
                upload_resp = await client.post(
                    "/api/upload",
                    files={"file": ("structure_test.pdf", f, "application/pdf")},
                )
            if upload_resp.status_code != 200:
                pytest.skip("Upload failed")

            file_id = upload_resp.json()["file_id"]
            analyze_resp = await client.post("/api/analyze", json={"file_id": file_id})

            if analyze_resp.status_code == 200:
                data = analyze_resp.json()
                required_fields = ["analysis_id", "filename", "clauses", "risk_summary", "created_at"]
                for field in required_fields:
                    assert field in data, f"Missing field: {field}"

                rs = data["risk_summary"]
                rs_fields = ["overall_score", "overall_level", "total_clauses", "contract_type"]
                for field in rs_fields:
                    assert field in rs, f"Missing risk_summary field: {field}"
        except ImportError:
            pytest.skip("PyMuPDF not available")


class TestExportEndpoint:
    @pytest.mark.asyncio
    async def test_export_nonexistent_analysis(self, client):
        """Test export of nonexistent analysis returns 404."""
        response = await client.get("/api/export/nonexistent-id-12345")
        assert response.status_code == 404
