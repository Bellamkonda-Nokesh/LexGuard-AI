import logging
from io import BytesIO
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.routers.analyze import _analyses

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/export/{analysis_id}")
async def export_analysis(analysis_id: str):
    """Generate and return a PDF report for an analysis."""
    if analysis_id not in _analyses:
        raise HTTPException(status_code=404, detail="Analysis not found")

    analysis = _analyses[analysis_id]

    try:
        pdf_bytes = _generate_pdf_report(analysis)
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="LexGuard_Report_{analysis.filename}.pdf"'
            },
        )
    except Exception as e:
        logger.error(f"PDF export error: {e}")
        raise HTTPException(status_code=500, detail=f"Export failed: {str(e)}")


def _generate_pdf_report(analysis) -> bytes:
    """Generate a professional PDF report using ReportLab."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.colors import HexColor, white, black
        from reportlab.lib.units import cm, mm
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        )
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
        from io import BytesIO

        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm, leftMargin=2*cm,
            topMargin=2*cm, bottomMargin=2*cm,
        )

        styles = getSampleStyleSheet()
        story = []

        # Colors
        DARK = HexColor('#0d0d16')
        BRAND = HexColor('#6366f1')
        CRITICAL_C = HexColor('#ef4444')
        HIGH_C = HexColor('#f97316')
        MEDIUM_C = HexColor('#f59e0b')
        LOW_C = HexColor('#10b981')
        GRAY = HexColor('#9ca3af')
        LIGHT_GRAY = HexColor('#f3f4f6')

        risk_colors = {'CRITICAL': CRITICAL_C, 'HIGH': HIGH_C, 'MEDIUM': MEDIUM_C, 'LOW': LOW_C}

        # Styles
        title_style = ParagraphStyle('Title', parent=styles['Title'],
            fontSize=28, textColor=BRAND, spaceAfter=6, alignment=TA_CENTER, fontName='Helvetica-Bold')
        subtitle_style = ParagraphStyle('Subtitle', parent=styles['Normal'],
            fontSize=12, textColor=GRAY, spaceAfter=4, alignment=TA_CENTER)
        h1_style = ParagraphStyle('H1', parent=styles['Heading1'],
            fontSize=16, textColor=BRAND, spaceAfter=8, fontName='Helvetica-Bold')
        h2_style = ParagraphStyle('H2', parent=styles['Heading2'],
            fontSize=12, textColor=DARK, spaceAfter=6, fontName='Helvetica-Bold')
        body_style = ParagraphStyle('Body', parent=styles['Normal'],
            fontSize=10, textColor=HexColor('#374151'), spaceAfter=4, leading=14)
        small_style = ParagraphStyle('Small', parent=styles['Normal'],
            fontSize=8, textColor=GRAY, spaceAfter=3)
        quote_style = ParagraphStyle('Quote', parent=styles['Normal'],
            fontSize=9, textColor=HexColor('#4b5563'), leftIndent=20,
            borderPadding=8, spaceAfter=6, fontName='Courier', leading=12)

        # ─── Header ───
        story.append(Paragraph("LexGuard AI", title_style))
        story.append(Paragraph("Contract Intelligence & Legal Risk Analysis Report", subtitle_style))
        story.append(Paragraph(f"File: {analysis.filename}", small_style))
        story.append(Paragraph(f"Generated: {analysis.created_at[:10]}", small_style))
        story.append(HRFlowable(width="100%", thickness=1, color=BRAND, spaceAfter=12))
        story.append(Spacer(1, 0.3*cm))

        # ─── Executive Summary ───
        story.append(Paragraph("Executive Summary", h1_style))
        story.append(Paragraph(analysis.risk_summary.executive_summary, body_style))
        story.append(Spacer(1, 0.3*cm))

        # ─── Risk Score Table ───
        rs = analysis.risk_summary
        score_color = risk_colors.get(rs.overall_level, BRAND)
        summary_data = [
            ['Overall Risk Score', str(rs.overall_score) + '/100'],
            ['Risk Level', rs.overall_level],
            ['Contract Type', rs.contract_type],
            ['Total Clauses', str(rs.total_clauses)],
            ['Critical Issues', str(rs.critical_count)],
            ['High Issues', str(rs.high_count)],
            ['Medium Issues', str(rs.medium_count)],
            ['Trust Score', str(rs.trust_score) + '%'],
        ]
        table = Table(summary_data, colWidths=[9*cm, 8*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), BRAND),
            ('TEXTCOLOR', (0,0), (-1,0), white),
            ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
            ('FONTSIZE', (0,0), (-1,-1), 10),
            ('ROWBACKGROUNDS', (0,0), (-1,-1), [LIGHT_GRAY, white]),
            ('GRID', (0,0), (-1,-1), 0.5, GRAY),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(table)
        story.append(Spacer(1, 0.5*cm))

        # ─── Top Risks ───
        if rs.top_risks:
            story.append(Paragraph("Key Red Flags", h1_style))
            for i, risk in enumerate(rs.top_risks[:5]):
                story.append(Paragraph(f"{i+1}. {risk}", body_style))
            story.append(Spacer(1, 0.3*cm))

        # ─── Clause Analysis ───
        story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY, spaceAfter=8))
        story.append(Paragraph("Clause-by-Clause Analysis", h1_style))

        for clause in analysis.clauses:
            c_color = risk_colors.get(clause.severity, MEDIUM_C)

            story.append(Paragraph(f"■ {clause.title}", h2_style))
            story.append(Paragraph(
                f"<font color='{c_color.hexval()}'><b>Risk Level: {str(clause.severity).split('.')[-1]}</b></font>"
                f" \xb7 Type: {clause.type} \xb7 Confidence: {int(clause.confidence_score*100)}%",
                small_style,
            ))

            if clause.raw_text:
                story.append(Paragraph(f'"{clause.raw_text[:400]}..."' if len(clause.raw_text) > 400 else f'"{clause.raw_text}"', quote_style))

            if clause.plain_explanation:
                story.append(Paragraph(f"<b>Explanation:</b> {clause.plain_explanation}", body_style))
            if clause.real_world_consequence:
                story.append(Paragraph(f"<b>Consequence:</b> {clause.real_world_consequence}", body_style))
            if clause.negotiation_strategy:
                story.append(Paragraph(f"<b>Negotiation:</b> {clause.negotiation_strategy}", body_style))

            story.append(Spacer(1, 0.3*cm))

        # ─── Disclaimer ───
        story.append(HRFlowable(width="100%", thickness=0.5, color=GRAY, spaceAfter=6))
        story.append(Paragraph(
            "⚠️ Disclaimer: This report is generated by AI and is for informational purposes only. "
            "It does not constitute legal advice. Please consult a qualified attorney before signing any contract.",
            small_style,
        ))

        doc.build(story)
        return buffer.getvalue()

    except ImportError:
        return _simple_text_report(analysis)


def _simple_text_report(analysis) -> bytes:
    """Simple text fallback if ReportLab not available."""
    lines = [
        "LEXGUARD AI — CONTRACT ANALYSIS REPORT",
        "=" * 60,
        f"File: {analysis.filename}",
        f"Overall Risk: {analysis.risk_summary.overall_level} ({analysis.risk_summary.overall_score}/100)",
        f"Contract Type: {analysis.risk_summary.contract_type}",
        "",
        "EXECUTIVE SUMMARY",
        analysis.risk_summary.executive_summary,
        "",
        "CLAUSES",
    ]
    for clause in analysis.clauses:
        lines.extend([
            f"\n[{clause.severity}] {clause.title}",
            clause.plain_explanation,
        ])
    return "\n".join(lines).encode("utf-8")
