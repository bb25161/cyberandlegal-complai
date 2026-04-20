/**
 * api.js
 * Form key → backend enum mapping + payload builder
 *
 * FIX LOG (2026-04-20) — 9 enum uyuşmazlığı giderildi:
 *   1. DECISION_MAP      "human_approval_required" → "human_in_the_loop"
 *                        "assistance_only"          → "human_informed"
 *   2. SOURCE_MAP        "open_source_deployed"    → "open_source_model"
 *                        "combination"              → "third_party_api"
 *   3. VENDOR_DOCS       "no_docs"                 → "not_available"
 *   4. LIFECYCLE_MAP     "design"    → "development"
 *                        "scaling"   → "deployed"
 *                        "retiring"  → "decommissioning"
 *   5. RISK_TOLERANCE    "zero_tolerance" → "very_low"
 *   6. EXPLAINABILITY    "technical_explanation" → "summary_explanation"
 *                        "full_explanation"      → "full_xai"
 *   7. scale_of_impact   kaldırıldı (HarmDimensions'da tanımsız → 422)
 *   8. decommission_plan kaldırıldı (IncidentResponse'da tanımsız → 422)
 *   9. eu_screening      kaldırıldı (RiskAssessmentRequest'ta tanımsız → 422)
 */

const API_BASE = "https://cyberandlegal-backend-373426633543.europe-west4.run.app"

const DECISION_MAP = {
  dm_auto:     "fully_automated",
  dm_approval: "human_in_the_loop",  // FIX
  dm_informed: "human_informed",
  dm_assist:   "human_informed",     // FIX
}

const SOURCE_MAP = {
  src_inhouse:    "built_inhouse",
  src_api:        "third_party_api",
  src_saas:       "saas_product",
  src_opensource: "open_source_model",  // FIX
  src_hybrid:     "third_party_api",    // FIX
}

const PEOPLE_MAP = {
  mu_under100: "under_100",
  mu_100_1k:   "100_to_1000",
  mu_1k_100k:  "1000_to_100000",
  mu_over100k: "over_100000",
}

const CRITICALITY_MAP = {
  di_low:           "low",
  di_moderate:      "moderate",
  di_significant:   "significant",
  di_life_changing: "life_changing",
}

const HARM_TYPE_MAP = {
  ht_financial:        "financial_loss",
  ht_discrimination:   "discrimination",
  ht_allocational:     "allocational_harm",
  ht_representational: "representational_harm",
  ht_privacy:          "privacy_violation",
  ht_physical:         "physical_safety",
  ht_reputation:       "reputational_damage",
  ht_psychological:    "psychological_harm",
  ht_rights:           "legal_rights_violation",
}

const SEVERITY_MAP = {
  sev_negligible:  "minor",
  sev_minor:       "minor",
  sev_moderate:    "moderate",
  sev_significant: "significant",
  sev_critical:    "critical",
}

const REVERSIBILITY_MAP = {
  rev_easy:         "immediately_reversible",
  rev_effort:       "reversible_with_effort",
  rev_hard:         "difficult_to_reverse",
  rev_irreversible: "irreversible",
}

const CASCADE_MAP = {
  cas_single:   "contained",
  cas_small:    "contained",
  cas_many:     "affects_many_before_detected",
  cas_systemic: "systemic",
}

const INCIDENT_MAP = {
  inc_none:     "none_known",
  inc_near:     "near_misses_only",
  inc_once:     "one_known_incident",
  inc_multiple: "multiple_known_incidents",
}

const DEPLOYMENT_MAP = {
  dep_sandbox:  "sandboxed",
  dep_internal: "internal_only",
  dep_limited:  "public_facing_low_volume",
  dep_public:   "public_facing_high_volume",
}

const OVERSIGHT_MAP = {
  ov_none:    "none",
  ov_rubber:  "rubber_stamp",
  ov_partial: "partial_review",
  ov_full:    "full_meaningful_review",
}

const TRAINING_DATA_MAP = {
  td_own:       "own_historical_data",
  td_public:    "public_datasets",
  td_third:     "third_party_commercial",
  td_scraped:   "internet_scraped",
  td_synthetic: "synthetic_data",
  td_unknown:   "unknown_third_party",
  td_na:        "not_applicable",
}

