"""
scripts/generate_report.py
Cyber&Legal · AI Governance Assessment Report Generator
========================================================
Combines results from COMPL-AI, OWASP, NIST, and ENISA assessments
into a single branded HTML report.

Usage:
    python scripts/generate_report.py
    python scripts/generate_report.py --title "Q2 2025 AI Governance Review" --model gpt-4o
"""

import json
import argparse
import datetime
from pathlib import Path

REPORT_DIR = Path("reports/output")


def load_json(path: str) -> dict:
    try:
        with open(path) as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {}


def score_to_color(score: float) -> str:
    if score is None:
        return "#888"
    if score >= 0.75:
        return "#10B981"
    if score >= 0.50:
        return "#F59E0B"
    return "#EF4444"


def score_to_label(score: float) -> str:
    if score is None:
        return "N/A"
    if score >= 0.75:
        return "COMPLIANT"
    if score >= 0.50:
        return "PARTIAL"
    return "NON-COMPLIANT"


def generate_html_report(
    complai_data: dict,
    owasp_data: dict,
    nist_data: dict,
    enisa_data: dict,
    title: str,
    model: str,
    output_path: str,
):
    now = datetime.datetime.utcnow().strftime("%B %d, %Y at %H:%M UTC")

    # Extract key metrics
    eu_score = complai_data.get("eu_ai_act_assessment", {}).get("composite_eu_ai_act_score")
    eu_tier = complai_data.get("eu_ai_act_assessment", {}).get("compliance_tier", "N/A")
    eu_principles = complai_data.get("eu_ai_act_assessment", {}).get("principles", {})

    owasp_score = owasp_data.get("overall_score")
    owasp_status = owasp_data.get("owasp_status", "N/A")
    owasp_categories = owasp_data.get("categories", {})
    owasp_critical = owasp_data.get("critical_failures", [])

    nist_score = nist_data.get("scores", {}).get("overall_nist_score")
    nist_maturity = nist_data.get("scores", {}).get("overall_maturity", "N/A")
    nist_functions = nist_data.get("scores", {}).get("functions", {})

    enisa_risk = enisa_data.get("overall_residual_risk")
    enisa_rating = enisa_data.get("risk_rating", "N/A")
    enisa_critical = enisa_data.get("critical_threats", [])
    enisa_threats = enisa_data.get("threats", {})

    # Compute composite overall score
    scores = [s for s in [eu_score, owasp_score, nist_score] if s is not None]
    if enisa_risk is not None:
        scores.append(1 - enisa_risk)
    composite = sum(scores) / len(scores) if scores else None

    def fmt(v):
        return f"{v:.0%}" if v is not None else "N/A"

    def principle_rows(principles):
        rows = ""
        for name, data in principles.items():
            s = data.get("score")
            color = score_to_color(s)
            rows += f"""
            <tr>
                <td>{name}</td>
                <td style="color:#8B9DBB;font-size:12px">{data.get('article','')}</td>
                <td><div style="background:#1A2540;border-radius:4px;height:8px;width:100%;overflow:hidden"><div style="background:{color};width:{f'{s:.0%}' if s else '0%'};height:100%"></div></div></td>
                <td style="text-align:right;color:{color};font-weight:500">{fmt(s)}</td>
                <td><span style="background:{color}22;color:{color};padding:2px 8px;border-radius:99px;font-size:11px">{score_to_label(s)}</span></td>
            </tr>"""
        return rows

    def owasp_rows(categories):
        rows = ""
        for oid, data in categories.items():
            s = data.get("pass_rate")
            color = score_to_color(s)
            sev = data.get("severity", "")
            sev_color = {"CRITICAL": "#EF4444", "HIGH": "#F59E0B", "MEDIUM": "#3B82F6"}.get(sev, "#888")
            rows += f"""
            <tr>
                <td style="font-family:monospace;font-size:12px">{oid}</td>
                <td>{data.get('title','')[:40]}</td>
                <td><span style="background:{sev_color}22;color:{sev_color};padding:2px 8px;border-radius:99px;font-size:10px">{sev}</span></td>
                <td><div style="background:#1A2540;border-radius:4px;height:8px;width:100%;overflow:hidden"><div style="background:{color};width:{f'{s:.0%}' if s else '0%'};height:100%"></div></div></td>
                <td style="text-align:right;color:{color};font-weight:500">{fmt(s)}</td>
            </tr>"""
        return rows

    def enisa_rows(threats):
        rows = ""
        for tid, data in threats.items():
            level = data.get("risk_level", "")
            color = {"LOW": "#10B981", "MEDIUM": "#F59E0B", "HIGH": "#F97316", "CRITICAL": "#EF4444"}.get(level, "#888")
            rows += f"""
            <tr>
                <td style="font-family:monospace;font-size:12px">{tid}</td>
                <td>{data.get('title','')[:45]}</td>
                <td style="color:#8B9DBB;font-size:11px">{data.get('category','')}</td>
                <td><span style="background:{color}22;color:{color};padding:2px 8px;border-radius:99px;font-size:10px">{level}</span></td>
                <td style="text-align:right;color:{color};font-weight:500">{fmt(data.get('mitigation_score'))}</td>
            </tr>"""
        return rows

    def nist_function_rows(functions):
        rows = ""
        for fname, data in functions.items():
            s = data.get("score")
            color = score_to_color(s)
            mat = data.get("maturity_level", "")
            rows += f"""
            <tr>
                <td style="font-weight:500">{fname}</td>
                <td style="color:#8B9DBB;font-size:12px">{data.get('description','')[:50]}</td>
                <td><div style="background:#1A2540;border-radius:4px;height:8px;width:100%;overflow:hidden"><div style="background:{color};width:{f'{s:.0%}' if s else '0%'};height:100%"></div></div></td>
                <td style="text-align:right;color:{color};font-weight:500">{fmt(s)}</td>
                <td><span style="background:{color}22;color:{color};padding:2px 8px;border-radius:99px;font-size:10px">{mat}</span></td>
            </tr>"""
        return rows

    composite_color = score_to_color(composite)

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — Cyber&Legal AI Governance Report</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A0F1E; color: #F0F4FF; line-height: 1.6; }}
  .page {{ max-width: 1100px; margin: 0 auto; padding: 40px 32px; }}
  .header {{ border-bottom: 0.5px solid rgba(255,255,255,0.08); padding-bottom: 32px; margin-bottom: 40px; }}
  .logo {{ font-size: 13px; font-weight: 600; color: #3B82F6; letter-spacing: 1px; margin-bottom: 16px; }}
  h1 {{ font-size: 32px; font-weight: 600; letter-spacing: -1px; margin-bottom: 8px; }}
  .meta {{ color: #8B9DBB; font-size: 13px; }}
  .score-grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 40px; }}
  .score-card {{ background: #0F1628; border: 0.5px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 20px; }}
  .score-label {{ font-size: 11px; color: #4A5568; letter-spacing: 0.8px; font-weight: 600; margin-bottom: 8px; }}
  .score-value {{ font-size: 32px; font-weight: 600; letter-spacing: -1px; }}
  .score-tier {{ font-size: 11px; margin-top: 4px; }}
  .section {{ margin-bottom: 40px; }}
  .section-header {{ display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; border-bottom: 0.5px solid rgba(255,255,255,0.06); padding-bottom: 12px; }}
  .section-title {{ font-size: 16px; font-weight: 600; }}
  .section-badge {{ font-size: 10px; background: rgba(37,99,235,0.15); color: #3B82F6; padding: 3px 10px; border-radius: 99px; font-weight: 600; letter-spacing: 0.5px; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
  th {{ text-align: left; color: #4A5568; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; padding: 8px 12px; border-bottom: 0.5px solid rgba(255,255,255,0.06); }}
  td {{ padding: 10px 12px; border-bottom: 0.5px solid rgba(255,255,255,0.04); vertical-align: middle; }}
  tr:hover td {{ background: rgba(255,255,255,0.02); }}
  .alert {{ background: rgba(239,68,68,0.08); border: 0.5px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: #FCA5A5; }}
  .footer {{ border-top: 0.5px solid rgba(255,255,255,0.06); padding-top: 24px; margin-top: 40px; color: #4A5568; font-size: 12px; display: flex; justify-content: space-between; }}
  @media print {{ body {{ background: white; color: black; }} .score-card {{ background: #f8f8f8; border: 1px solid #ddd; }} }}
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="logo">CYBER&LEGAL · AI GOVERNANCE ASSESSMENT</div>
    <h1>{title}</h1>
    <div class="meta">
      Model evaluated: <strong style="color:#F0F4FF">{model or 'Not specified'}</strong> &nbsp;·&nbsp;
      Generated: {now} &nbsp;·&nbsp;
      Engine: COMPL-AI v2 (ETH Zurich × LatticeFlow AI × INSAIT)
    </div>
  </div>

  <!-- Score Cards -->
  <div class="score-grid">
    <div class="score-card">
      <div class="score-label">COMPOSITE SCORE</div>
      <div class="score-value" style="color:{composite_color}">{fmt(composite)}</div>
      <div class="score-tier" style="color:{composite_color}">Overall Governance Posture</div>
    </div>
    <div class="score-card">
      <div class="score-label">EU AI ACT</div>
      <div class="score-value" style="color:{score_to_color(eu_score)}">{fmt(eu_score)}</div>
      <div class="score-tier" style="color:{score_to_color(eu_score)}">{eu_tier}</div>
    </div>
    <div class="score-card">
      <div class="score-label">OWASP LLM TOP 10</div>
      <div class="score-value" style="color:{score_to_color(owasp_score)}">{fmt(owasp_score)}</div>
      <div class="score-tier" style="color:{score_to_color(owasp_score)}">{owasp_status}</div>
    </div>
    <div class="score-card">
      <div class="score-label">NIST AI RMF</div>
      <div class="score-value" style="color:{score_to_color(nist_score)}">{fmt(nist_score)}</div>
      <div class="score-tier" style="color:{score_to_color(nist_score)}">{nist_maturity}</div>
    </div>
  </div>

  <!-- Alerts -->
  {''.join([f'<div class="alert">⚠️ OWASP CRITICAL FAILURE: {c} — Immediate remediation required.</div>' for c in owasp_critical])}
  {''.join([f'<div class="alert">🚨 ENISA CRITICAL THREAT: {t} — Critical residual risk detected.</div>' for t in enisa_critical])}

  <!-- EU AI Act -->
  <div class="section">
    <div class="section-header">
      <span class="section-title">EU AI Act Compliance — 6 Core Principles</span>
      <span class="section-badge">COMPL-AI · ETH ZURICH × LATTICEFLOW AI</span>
    </div>
    <table>
      <thead><tr>
        <th>Principle</th><th>Article</th><th style="width:200px">Score</th><th>%</th><th>Status</th>
      </tr></thead>
      <tbody>{principle_rows(eu_principles)}</tbody>
    </table>
  </div>

  <!-- OWASP -->
  <div class="section">
    <div class="section-header">
      <span class="section-title">OWASP LLM Top 10 — 2025 Edition</span>
      <span class="section-badge">OWASP FOUNDATION · CC BY-SA 4.0</span>
    </div>
    <table>
      <thead><tr>
        <th>ID</th><th>Vulnerability</th><th>Severity</th><th style="width:150px">Pass Rate</th><th>Score</th>
      </tr></thead>
      <tbody>{owasp_rows(owasp_categories)}</tbody>
    </table>
  </div>

  <!-- NIST AI RMF -->
  <div class="section">
    <div class="section-header">
      <span class="section-title">NIST AI RMF — 4 Core Functions</span>
      <span class="section-badge">NIST AI 100-1 (2023) · PUBLIC DOMAIN</span>
    </div>
    <table>
      <thead><tr>
        <th>Function</th><th>Description</th><th style="width:150px">Score</th><th>%</th><th>Maturity</th>
      </tr></thead>
      <tbody>{nist_function_rows(nist_functions)}</tbody>
    </table>
  </div>

  <!-- ENISA -->
  <div class="section">
    <div class="section-header">
      <span class="section-title">ENISA AI Threat Landscape — 11 Threat Categories</span>
      <span class="section-badge">ENISA 2024 · CC BY 4.0</span>
    </div>
    <table>
      <thead><tr>
        <th>ID</th><th>Threat</th><th>Category</th><th>Risk Level</th><th>Mitigation</th>
      </tr></thead>
      <tbody>{enisa_rows(enisa_threats)}</tbody>
    </table>
  </div>

  <!-- Footer -->
  <div class="footer">
    <span>Cyber&Legal AI Governance Lab · <a href="https://cyberandlegal.com" style="color:#3B82F6">cyberandlegal.com</a></span>
    <span>COMPL-AI Apache 2.0 · NIST Public Domain · OWASP CC BY-SA 4.0 · ENISA CC BY 4.0</span>
  </div>

</div>
</body>
</html>"""

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n✅ HTML Report generated: {output_path}")
    return output_path


def main():
    parser = argparse.ArgumentParser(description="Cyber&Legal · Report Generator")
    parser.add_argument("--title", default="AI Governance Assessment Report")
    parser.add_argument("--model", default="")
    parser.add_argument("--output", default="reports/output/assessment_report.html")
    args = parser.parse_args()

    complai = load_json(REPORT_DIR / "assessment_summary.json")
    owasp = load_json(REPORT_DIR / "owasp_assessment.json")
    nist = load_json(REPORT_DIR / "nist_assessment.json")
    enisa = load_json(REPORT_DIR / "enisa_assessment.json")

    generate_html_report(complai, owasp, nist, enisa, args.title, args.model, args.output)
    print(f"\n  Open with: open {args.output}\n")


if __name__ == "__main__":
    main()
