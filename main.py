"""
main.py
Cyber&Legal AI Governance Lab -- API v2.1

MIMARI:
    Tek karar akışı:
    Intake -> Risk Engine -> Decision Engine -> Regulatory Mapping -> Output

ENDPOINTLER:
    GET  /                 -> Servis bilgisi
    GET  /health           -> Health check
    GET  /frameworks       -> Framework listesi
    POST /assess/risk      -> Beyan bazlı risk assessment
    POST /assess/risk/full -> Evidence destekli tam assessment
"""

from enum import Enum
from typing import List, Optional

import datetime
import os
import sys

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scoring.context_engine import run_assessment, run_assessment_with_tests


# =============================================================================
# ENUMS -- kontrollu veri girisi
# =============================================================================

class SectorEnum(str, Enum):
    general = "general"
    finance = "finance"
    healthcare = "healthcare"
    legal = "legal"
    public = "public"
    hr_recruitment = "hr_recruitment"
    energy = "energy"
    education = "education"


class UseCaseTypeEnum(str, Enum):
    other = "other"
    credit_scoring = "credit_scoring"
    insurance_risk_scoring = "insurance_risk_scoring"
    social_benefits_scoring = "social_benefits_scoring"
    hr_screening = "hr_screening"
    performance_management = "performance_management"
    medical_diagnosis = "medical_diagnosis"
    medical_device = "medical_device"
    biometric_identification = "biometric_identification"
    law_enforcement = "law_enforcement"
    migration_border_control = "migration_border_control"
    legal_interpretation = "legal_interpretation"
    critical_infrastructure_management = "critical_infrastructure_management"
    education_assessment = "education_assessment"
    decision_making_about_individuals = "decision_making_about_individuals"
    monitoring_surveillance = "monitoring_surveillance"


class AutomationLevelEnum(str, Enum):
    human_informed = "human_informed"
    human_in_the_loop = "human_in_the_loop"
    fully_automated = "fully_automated"


class AISystemSourceEnum(str, Enum):
    built_inhouse = "built_inhouse"
    third_party_api = "third_party_api"
    saas_product = "saas_product"
    open_source_model = "open_source_model"


class TransparencyLevelEnum(str, Enum):
    explainable = "explainable"
    partially_explainable = "partially_explainable"
    black_box = "black_box"


class VendorDocumentationEnum(str, Enum):
    full_docs = "full_docs"
    partial_docs = "partial_docs"
    not_available = "not_available"
    not_applicable = "not_applicable"


class PeopleAffectedEnum(str, Enum):
    under_100 = "under_100"
    from_100_to_1000 = "100_to_1000"
    from_1000_to_100000 = "1000_to_100000"
    over_100000 = "over_100000"


class DecisionCriticalityEnum(str, Enum):
    low = "low"
    moderate = "moderate"
    significant = "significant"
    life_changing = "life_changing"


class SeverityEnum(str, Enum):
    minor = "minor"
    moderate = "moderate"
    significant = "significant"
    critical = "critical"
    catastrophic = "catastrophic"


class ReversibilityEnum(str, Enum):
    immediately_reversible = "immediately_reversible"
    reversible_with_effort = "reversible_with_effort"
    difficult_to_reverse = "difficult_to_reverse"
    irreversible = "irreversible"


class CascadeEffectEnum(str, Enum):
    contained = "contained"
    triggers_further_automated_decisions = "triggers_further_automated_decisions"
    affects_many_before_detected = "affects_many_before_detected"
    systemic = "systemic"


class DetectabilityEnum(str, Enum):
    immediately_visible = "immediately_visible"
    detectable_within_days = "detectable_within_days"
    detectable_within_months = "detectable_within_months"
    may_never_be_detected = "may_never_be_detected"


class ThreatExposureEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    very_high = "very_high"


class PastIncidentsEnum(str, Enum):
    none_known = "none_known"
    near_misses_only = "near_misses_only"
    one_known_incident = "one_known_incident"
    multiple_known_incidents = "multiple_known_incidents"


class ModelSusceptibilityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    unknown = "unknown"


class DeploymentRiskEnum(str, Enum):
    sandboxed = "sandboxed"
    internal_only = "internal_only"
    public_facing_low_volume = "public_facing_low_volume"
    public_facing_high_volume = "public_facing_high_volume"


class OversightQualityEnum(str, Enum):
    none = "none"
    rubber_stamp = "rubber_stamp"
    partial_review = "partial_review"
    full_meaningful_review = "full_meaningful_review"


class ExplanationQualityEnum(str, Enum):
    no_explanation = "no_explanation"
    summary_explanation = "summary_explanation"
    full_xai = "full_xai"
    not_applicable = "not_applicable"


class MonitoringFrequencyEnum(str, Enum):
    none = "none"
    periodic = "periodic"
    daily = "daily"
    real_time = "real_time"


class TestingFrequencyEnum(str, Enum):
    never = "never"
    annual = "annual"
    periodic = "periodic"
    per_release = "per_release"
    continuous = "continuous"


class TestCoverageEnum(str, Enum):
    none = "none"
    basic = "basic"
    partial = "partial"
    comprehensive = "comprehensive"


