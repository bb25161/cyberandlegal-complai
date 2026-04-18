"""
main.py
Cyber&Legal AI Governance Lab — API v2.0

MİMARİ:
    Tek mimari: Risk Engine → Regulatory Mapping → Output

ENDPOINT'LER:
    GET  /                 → Servis bilgisi
    GET  /health           → Health check
    GET  /frameworks       → Framework listesi
    POST /assess/risk      → Beyan bazlı risk assessment
    POST /assess/risk/full → OWASP destekli kanıt bazlı assessment
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import datetime
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scoring.context_engine import run_assessment, run_assessment_with_tests

app = FastAPI(
    title="Cyber&Legal AI Governance API",
    version="2.0.0",
    description="AI Risk Engine — ISO 31000 | NIST AI RMF | EU AI Act Art. 9",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cyberandlegal.com",
        "https://www.cyberandlegal.com",
        "https://lab.cyberandlegal.com",
        "http://localhost:3000"
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"]
)


# --- REQUEST MODELLER ---

class HarmType(BaseModel):
    type: str
    severity: str


class AffectedStakeholder(BaseModel):
    stakeholder_type: str
    is_vulnerable: bool = False


class DecisionFrequency(BaseModel):
    people_affected_monthly: str = "under_100"
    decision_criticality: str = "moderate"


class Context(BaseModel):
    organization: str
    sector: str = "general"
    use_case_type: str = "other"
    automation_level: str = "human_informed"
    ai_system_source: str = "built_inhouse"
    transparency_level: str = "partially_explainable"
    data_sensitivity: List[str] = []
    training_data_source: List[str] = []
    vendor_documentation_available: str = "not_applicable"
    decision_frequency: DecisionFrequency = DecisionFrequency()


class HarmDimensions(BaseModel):
    harm_types: List[HarmType] = []
    affected_stakeholders: List[AffectedStakeholder] = []
    rights_at_risk: List[str] = []
    reversibility: str = "reversible_with_effort"
    cascade_effect: str = "contained"
    detectability: str = "detectable_within_days"


class LikelihoodInputs(BaseModel):
    threat_exposure: str = "medium"
    past_incidents: str = "none_known"
    model_susceptibility: str = "medium"
    deployment_environment_risk: str = "internal_only"


class HumanOversight(BaseModel):
    oversight_quality: str = "partial_review"
    can_override_ai: bool = True
    can_stop_system: bool = True
    automation_bias_training: bool = False


class Explainability(BaseModel):
    decisions_explainable_to_users: bool = False
    explanation_quality: str = "no_explanation"


class MonitoringLogging(BaseModel):
    logging_active: bool = False
    monitoring_frequency: str = "none"
    audit_trail_available: bool = False


class OptOut(BaseModel):
    user_can_request_human_review: bool = False
    human_escalation_path_exists: bool = False
    vulnerable_user_detection: bool = False


class TestingValidation(BaseModel):
    bias_testing_performed: bool = False
    adversarial_testing_performed: bool = False
    testing_frequency: str = "never"
    test_coverage: str = "none"


class SupplyChain(BaseModel):
    vendor_risk_assessed: bool = False
    model_card_available: bool = False
    bias_test_results_from_vendor: bool = False
    contractual_audit_rights: bool = False


class IncidentResponse(BaseModel):
    incident_response_plan_exists: bool = False
    complaint_mechanism_available: bool = False
    fallback_procedure_defined: bool = False


class ControlInventory(BaseModel):
    human_oversight: HumanOversight = HumanOversight()
    explainability: Explainability = Explainability()
    monitoring_logging: MonitoringLogging = MonitoringLogging()
    opt_out_and_escalation: OptOut = OptOut()
    testing_and_validation: TestingValidation = TestingValidation()
    supply_chain_controls: SupplyChain = SupplyChain()
    incident_response: IncidentResponse = IncidentResponse()


class EvidenceLayer(BaseModel):
    compl_ai_bias_score: Optional[float] = None
    owasp_composite_score: Optional[float] = None
    lm_eval_score: Optional[float] = None
    promptfoo_red_team_score: Optional[float] = None


class RiskAssessmentRequest(BaseModel):
    assessment_id: Optional[str] = None
    context: Context
    harm_dimensions: HarmDimensions = HarmDimensions()
    likelihood_inputs: LikelihoodInputs = LikelihoodInputs()
    control_inventory: ControlInventory = ControlInventory()
    evidence_layer: EvidenceLayer = EvidenceLayer()


# --- ENDPOINT'LER ---

@app.get("/")
def root():
    return {
        "service": "Cyber&Legal AI Governance Lab",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "architecture": "Risk Engine v2 — ISO 31000 | NIST AI RMF | EU AI Act Art. 9",
        "methodology": "Inherent Risk = Harm x Likelihood | Residual Risk = Inherent x Control Gap",
        "endpoints": {
            "risk_assessment": "POST /assess/risk",
            "full_assessment": "POST /assess/risk/full",
            "frameworks": "GET /frameworks",
            "docs": "GET /docs"
        },
        "deprecated": {
            "GET /assess/questions": "410 Gone — replaced by POST /assess/risk",
            "POST /assess/governance": "410 Gone — replaced by POST /assess/risk",
            "POST /assess/model": "410 Gone — replaced by POST /assess/risk",
            "POST /score/unified": "410 Gone — replaced by POST /assess/risk"
        }
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
    }


@app.get("/frameworks")
def list_frameworks():
    return {
        "methodology": "Frameworks interpret risk scores — they do not produce them",
        "frameworks": [
            {
                "id": "eu_ai_act",
                "name": "EU AI Act 2024",
                "role": "Regulatory mapping — identifies triggered obligations",
                "enforcement": "2026-08-02",
                "penalty": "Up to 7% global annual turnover"
            },
            {
                "id": "nist_ai_rmf",
                "name": "NIST AI RMF 1.0",
                "role": "Risk methodology foundation — Govern, Map, Measure, Manage",
                "type": "voluntary"
            },
            {
                "id": "owasp_llm",
                "name": "OWASP LLM Top 10 2025",
                "role": "Technical security mapping",
                "type": "technical_standard"
            },
            {
                "id": "enisa",
                "name": "ENISA Threat Landscape 2024-25",
                "role": "Feeds threat_prevalence_score in likelihood engine",
                "update": "Annual — October"
            },
            {
                "id": "iso_42001",
                "name": "ISO/IEC 42001:2023",
                "role": "Certification readiness mapping",
                "type": "certifiable"
            }
        ]
    }


@app.post("/assess/risk")
def assess_risk(request: RiskAssessmentRequest):
    """
    Tam AI risk assessment.

    Risk Engine:
        Inherent Risk = Harm Score × Likelihood Score
        Control Gap   = max(0.2, 1 - Control Effectiveness)
        Residual Risk = Inherent Risk × Control Gap

    Çıktı:
        - Inherent ve Residual Risk skoru
        - Triggered regulatory rules (EU AI Act, NIST, OWASP, ENISA, ISO)
        - Mandatory actions listesi
        - Deployment recommendation
        - Full audit trail
    """
    try:
        assessment_id = request.assessment_id or (
            f"CL-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')}"
        )

        intake = {
            "assessment_id": assessment_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
            "schema_version": "1.0",
            "context": request.context.model_dump(),
            "harm_dimensions": request.harm_dimensions.model_dump(),
            "likelihood_inputs": request.likelihood_inputs.model_dump(),
            "control_inventory": request.control_inventory.model_dump(),
            "evidence_layer": request.evidence_layer.model_dump(),
        }

        result = run_assessment(intake)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/assess/risk/full")
def assess_risk_full(request: RiskAssessmentRequest):
    """
    Tam AI risk assessment — beyan + kanıt bazlı.

    FARK:
        POST /assess/risk      → Sadece müşteri beyanı kullanır
        POST /assess/risk/full → Önce OWASP testi çalıştırır, sonra kanıt bazlı assessment üretir
    """
    try:
        assessment_id = request.assessment_id or (
            f"CL-{datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%d%H%M%S')}-FULL"
        )

        intake = {
            "assessment_id": assessment_id,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
            "schema_version": "1.0",
            "context": request.context.model_dump(),
            "harm_dimensions": request.harm_dimensions.model_dump(),
            "likelihood_inputs": request.likelihood_inputs.model_dump(),
            "control_inventory": request.control_inventory.model_dump(),
            "evidence_layer": request.evidence_layer.model_dump(),
        }

        result = run_assessment_with_tests(intake, run_owasp=True)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- ESKİ ENDPOINT'LER — 410 GONE ---

@app.get("/assess/questions")
def deprecated_questions():
    raise HTTPException(
        status_code=410,
        detail={
            "error": "Gone",
            "message": "This endpoint has been replaced by the new Risk Engine architecture.",
            "use_instead": "POST /assess/risk",
            "docs": "/docs"
        }
    )


@app.post("/assess/governance")
def deprecated_governance():
    raise HTTPException(
        status_code=410,
        detail={
            "error": "Gone",
            "message": "This endpoint has been replaced by the new Risk Engine architecture.",
            "use_instead": "POST /assess/risk",
            "docs": "/docs"
        }
    )


@app.post("/assess/intake")
def deprecated_intake():
    raise HTTPException(
        status_code=410,
        detail={
            "error": "Gone",
            "message": "This endpoint has been replaced by the new Risk Engine architecture.",
            "use_instead": "POST /assess/risk",
            "docs": "/docs"
        }
    )


@app.post("/assess/model")
def deprecated_model():
    raise HTTPException(
        status_code=410,
        detail={
            "error": "Gone",
            "message": "This endpoint has been replaced by the new Risk Engine architecture.",
            "use_instead": "POST /assess/risk",
            "docs": "/docs"
        }
    )


@app.post("/score/unified")
def deprecated_unified():
    raise HTTPException(
        status_code=410,
        detail={
            "error": "Gone",
            "message": "This endpoint has been replaced by the new Risk Engine architecture.",
            "use_instead": "POST /assess/risk",
            "docs": "/docs"
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)