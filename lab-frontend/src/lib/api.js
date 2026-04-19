/**
 * api.js
 * Form key → backend enum mapping + payload builder
 * Covers EU AI Act + NIST AI RMF (7 new fields) combined
 */

const API_BASE = "https://cyberandlegal-backend-373426633543.europe-west4.run.app"

// ── Mapping tables ────────────────────────────────────────────────────────────

const DECISION_MAP = {
  dm_auto:     "fully_automated",
  dm_approval: "human_approval_required",
  dm_informed: "human_informed",
  dm_assist:   "assistance_only",
}

const SOURCE_MAP = {
  src_inhouse:    "built_inhouse",
  src_api:        "third_party_api",
  src_saas:       "saas_product",
  src_opensource: "open_source_deployed",
  src_hybrid:     "combination",
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
  ht_allocational:     "allocational_harm",      // NIST MEASURE 2.11
  ht_representational: "representational_harm",  // NIST MEASURE 2.11
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
  rev_easy:        "immediately_reversible",
  rev_effort:      "reversible_with_effort",
  rev_hard:        "difficult_to_reverse",
  rev_irreversible:"irreversible",
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

const PROVIDER_MAP = {
  prov_openai:      "openai",
  prov_anthropic:   "anthropic",
  prov_google:      "google",
  prov_huggingface: "huggingface",
  prov_custom:      "custom",
}

// ── NEW: NIST-driven mapping tables ──────────────────────────────────────────

// NIST MAP 1.4 — lifecycle stage
const LIFECYCLE_MAP = {
  lc_design:      "design",
  lc_development: "development",
  lc_testing:     "testing",
  lc_deployed:    "deployed",
  lc_scaling:     "scaling",
  lc_retiring:    "retiring",
}

// NIST MAP 1.5 / GOVERN 1.3 — risk tolerance
const RISK_TOLERANCE_MAP = {
  rt_zero:   "zero_tolerance",
  rt_low:    "low",
  rt_medium: "medium",
  rt_high:   "high",
}

// NIST MEASURE 2.4 / MANAGE 2.2 — drift monitoring
// Maps to likelihood_inputs.model_susceptibility
const DRIFT_SUSCEPTIBILITY_MAP = {
  dr_not_monitored: "high",      // no monitoring = high susceptibility
  dr_unknown:       "high",
  dr_occasional:    "medium",
  dr_continuous:    "low",
}

// NIST MEASURE 2.9 — explainability quality
const EXPLAINABILITY_MAP = {
  ex_none:      "no_explanation",
  ex_technical: "technical_explanation",
  ex_summary:   "summary_explanation",
  ex_full:      "full_explanation",
}

// NIST MEASURE 2.7 — adversarial testing
const ADVERSARIAL_MAP = {
  adv_none:        false,
  adv_informal:    false,  // informal doesn't count as performed
  adv_internal:    true,
  adv_independent: true,
}

// NIST GOVERN 1.7 — decommission plan
const DECOMMISSION_MAP = {
  dc_none:       "none",
  dc_informal:   "informal",
  dc_documented: "documented",
}

// ── Sector normalisation ──────────────────────────────────────────────────────

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

// ── Use case normalisation ────────────────────────────────────────────────────

function mapUseCase(uc) {
  const m = {
    uc_credit_scoring:           "credit_scoring",
    uc_fraud_detection:          "fraud_detection",
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

// ── Payload builder ───────────────────────────────────────────────────────────

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

  // NIST MEASURE 2.9 — explainability resolution
  const explainQuality = EXPLAINABILITY_MAP[form.explainability]
    || (form.transparency ? "summary_explanation" : "no_explanation")

  // NIST MEASURE 2.7 — adversarial testing
  const adversarialDone = ADVERSARIAL_MAP[form.adversarial] ?? false

  // NIST MEASURE 2.4 — drift → model susceptibility
  const modelSusceptibility = DRIFT_SUSCEPTIBILITY_MAP[form.drift] || "medium"

  return {
    context: {
      organization:      form.org || "Anonymous",
      sector:            SECTOR_MAP[form.sector] || "general",
      use_case_type:     mapUseCase(form.usecase),
      automation_level:  DECISION_MAP[form.decision_maker] || "human_informed",
      ai_system_source:  SOURCE_MAP[form.source] || "third_party_api",
      transparency_level:form.transparency ? "partially_explainable" : "black_box",
      data_sensitivity:  [],
      training_data_source: [TRAINING_DATA_MAP[form.training_data] || "unknown_third_party"],
      vendor_documentation_available: isExternal
        ? (form.vendor_docs ? "partial_docs" : "no_docs")
        : "not_applicable",
      decision_frequency: {
        people_affected_monthly: PEOPLE_MAP[form.monthly_users] || "under_100",
        decision_criticality:    CRITICALITY_MAP[form.decision_impact] || "moderate",
      },
      // NIST MAP 1.4
      lifecycle_stage: LIFECYCLE_MAP[form.lifecycle] || "deployed",
      // NIST MAP 1.5 / GOVERN 1.3
      risk_tolerance: RISK_TOLERANCE_MAP[form.risk_tolerance] || "medium",
    },

    harm_dimensions: {
      harm_types:           [{ type: harmType, severity: harmSeverity }],
      affected_stakeholders: stakeholders,
      rights_at_risk:       [],
      reversibility:        REVERSIBILITY_MAP[form.reversible] || "reversible_with_effort",
      cascade_effect:       CASCADE_MAP[form.cascade] || "contained",
      detectability:        "detectable_within_days",
      scale_of_impact: {
        geographic_scope:            "local",
        population_potentially_harmed: form.cascade === "cas_systemic"
          ? "entire_population_segment"
          : "small_group",
      },
    },

    likelihood_inputs: {
      threat_exposure:       form.sector_risk === "sr_many" ? "high"
                           : form.sector_risk === "sr_some" ? "medium" : "low",
      past_incidents:        INCIDENT_MAP[form.incidents] || "none_known",
      // NIST MEASURE 2.4 — drift-informed susceptibility
      model_susceptibility:  modelSusceptibility,
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
        // NIST MEASURE 2.9 — direct from new question
        explanation_quality: explainQuality,
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
        bias_testing_performed: form.bias_test ?? false,
        // NIST MEASURE 2.7 — adversarial testing
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
        // NIST GOVERN 1.7 — decommission plan
        decommission_plan: DECOMMISSION_MAP[form.decommission] || "none",
      },
    },

    // EU AI Act screening metadata (passed through for report enrichment)
    eu_screening: {
      role:          form.eu_role || null,
      risk_category: form.eu_risk_category || null,
      obligations:   form.eu_obligations || [],
    },

    evidence_layer: {},
  }
}

// ── API call ──────────────────────────────────────────────────────────────────

export async function runAssessment(form) {
  const payload  = buildPayload(form)
  const backendHasKey = ["openai","anthropic"].includes(form.model_provider)
  const hasUserKey = form.api_key && !backendHasKey
  const endpoint = (hasUserKey || backendHasKey)
    ? `${API_BASE}/assess/risk/full`
    : `${API_BASE}/assess/risk`

  const res = await fetch(endpoint, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }
  return res.json()
}