// NIST MAP 1.4 — lifecycle
const LIFECYCLE_MAP = {
  lc_design:      "development",      // FIX
  lc_development: "development",
  lc_testing:     "testing",
  lc_deployed:    "deployed",
  lc_scaling:     "deployed",         // FIX
  lc_retiring:    "decommissioning",  // FIX
}

// NIST MAP 1.5 — risk tolerance
const RISK_TOLERANCE_MAP = {
  rt_zero:   "very_low",  // FIX
  rt_low:    "low",
  rt_medium: "medium",
  rt_high:   "high",
}

// NIST MEASURE 2.4 — drift → model_susceptibility
const DRIFT_SUSCEPTIBILITY_MAP = {
  dr_not_monitored: "high",
  dr_unknown:       "high",
  dr_occasional:    "medium",
  dr_continuous:    "low",
}

// NIST MEASURE 2.9 — explainability
const EXPLAINABILITY_MAP = {
  ex_none:      "no_explanation",
  ex_technical: "summary_explanation",  // FIX
  ex_summary:   "summary_explanation",
  ex_full:      "full_xai",             // FIX
}

// NIST MEASURE 2.7 — adversarial testing
const ADVERSARIAL_MAP = {
  adv_none:        false,
  adv_informal:    false,
  adv_internal:    true,
  adv_independent: true,
}

const SECTOR_MAP = {
  sector_finance:    "finance",
  sector_healthcare: "healthcare",
  sector_legal:      "legal",
  sector_public:     "public",
  sector_hr:         "hr_recruitment",
  sector_education:  "education",
  sector_energy:     "energy",
  sector_general:    "general",
}

function mapUseCase(uc) {
  const m = {
    uc_credit_scoring:           "credit_scoring",
    uc_fraud_detection:          "credit_scoring",
    uc_insurance_risk:           "credit_scoring",
    uc_medical_diagnosis:        "medical_diagnosis",
    uc_treatment_recommendation: "medical_diagnosis",
    uc_medical_device:           "medical_device",
    uc_legal_research:           "legal_interpretation",
    uc_contract_review:          "legal_interpretation",
    uc_legal_interpretation:     "legal_interpretation",
    uc_benefits_scoring:         "social_benefits_scoring",
    uc_border_control:           "migration_border_control",
    uc_law_enforcement:          "law_enforcement",
    uc_hr_screening:             "hr_screening",
    uc_performance:              "performance_management",
    uc_education_assessment:     "education_assessment",
    uc_monitoring:               "monitoring_surveillance",
    uc_content_generation:       "other",
    uc_recommendation:           "other",
    uc_chatbot:                  "other",
    uc_process_automation:       "other",
    uc_other:                    "other",
  }
  return m[uc] || "other"
}

