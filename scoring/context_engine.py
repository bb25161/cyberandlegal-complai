"""
scoring/context_engine.py
Cyber&Legal AI Governance Lab -- Orchestration Engine

NE YAPAR:
    Intake -> Evidence -> Risk Engine -> Regulatory Mapping -> Output
"""

import datetime
import json
import os
import sys
from typing import Optional, Dict, Any

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from scoring.scoring import calculate_risk


# =========================================================
# HELPER
# =========================================================

def safe_enum(value):
    """Enum veya string gelen değeri normalize eder."""
    return getattr(value, "value", value)


# =========================================================
# LOAD MAPPING
# =========================================================

def load_regulatory_mapping() -> dict:
    mapping_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "regulatory_mapping.json"
    )
    try:
        with open(mapping_path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


# =========================================================
# REGULATORY ENGINE
# =========================================================

def apply_regulatory_mapping(risk_result: dict, intake: dict, mapping: dict) -> dict:
    context = intake.get("context", {})
    harm_dims = intake.get("harm_dimensions", {})
    ctrl = intake.get("control_inventory", {})

    # ENUM FIX
    sector = safe_enum(context.get("sector", "general"))
    use_case = safe_enum(context.get("use_case_type", ""))
    automation = safe_enum(context.get("automation_level", ""))
    ai_source = safe_enum(context.get("ai_system_source", ""))

    data_sensitivity = context.get("data_sensitivity", [])
    residual_level = risk_result.get("residual_risk", {}).get("level", "LOW")
    inherent_level = risk_result.get("inherent_risk", {}).get("level", "LOW")

    harm_types = [h.get("type") for h in harm_dims.get("harm_types", [])]

    stakeholders = harm_dims.get("affected_stakeholders", [])
    has_vulnerable = any(s.get("is_vulnerable", False) for s in stakeholders)
    has_children = any(s.get("stakeholder_type") == "children_under_18" for s in stakeholders)

    oversight = ctrl.get("human_oversight", {})
    explainability = ctrl.get("explainability", {})
    supply_chain = ctrl.get("supply_chain_controls", {})

    triggered_rules = []

    # =====================================================
    # EU AI ACT
    # =====================================================

    annex3_use_cases = [
        "credit_scoring", "insurance_risk_scoring",
        "hr_screening", "medical_diagnosis",
        "biometric_identification"
    ]

    if use_case in annex3_use_cases:
        triggered_rules.append({
            "rule_id": "EUAIA-001",
            "framework": "EU AI Act",
            "classification": "HIGH-RISK - Annex III",
            "trigger_reason": f"Use case '{use_case}' is listed in EU AI Act Annex III",
            "key_obligations": [
                "Art. 9 - Risk management system",
                "Art. 10 - Data governance",
                "Art. 13 - Transparency",
                "Art. 14 - Human oversight",
                "Art. 49 - EU database registration"
            ]
        })

    if has_vulnerable:
        triggered_rules.append({
            "rule_id": "EUAIA-002",
            "framework": "EU AI Act",
            "classification": "FRIA Required",
            "trigger_reason": "Vulnerable group affected",
            "key_obligations": [
                "Art. 27 - FRIA mandatory",
                "Art. 14 - Enhanced oversight"
            ]
        })

    if not explainability.get("decisions_explainable_to_users", True) and automation == "fully_automated":
        triggered_rules.append({
            "rule_id": "EUAIA-003",
            "framework": "EU AI Act",
            "trigger_reason": "Black-box + fully automated",
            "severity": "HIGH"
        })

    # =====================================================
    # NIST
    # =====================================================

    if inherent_level in ["HIGH", "CRITICAL"]:
        triggered_rules.append({
            "rule_id": "NIST-001",
            "framework": "NIST AI RMF",
            "trigger_reason": "High risk profile",
        })

    # =====================================================
    # OWASP
    # =====================================================

    if automation == "fully_automated":
        triggered_rules.append({
            "rule_id": "OWASP-001",
            "framework": "OWASP LLM Top 10 2025",
            "categories": ["LLM01", "LLM07"]
        })

    if "financial_data" in data_sensitivity:
        triggered_rules.append({
            "rule_id": "OWASP-002",
            "framework": "OWASP LLM Top 10 2025",
            "categories": ["LLM02", "LLM04"]
        })

    if not oversight.get("can_override_ai", True):
        triggered_rules.append({
            "rule_id": "OWASP-004",
            "framework": "OWASP LLM Top 10 2025",
            "severity": "CRITICAL"
        })

    # =====================================================
    # ENISA
    # =====================================================

    if sector in ["finance", "energy"]:
        triggered_rules.append({
            "rule_id": "ENISA-001",
            "framework": "ENISA",
            "trigger_reason": "High target sector"
        })

    # =====================================================
    # ISO 42001
    # =====================================================

    if residual_level in ["HIGH", "CRITICAL"]:
        triggered_rules.append({
            "rule_id": "ISO-001",
            "framework": "ISO/IEC 42001",
            "trigger_reason": "High residual risk"
        })

    return {
        "triggered_rules_count": len(triggered_rules),
        "triggered_rules": triggered_rules,
        "frameworks_triggered": list(set(r["framework"] for r in triggered_rules)),
    }


# =========================================================
# MAIN FLOW
# =========================================================

def run_assessment(intake: dict, evidence_overrides: Optional[dict] = None) -> dict:

    if evidence_overrides:
        intake["evidence_layer"] = {
            **intake.get("evidence_layer", {}),
            **evidence_overrides,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    risk_result = calculate_risk(intake)
    mapping = load_regulatory_mapping()
    regulatory = apply_regulatory_mapping(risk_result, intake, mapping)

    return {
        "assessment_id": intake.get("assessment_id"),
        "timestamp": datetime.datetime.utcnow().isoformat(),

        "executive_summary": {
            "inherent_risk": risk_result["inherent_risk"]["level"],
            "residual_risk": risk_result["residual_risk"]["level"],
            "recommendation": risk_result["risk_summary"]["deployment_recommendation"],
        },

        "risk_engine": risk_result,
        "regulatory": regulatory,
    }


# =========================================================
# FULL (WITH EVIDENCE)
# =========================================================

def run_assessment_with_tests(intake: dict) -> dict:

    evidence = {}

    try:
        from engines.owasp_engine import run_owasp_tests

        owasp = run_owasp_tests(dry_run=True)

        evidence["owasp_composite_score"] = owasp.get("composite_score")

    except Exception as e:
        evidence["owasp_error"] = str(e)

    intake["evidence_layer"] = evidence

    result = run_assessment(intake)

    result["evidence_summary"] = evidence

    return result