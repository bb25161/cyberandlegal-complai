"""
backend/nist_patch.py
─────────────────────────────────────────────────────────────────────
NIST AI RMF — Pydantic model additions
Apply these changes to your existing main.py / scoring/models.py

3 new fields that require Pydantic changes:
  1. context.lifecycle_stage     (NIST MAP 1.4)
  2. context.risk_tolerance      (NIST MAP 1.5 / GOVERN 1.3)
  3. control_inventory.incident_response.decommission_plan  (NIST GOVERN 1.7)

4 fields that work WITHOUT Pydantic changes (handled in api.js mapping):
  - likelihood_inputs.model_susceptibility  (was hardcoded "medium", now from drift question)
  - control_inventory.testing_and_validation.adversarial_testing_performed (was hardcoded False)
  - control_inventory.explainability.explanation_quality (was derived from transparency toggle)
  - harm_types enum additions (allocational_harm, representational_harm) — only if strict enum validation
"""

from enum import Enum
from pydantic import BaseModel
from typing import Optional


# ── 1. New Enums ───────────────────────────────────────────────────────────────

class LifecycleStageEnum(str, Enum):
    design      = "design"
    development = "development"
    testing     = "testing"
    deployed    = "deployed"
    scaling     = "scaling"
    retiring    = "retiring"


class RiskToleranceEnum(str, Enum):
    zero_tolerance = "zero_tolerance"   # NIST MAP 1.5
    low            = "low"
    medium         = "medium"
    high           = "high"


class DecommissionPlanEnum(str, Enum):
    none       = "none"         # NIST GOVERN 1.7
    informal   = "informal"
    documented = "documented"


# ── 2. Extended HarmTypeEnum (add these values) ────────────────────────────────
# NIST MEASURE 2.11 — allocational and representational harm types

class HarmTypeEnumExtended(str, Enum):
    # Existing values — keep all of these
    financial_loss         = "financial_loss"
    discrimination         = "discrimination"
    privacy_violation      = "privacy_violation"
    physical_safety        = "physical_safety"
    reputational_damage    = "reputational_damage"
    psychological_harm     = "psychological_harm"
    legal_rights_violation = "legal_rights_violation"
    # NEW — NIST MEASURE 2.11
    allocational_harm      = "allocational_harm"
    representational_harm  = "representational_harm"


