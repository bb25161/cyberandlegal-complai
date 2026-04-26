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
# FULL (EVIDENCE MODE)
# =========================================================

def run_assessment_with_tests(
    intake: dict,
    run_owasp: bool = True,
    run_promptfoo: bool = False,
    run_compl_ai: bool = False,
    run_lm_eval: bool = False,
) -> dict:

    evidence = dict(intake.get("evidence_layer") or {})
    log = []

    tech_profile = intake.get("technical_test_profile", {})
    provider = tech_profile.get("provider") or "openai"
    model = tech_profile.get("model_name") or "gpt-4o-mini"
    api_key = tech_profile.get("user_api_key_supplied") or ""

    # ================= OWASP =================
    if run_owasp:
        try:
            from engines.owasp_engine import run_owasp_tests
            result = run_owasp_tests(dry_run=False)
            evidence["owasp_composite_score"] = result.get("composite_score")
            log.append({
                "engine": "OWASP",
                "score": result.get("composite_score"),
                "status": result.get("status"),
                "timestamp": now_utc(),
            })
        except Exception as e:
            log.append({"engine": "OWASP", "error": str(e), "timestamp": now_utc()})

    # ================= PROMPTFOO =================
    if run_promptfoo:
        try:
            from engines.promptfoo_engine import run_promptfoo
            result = run_promptfoo(
                model=model,
                provider=provider,
                api_key=api_key or None,
                num_tests=10,
                dry_run=False,
            )
            score = result.get("composite_score")
            evidence["promptfoo_red_team_score"] = score
            log.append({
                "engine": "Promptfoo",
                "score": score,
                "status": result.get("status"),
                "category_scores": result.get("category_scores"),
                "timestamp": now_utc(),
            })
        except Exception as e:
            log.append({"engine": "Promptfoo", "error": str(e), "timestamp": now_utc()})

    # ================= COMPL-AI =================
    if run_compl_ai:
        try:
            from engines.compl_ai_engine import run_compl_ai
            result = run_compl_ai(
                model=model,
                tasks="all",
                limit=10,
                api_key=api_key or None,
                dry_run=False,
            )
            score = result.get("composite_score")
            evidence["compl_ai_bias_score"] = score
            log.append({
                "engine": "COMPL-AI",
                "score": score,
                "status": result.get("status"),
                "principle_scores": result.get("principle_scores"),
                "timestamp": now_utc(),
            })
        except Exception as e:
            log.append({"engine": "COMPL-AI", "error": str(e), "timestamp": now_utc()})

    # ================= LM EVAL =================
    if run_lm_eval:
        try:
            from engines.lm_eval_engine import run_lm_eval
            result = run_lm_eval(
                model=model,
                benchmark_set="quick",
                model_type=provider,
                api_key=api_key or None,
                dry_run=False,
            )
            score = result.get("composite_score")
            evidence["lm_eval_score"] = score
            log.append({
                "engine": "LM Eval",
                "score": score,
                "status": result.get("status"),
                "task_scores": result.get("task_scores"),
                "timestamp": now_utc(),
            })
        except Exception as e:
            log.append({"engine": "LM Eval", "error": str(e), "timestamp": now_utc()})

    evidence["timestamp"] = now_utc()
    if log:
        evidence["technical_test_status"] = "completed_with_available_engines"
    elif evidence.get("technical_test_requested"):
        evidence["technical_test_status"] = "requested_but_no_engine_executed"

    intake["evidence_layer"] = evidence

    result = run_assessment(intake)

    result["evidence_summary"] = {
        "engines": log,
        "scores": evidence
    }

    return result