export function buildPayload(form) {
  const isExternal = ["src_api", "src_saas"].includes(form.source)

  const harmType     = HARM_TYPE_MAP[form.harm_type] || "financial_loss"
  const harmSeverity = SEVERITY_MAP[form.harm_severity] || "moderate"

  const stakeholders = [
    { stakeholder_type: "general_adult_users", is_vulnerable: false }
  ]
  if (form.vulnerable) {
    stakeholders.push({ stakeholder_type: "financially_vulnerable", is_vulnerable: true })
  }

  const explainQuality = EXPLAINABILITY_MAP[form.explainability]
    || (form.transparency ? "summary_explanation" : "no_explanation")

  const adversarialDone    = ADVERSARIAL_MAP[form.adversarial] ?? false
  const modelSusceptibility = DRIFT_SUSCEPTIBILITY_MAP[form.drift] || "medium"

  // FIX: "no_docs" → "not_available"
  const vendorDocsValue = isExternal
    ? (form.vendor_docs ? "partial_docs" : "not_available")
    : "not_applicable"

  return {
    context: {
      organization:      form.org || "Anonymous",
      sector:            SECTOR_MAP[form.sector] || "general",
      use_case_type:     mapUseCase(form.usecase),
      automation_level:  DECISION_MAP[form.decision_maker] || "human_informed",
      ai_system_source:  SOURCE_MAP[form.source] || "third_party_api",
      transparency_level: form.transparency ? "partially_explainable" : "black_box",
      data_sensitivity:  [],
      training_data_source: [TRAINING_DATA_MAP[form.training_data] || "unknown_third_party"],
      vendor_documentation_available: vendorDocsValue,
      decision_frequency: {
        people_affected_monthly: PEOPLE_MAP[form.monthly_users] || "under_100",
        decision_criticality:    CRITICALITY_MAP[form.decision_impact] || "moderate",
      },
      lifecycle_stage: LIFECYCLE_MAP[form.lifecycle] || "deployed",
      risk_tolerance:  RISK_TOLERANCE_MAP[form.risk_tolerance] || "medium",
    },

    harm_dimensions: {
      harm_types:            [{ type: harmType, severity: harmSeverity }],
      affected_stakeholders: stakeholders,
      rights_at_risk:        [],
      reversibility:         REVERSIBILITY_MAP[form.reversible] || "reversible_with_effort",
      cascade_effect:        CASCADE_MAP[form.cascade] || "contained",
      detectability:         "detectable_within_days",
      // FIX: scale_of_impact kaldırıldı — 422 sebebiydi
    },

    likelihood_inputs: {
      threat_exposure: form.sector_risk === "sr_many" ? "high"
                     : form.sector_risk === "sr_some" ? "medium" : "low",
      past_incidents:              INCIDENT_MAP[form.incidents] || "none_known",
      model_susceptibility:        modelSusceptibility,
      deployment_environment_risk: DEPLOYMENT_MAP[form.deployment] || "internal_only",
    },

    control_inventory: {
      human_oversight: {
        oversight_quality:        OVERSIGHT_MAP[form.oversight] || "partial_review",
        can_override_ai:          form.override ?? true,
        can_stop_system:          true,
        automation_bias_training: form.bias_training ?? false,
      },
      explainability: {
        decisions_explainable_to_users: form.transparency ?? false,
        explanation_quality:            explainQuality,
      },
      monitoring_logging: {
        logging_active:        form.logging ?? false,
        monitoring_frequency:  form.logging ? "periodic" : "none",
        audit_trail_available: form.logging ?? false,
      },
      opt_out_and_escalation: {
        user_can_request_human_review: form.appeal ?? false,
        human_escalation_path_exists:  form.appeal ?? false,
        vulnerable_user_detection:     form.vulnerable ?? false,
      },
      testing_and_validation: {
        bias_testing_performed:        form.bias_test ?? false,
        adversarial_testing_performed: adversarialDone,
        testing_frequency: form.bias_test ? "annual" : "never",
        test_coverage:     form.bias_test ? "partial" : "none",
      },
      supply_chain_controls: {
        vendor_risk_assessed:          isExternal ? (form.vendor_docs ?? false) : false,
        model_card_available:          isExternal ? (form.vendor_docs ?? false) : false,
        bias_test_results_from_vendor: false,
        contractual_audit_rights:      false,
      },
      incident_response: {
        incident_response_plan_exists: form.ir_plan ?? false,
        complaint_mechanism_available: form.appeal ?? false,
        fallback_procedure_defined:    form.ir_plan ?? false,
        // FIX: decommission_plan kaldırıldı — 422 sebebiydi
      },
    },

    evidence_layer: {},
    // FIX: eu_screening kaldırıldı — 422 sebebiydi
    // EU screening sonuçları form state ile ReportPage'e taşınıyor
  }
}

export async function runAssessment(form) {
  const payload       = buildPayload(form)
  const backendHasKey = ["openai", "anthropic"].includes(form.model_provider)
  const hasUserKey    = form.api_key && !backendHasKey
  const endpoint      = (hasUserKey || backendHasKey)
    ? `${API_BASE}/assess/risk/full`
    : `${API_BASE}/assess/risk`

  const controller = new AbortController()
  const timeoutId  = setTimeout(() => controller.abort(), 270000)

  const res = await fetch(endpoint, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
    signal:  controller.signal,
  })
  clearTimeout(timeoutId)

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  return res.json()
}