# =============================================================================
# Pydantic request modelleri
# =============================================================================

class HarmType(BaseModel):
    type: str = Field(..., description="Harm category")
    severity: SeverityEnum


class AffectedStakeholder(BaseModel):
    stakeholder_type: str
    is_vulnerable: bool = False


class DecisionFrequency(BaseModel):
    people_affected_monthly: PeopleAffectedEnum = PeopleAffectedEnum.under_100
    decision_criticality: DecisionCriticalityEnum = DecisionCriticalityEnum.moderate


class Context(BaseModel):
    organization: str
    sector: SectorEnum = SectorEnum.general
    use_case_type: UseCaseTypeEnum = UseCaseTypeEnum.other
    automation_level: AutomationLevelEnum = AutomationLevelEnum.human_informed
    ai_system_source: AISystemSourceEnum = AISystemSourceEnum.built_inhouse
    transparency_level: TransparencyLevelEnum = TransparencyLevelEnum.partially_explainable
    data_sensitivity: List[str] = []
    training_data_source: List[str] = []
    vendor_documentation_available: VendorDocumentationEnum = VendorDocumentationEnum.not_applicable
    decision_frequency: DecisionFrequency = DecisionFrequency()


class HarmDimensions(BaseModel):
    harm_types: List[HarmType] = []
    affected_stakeholders: List[AffectedStakeholder] = []
    rights_at_risk: List[str] = []
    reversibility: ReversibilityEnum = ReversibilityEnum.reversible_with_effort
    cascade_effect: CascadeEffectEnum = CascadeEffectEnum.contained
    detectability: DetectabilityEnum = DetectabilityEnum.detectable_within_days


class LikelihoodInputs(BaseModel):
    threat_exposure: ThreatExposureEnum = ThreatExposureEnum.medium
    past_incidents: PastIncidentsEnum = PastIncidentsEnum.none_known
    model_susceptibility: ModelSusceptibilityEnum = ModelSusceptibilityEnum.medium
    deployment_environment_risk: DeploymentRiskEnum = DeploymentRiskEnum.internal_only


class HumanOversight(BaseModel):
    oversight_quality: OversightQualityEnum = OversightQualityEnum.partial_review
    can_override_ai: bool = True
    can_stop_system: bool = True
    automation_bias_training: bool = False


class Explainability(BaseModel):
    decisions_explainable_to_users: bool = False
    explanation_quality: ExplanationQualityEnum = ExplanationQualityEnum.no_explanation


class MonitoringLogging(BaseModel):
    logging_active: bool = False
    monitoring_frequency: MonitoringFrequencyEnum = MonitoringFrequencyEnum.none
    audit_trail_available: bool = False


class OptOut(BaseModel):
    user_can_request_human_review: bool = False
    human_escalation_path_exists: bool = False
    vulnerable_user_detection: bool = False


class TestingValidation(BaseModel):
    bias_testing_performed: bool = False
    adversarial_testing_performed: bool = False
    testing_frequency: TestingFrequencyEnum = TestingFrequencyEnum.never
    test_coverage: TestCoverageEnum = TestCoverageEnum.none


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


# =============================================================================
# FastAPI
# =============================================================================

app = FastAPI(
    title="Cyber&Legal AI Governance API",
    version="2.1.0",
    description="AI Risk Engine - ISO 31000 | NIST AI RMF | EU AI Act Art. 9",
    docs_url="/docs"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://cyberandlegal.com",
        "https://www.cyberandlegal.com",
        "https://lab.cyberandlegal.com",
        "http://localhost:3000",
        "https://cyberandlegal-lab.web.app"
    ],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "service": "Cyber&Legal AI Governance Lab",
        "version": "2.1.0",
        "status": "operational",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "architecture": "Risk Engine v2 - ISO 31000 | NIST AI RMF | EU AI Act Art. 9",
        "methodology": "Inherent Risk = Harm x Likelihood | Residual Risk = Inherent x Control Gap",
        "endpoints": {
            "risk_assessment": "POST /assess/risk",
            "full_assessment": "POST /assess/risk/full",
            "frameworks": "GET /frameworks",
            "docs": "GET /docs"
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
        "methodology": "Frameworks interpret risk scores - they do not produce them",
        "frameworks": [
            {
                "id": "eu_ai_act",
                "name": "EU AI Act 2024",
                "role": "Regulatory mapping - identifies triggered obligations",
                "enforcement": "2026-08-02",
                "penalty": "Up to 7% global annual turnover"
            },
            {
                "id": "nist_ai_rmf",
                "name": "NIST AI RMF 1.0",
                "role": "Risk methodology foundation - Govern, Map, Measure, Manage",
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
                "update": "Annual - October"
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
    Sadece kullanıcı beyanı ile risk assessment çalıştırır.
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
    Evidence destekli tam assessment.
    Varsayılan olarak:
    - OWASP aktif
    - Promptfoo aktif
    - COMPL-AI kapalı
    - LM Eval kapalı
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

        result = run_assessment_with_tests(
            intake,
            run_owasp=True,
            run_promptfoo=True,
            run_compl_ai=False,
            run_lm_eval=False,
        )
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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