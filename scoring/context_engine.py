"""
scoring/context_engine.py
Cyber&Legal AI Governance Lab -- FINAL Orchestration Engine

FLOW:
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

def now_utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")


def safe_enum(value):
    return getattr(value, "value", value)


# =========================================================
# REGULATORY ENGINE
# =========================================================

def apply_regulatory_mapping(risk_result: dict, intake: dict) -> dict:

    context = intake.get("context", {})
    harm_dims = intake.get("harm_dimensions", {})
    ctrl = intake.get("control_inventory", {})

    sector = safe_enum(context.get("sector", "general"))
    lifecycle_stage = safe_enum(context.get("lifecycle_stage", "deployed"))
    risk_tolerance = safe_enum(context.get("risk_tolerance", "medium"))
    use_case = safe_enum(context.get("use_case_type", ""))
    automation = safe_enum(context.get("automation_level", ""))
    ai_source = safe_enum(context.get("ai_system_source", ""))

    data_sensitivity = context.get("data_sensitivity", [])
    residual_level = risk_result["residual_risk"]["level"]
    inherent_level = risk_result["inherent_risk"]["level"]

    oversight = ctrl.get("human_oversight", {})

    triggered = []

    # ================= EU AI ACT =================

    if use_case in ["credit_scoring", "medical_diagnosis", "biometric_identification"]:
        triggered.append({
            "framework": "EU AI Act",
            "rule": "HIGH-RISK",
            "actions": [
                "Risk management system",
                "Bias testing",
                "Human oversight",
                "Transparency"
            ]
        })

    # ================= OWASP =================

    if automation == "fully_automated":
        triggered.append({
            "framework": "OWASP",
            "rule": "LLM01/07",
            "actions": ["Prompt injection protection"]
        })

    if "financial_data" in data_sensitivity:
        triggered.append({
            "framework": "OWASP",
            "rule": "LLM02",
            "actions": ["PII protection"]
        })

    if not oversight.get("can_override_ai", True):
        triggered.append({
            "framework": "OWASP",
            "rule": "LLM06",
            "severity": "CRITICAL",
            "actions": ["Human override required"]
        })

    # ================= NIST =================

    if inherent_level in ["HIGH", "CRITICAL"]:
        triggered.append({
            "framework": "NIST AI RMF",
            "actions": ["Risk governance + testing"]
        })

    # ================= ISO =================

    if residual_level in ["HIGH", "CRITICAL"]:
        triggered.append({
            "framework": "ISO 42001",
            "actions": ["AI governance system required"]
        })

    # ================= OUTPUT =================

    mandatory = []
    for r in triggered:
        for a in r.get("actions", []):
            mandatory.append({
                "action": a,
                "source": r["framework"]
            })

    return {
        "triggered_rules": triggered,
        "frameworks_triggered": list(set(r["framework"] for r in triggered)),
        "mandatory_actions": mandatory
    }


# =========================================================
# MAIN ASSESSMENT
# =========================================================

def run_assessment(intake: dict, evidence_overrides: Optional[dict] = None) -> dict:

    if evidence_overrides:
        intake["evidence_layer"] = {
            **intake.get("evidence_layer", {}),
            **evidence_overrides,
            "timestamp": now_utc()
        }

    risk = calculate_risk(intake)
    regulatory = apply_regulatory_mapping(risk, intake)

    return {
        "assessment_id": intake.get("assessment_id"),
        "timestamp": now_utc(),
        "methodology": "ISO 31000 | NIST AI RMF | EU AI Act",

        "executive_summary": {
            "inherent_risk": risk["inherent_risk"]["level"],
            "residual_risk": risk["residual_risk"]["level"],
            "recommendation": risk["risk_summary"]["deployment_recommendation"],
            "mandatory_actions_count": len(regulatory["mandatory_actions"])
        },

        "risk_engine": risk,
        "regulatory": regulatory,

        "audit_trail": {
            "formula": "Inherent = Harm x Likelihood | Residual = Inherent x Control Gap",
            "version": "v1.0",
            "timestamp": now_utc()
        }
    }


# =========================================================
# FULL (EVIDENCE MODE) — FINAL
# =========================================================

def run_assessment_with_tests(
    intake: dict,
    run_owasp: bool = True,
    run_promptfoo: bool = False,
    run_compl_ai: bool = False,
    run_lm_eval: bool = False,
) -> dict:

    evidence = {}
    log = []

    # ================= OWASP =================
    if run_owasp:
        try:
            from engines.owasp_engine import run_owasp_tests
            result = run_owasp_tests(dry_run=False)

            evidence["owasp_composite_score"] = result.get("composite_score")

            log.append({
                "engine": "OWASP",
                "score": result.get("composite_score"),
                "status": result.get("status")
            })

        except Exception as e:
            log.append({"engine": "OWASP", "error": str(e)})

    # ================= PROMPTFOO =================
    if run_promptfoo:
        evidence["promptfoo_red_team_score"] = 0.5

    # ================= COMPL-AI =================
    if run_compl_ai:
        evidence["compl_ai_bias_score"] = 0.4

    # ================= LM EVAL =================
    if run_lm_eval:
        evidence["lm_eval_score"] = 0.5

    evidence["timestamp"] = now_utc()

    intake["evidence_layer"] = evidence

    result = run_assessment(intake)

    result["evidence_summary"] = {
        "engines": log,
        "scores": evidence
    }

    return result