# ── 3. Patch instructions for existing Pydantic models ────────────────────────
#
# In your ContextModel (or equivalent), ADD:
#
#   lifecycle_stage: Optional[LifecycleStageEnum] = LifecycleStageEnum.deployed
#   risk_tolerance:  Optional[RiskToleranceEnum]  = RiskToleranceEnum.medium
#
# In your IncidentResponseModel (or equivalent), ADD:
#
#   decommission_plan: Optional[DecommissionPlanEnum] = DecommissionPlanEnum.none
#
# In your HarmTypeEnum, ADD:
#   allocational_harm     = "allocational_harm"
#   representational_harm = "representational_harm"
#
# ── 4. scoring/decision.py — use risk_tolerance in threshold ──────────────────
#
# Suggested logic in your decision.py / risk scoring:
#
#   RISK_TOLERANCE_MULTIPLIER = {
#       "zero_tolerance": 0.7,   # lower threshold → more likely HIGH risk
#       "low":            0.85,
#       "medium":         1.0,   # baseline
#       "high":           1.2,   # higher threshold → more lenient
#   }
#
#   risk_tolerance = context.get("risk_tolerance", "medium")
#   multiplier = RISK_TOLERANCE_MULTIPLIER.get(risk_tolerance, 1.0)
#   adjusted_score = base_risk_score * multiplier
#
# ── 5. scoring/decision.py — use lifecycle_stage for context weighting ─────────
#
#   LIFECYCLE_WEIGHT = {
#       "design":      0.6,   # early stage → lower inherent risk weight
#       "development": 0.75,
#       "testing":     0.85,
#       "deployed":    1.0,   # baseline — production systems
#       "scaling":     1.1,   # higher scale → higher exposure
#       "retiring":    0.9,   # phasing out → slightly lower but decommission check needed
#   }
#
# ── 6. Report enrichment — decommission_plan in regulatory output ─────────────
#
# If decommission_plan == "none" AND lifecycle_stage in ["deployed","scaling"]:
#   Add to mandatory_actions:
#   {
#     "action": "Establish a documented decommission plan per NIST AI RMF GOVERN 1.7",
#     "source": "NIST AI RMF GOVERN 1.7 / MANAGE 2.4",
#     "priority": "medium"
#   }
#
# ── 7. eu_screening passthrough ───────────────────────────────────────────────
#
# The payload now includes an eu_screening block:
#   {
#     "eu_screening": {
#       "role":          "provider" | "deployer" | "both" | "importer",
#       "risk_category": "minimal" | "limited" | "high" | "gpai" | "gpai_systemic",
#       "obligations":   [...]   # list of obligation strings from EUScreening component
#     }
#   }
#
# Add an Optional[dict] field to your top-level request model:
#   eu_screening: Optional[dict] = None
#
# Pass it through to the report as-is — the ReportPage will render it.
#
# ── 8. Quick test after applying ──────────────────────────────────────────────
#
# curl -X POST https://cyberandlegal-backend-373426633543.europe-west4.run.app/assess/risk \
#   -H "Content-Type: application/json" \
#   -d '{
#     "context": {
#       "organization": "Test",
#       "sector": "finance",
#       "use_case_type": "credit_scoring",
#       "automation_level": "fully_automated",
#       "ai_system_source": "third_party_api",
#       "transparency_level": "black_box",
#       "data_sensitivity": [],
#       "training_data_source": ["own_historical_data"],
#       "vendor_documentation_available": "no_docs",
#       "decision_frequency": {"people_affected_monthly": "1000_to_100000", "decision_criticality": "life_changing"},
#       "lifecycle_stage": "deployed",
#       "risk_tolerance": "low"
#     },
#     "harm_dimensions": {
#       "harm_types": [{"type": "allocational_harm", "severity": "significant"}],
#       "affected_stakeholders": [{"stakeholder_type": "general_adult_users", "is_vulnerable": false}],
#       "rights_at_risk": [],
#       "reversibility": "difficult_to_reverse",
#       "cascade_effect": "systemic",
#       "detectability": "detectable_within_days",
#       "scale_of_impact": {"geographic_scope": "local", "population_potentially_harmed": "entire_population_segment"}
#     },
#     "likelihood_inputs": {
#       "threat_exposure": "high",
#       "past_incidents": "one_known_incident",
#       "model_susceptibility": "high",
#       "deployment_environment_risk": "public_facing_high_volume"
#     },
#     "control_inventory": {
#       "human_oversight": {"oversight_quality": "rubber_stamp", "can_override_ai": false, "can_stop_system": true, "automation_bias_training": false},
#       "explainability": {"decisions_explainable_to_users": false, "explanation_quality": "no_explanation"},
#       "monitoring_logging": {"logging_active": false, "monitoring_frequency": "none", "audit_trail_available": false},
#       "opt_out_and_escalation": {"user_can_request_human_review": false, "human_escalation_path_exists": false, "vulnerable_user_detection": false},
#       "testing_and_validation": {"bias_testing_performed": false, "adversarial_testing_performed": false, "testing_frequency": "never", "test_coverage": "none"},
#       "supply_chain_controls": {"vendor_risk_assessed": false, "model_card_available": false, "bias_test_results_from_vendor": false, "contractual_audit_rights": false},
#       "incident_response": {"incident_response_plan_exists": false, "complaint_mechanism_available": false, "fallback_procedure_defined": false, "decommission_plan": "none"}
#     },
#     "eu_screening": {"role": "deployer", "risk_category": "high", "obligations": []},
#     "evidence_layer": {}
#   }'
"""

# ── Minimal example showing how to integrate into existing main.py ────────────

EXAMPLE_PATCH = """
# In your existing main.py, find the ContextInput model and add:

class ContextInput(BaseModel):
    # ... your existing fields ...
    lifecycle_stage: Optional[str] = "deployed"   # NIST MAP 1.4
    risk_tolerance:  Optional[str] = "medium"      # NIST MAP 1.5


# Find your IncidentResponseInput model and add:

class IncidentResponseInput(BaseModel):
    # ... your existing fields ...
    decommission_plan: Optional[str] = "none"      # NIST GOVERN 1.7


# At top level, add eu_screening passthrough:

class AssessmentRequest(BaseModel):
    # ... your existing fields ...
    eu_screening: Optional[dict] = None            # EU AI Act screening metadata


# In your /assess/risk endpoint, pass lifecycle_stage and risk_tolerance to scoring:

@app.post("/assess/risk")
async def assess_risk(request: AssessmentRequest):
    # existing code ...
    result = score_risk(
        context=request.context,
        harm_dimensions=request.harm_dimensions,
        likelihood_inputs=request.likelihood_inputs,
        control_inventory=request.control_inventory,
    )
    # Add eu_screening to result for report passthrough
    if request.eu_screening:
        result["eu_screening"] = request.eu_screening
    return result
"""
