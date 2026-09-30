import os
import io
import qrcode
from datetime import datetime
from typing import Dict, Any, List
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image as RLImage,
    KeepTogether,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from apps.api.app.config import settings
from apps.api.app.services.traceability_service import create_signed_token, compute_result_hash


def generate_qr_image_bytes(data: str) -> io.BytesIO:
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=4,
        border=2,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1F4D3A", back_color="#FFFDF7")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return buf


def generate_analysis_pdf(analysis_data: Dict[str, Any], lang: str = "en") -> str:
    """
    Generates a bilingual, branded FeedShield Analysis & Quality Certificate PDF.
    Saves to settings.REPORTS_DIR and returns the file path.
    """
    sample_id = analysis_data.get("sample_id", "FS-SAMPLE")
    report_filename = f"FeedShield_Report_{sample_id}.pdf"
    report_path = os.path.join(settings.REPORTS_DIR, report_filename)

    doc = SimpleDocTemplate(
        report_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1F4D3A"),
    )

    tagline_style = ParagraphStyle(
        "Tagline",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#6E7A70"),
    )

    h2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#143628"),
        spaceBefore=12,
        spaceAfter=6,
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#23302A"),
    )

    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6E7A70"),
    )

    elements = []

    # 1. Header Section: FeedShield Branding + Sample ID & Date
    header_data = [
        [
            Paragraph("<b>FeedShield</b> · Feed & Silage Intelligence", title_style),
            Paragraph(f"<b>Certificate ID:</b> {sample_id}<br/><b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}", tagline_style),
        ],
        [
            Paragraph("SIH26111 · Smart AI-Enabled Rapid Testing Platform", tagline_style),
            Paragraph("<b>Status:</b> Official Screening Report", tagline_style),
        ],
    ]
    t_header = Table(header_data, colWidths=[4.2 * inch, 3.0 * inch])
    t_header.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    elements.append(t_header)
    elements.append(Spacer(1, 10))

    # Divider bar
    divider = Table([[""]], colWidths=[7.2 * inch], rowHeights=[2])
    divider.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#1F4D3A"))]))
    elements.append(divider)
    elements.append(Spacer(1, 12))

    # 2. Quality Status & Overall Decision Banner
    overall_risk = analysis_data.get("overall_risk", "GOOD")
    action_decision = analysis_data.get("action_decision", "FEED")

    risk_color_map = {
        "GOOD": colors.HexColor("#EAF4EC"),
        "ATTENTION": colors.HexColor("#FEF8E7"),
        "HIGH RISK": colors.HexColor("#FDECEC"),
        "HIGH_RISK": colors.HexColor("#FDECEC"),
    }
    risk_text_map = {
        "GOOD": colors.HexColor("#1F4D3A"),
        "ATTENTION": colors.HexColor("#8C5808"),
        "HIGH RISK": colors.HexColor("#9C2A2A"),
        "HIGH_RISK": colors.HexColor("#9C2A2A"),
    }

    status_data = [
        [
            Paragraph(f"<b>OVERALL QUALITY:</b> {overall_risk}", ParagraphStyle("Status", fontName="Helvetica-Bold", fontSize=12, textColor=risk_text_map.get(overall_risk, colors.black))),
            Paragraph(f"<b>RECOMMENDED ACTION:</b> {action_decision}", ParagraphStyle("Action", fontName="Helvetica-Bold", fontSize=12, textColor=risk_text_map.get(overall_risk, colors.black))),
        ]
    ]
    t_status = Table(status_data, colWidths=[3.6 * inch, 3.6 * inch])
    t_status.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), risk_color_map.get(overall_risk, colors.HexColor("#F3EDDD"))),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#D8E2D6")),
    ]))
    elements.append(t_status)
    elements.append(Spacer(1, 12))

    # 3. Sample Metadata
    meta_info = [
        ["Sample ID", sample_id, "Sample Type", analysis_data.get("sample_type", "Silage")],
        ["Crop / Material", analysis_data.get("crop_name", "Maize Silage"), "Physical Form", analysis_data.get("physical_form", "Chopped Silage")],
        ["Origin Farm", analysis_data.get("farm_name", "Kailash Dairy Farm"), "Collected Date", analysis_data.get("collected_at", str(datetime.utcnow().date()))],
    ]
    t_meta = Table(meta_info, colWidths=[1.4 * inch, 2.2 * inch, 1.4 * inch, 2.2 * inch])
    t_meta.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.HexColor("#6E7A70")),
        ("TEXTCOLOR", (2, 0), (2, -1), colors.HexColor("#6E7A70")),
        ("TEXTCOLOR", (1, 0), (1, -1), colors.HexColor("#23302A")),
        ("TEXTCOLOR", (3, 0), (3, -1), colors.HexColor("#23302A")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("LINEBELOW", (0, 0), (-1, -1), 0.5, colors.HexColor("#F3EDDD")),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 12))

    # 4. Quantitative Measurements & Predictions Table
    elements.append(Paragraph("Constituent Measurements & Predicted Values", h2_style))
    predictions = analysis_data.get("predictions", [])

    pred_table_data = [
        ["Parameter", "Value / Unit", "Evidence Tag", "Confidence", "95% Uncertainty Interval", "Domain Status"]
    ]
    for p in predictions:
        val_str = f"{p['value']} {p.get('unit', '')}" if p.get("value") is not None else "OUT OF RANGE"
        conf_str = f"{int(p['confidence'] * 100)}%" if p.get("confidence") else "—"
        unc = p.get("uncertainty")
        unc_str = f"[{unc['lower']} to {unc['upper']}]" if unc and isinstance(unc, dict) and "lower" in unc else "—"
        pred_table_data.append([
            p.get("target", "Constituent"),
            val_str,
            p.get("evidence_tag", "PREDICTED"),
            conf_str,
            unc_str,
            p.get("applicability_domain", "IN_DOMAIN"),
        ])

    t_pred = Table(pred_table_data, colWidths=[1.8 * inch, 1.1 * inch, 1.3 * inch, 0.8 * inch, 1.2 * inch, 1.0 * inch])
    t_pred.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1F4D3A")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 1), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E4EBDD")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAF6EC")]),
    ]))
    elements.append(t_pred)
    elements.append(Spacer(1, 12))

    # 5. Silage Fermentation & Advisory Details
    advisory = analysis_data.get("advisory", {})
    chain = advisory.get("chain", {})

    adv_data = [
        [Paragraph("<b>Result Summary:</b>", body_style), Paragraph(chain.get("result", "Normal lactic acid preservation."), body_style)],
        [Paragraph("<b>Identified Issue:</b>", body_style), Paragraph(chain.get("issue", "None detected."), body_style)],
        [Paragraph("<b>Immediate Action:</b>", body_style), Paragraph(chain.get("action", "Feed ration according to daily schedule."), body_style)],
        [Paragraph("<b>Storage Remediation:</b>", body_style), Paragraph(chain.get("storage", "Maintain pit plastic tight sealing."), body_style)],
        [Paragraph("<b>Animal Health Risk:</b>", body_style), Paragraph(chain.get("risk", "Low spoilage hazard."), body_style)],
        [Paragraph("<b>Recommended Next Step:</b>", body_style), Paragraph(chain.get("next_step", "Routine monitoring of core temperature."), body_style)],
    ]
    t_adv = Table(adv_data, colWidths=[1.6 * inch, 5.6 * inch])
    t_adv.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(Paragraph("Actionable Nutritional & Management Advisory", h2_style))
    elements.append(t_adv)
    elements.append(Spacer(1, 14))

    # 6. Verification QR & Cryptographic Authenticity Block
    result_hash = compute_result_hash(sample_id, overall_risk, action_decision, predictions)
    token = create_signed_token(sample_id, result_hash)
    verify_url = f"https://feedshield.in/verify/{sample_id}?token={token}"

    qr_buf = generate_qr_image_bytes(verify_url)
    qr_img = RLImage(qr_buf, width=1.1 * inch, height=1.1 * inch)

    footer_data = [
        [
            qr_img,
            Paragraph(
                f"<b>Digital Authenticity Verification</b><br/>"
                f"Scan QR code with any mobile camera to verify digital signature and hash integrity.<br/>"
                f"<b>Signature Hash:</b> <font face='Courier' size='7'>{result_hash}</font><br/>"
                f"<b>Verification URL:</b> <font size='7'>{verify_url[:60]}...</font><br/>"
                f"<b>Model Calibration:</b> <font color='#C98A2B'>Trained on synthetic demo data — NOT a validation of field accuracy</font>",
                body_style,
            ),
        ]
    ]
    t_footer = Table(footer_data, colWidths=[1.3 * inch, 5.9 * inch])
    t_footer.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAF6EC")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#E4EBDD")),
    ]))
    elements.append(t_footer)
    elements.append(Spacer(1, 10))

    # 7. Regulatory & Scientific Disclaimer (Mandatory per Claims Policy)
    disclaimer_text = (
        "<b>SCIENTIFIC & LEGAL DISCLAIMER:</b> FeedShield provides rapid AI-enabled screening, estimation, "
        "and decision support. Screening results do not replace formal laboratory wet-chemistry analysis (e.g. Kjeldahl, HPLC). "
        "Any suspected adulteration, toxicosis, or out-of-domain sample must be referred to an accredited laboratory for confirmatory testing."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(elements)
    return report_path
