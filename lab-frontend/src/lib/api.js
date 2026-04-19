const API_BASE = "https://cyberandlegal-backend-373426633543.europe-west4.run.app"

export async function runAssessment(formData) {
  const payload = {
    context: {
      organization:       formData.organization || "Anonim",
      sector:             formData.sector || "general",
      use_case_type:      formData.use_case_type || "other",
      automation_level:   formData.automation_level || "human_informed",
      ai_system_source:   formData.ai_system_source || "third_party_api",
      transparency_level: formData.transparency_level || "partially_explainable",
      data_sensitivity:   formData.data_sensitivity || [],
      training_data_source: ["not_applicable"],
      vendor_documentation_available: "not_applicable",
      decision_frequency: {
        people_affected_monthly: formData.people_affected || "under_100",
        decision_criticality:    formData.decision_criticality || "moderate",
      },
    },
    harm_dimensions: {
      harm_types: formData.harm_types || [{ type: "financial_loss", severity: "moderate" }],
      affected_stakeholders: formData.affected_stakeholders || [
        { stakeholder_type: "general_adult_users", is_vulnerable: false }
      ],
      rights_at_risk:  formData.rights_at_risk || [],
      reversibility:   formData.reversibility || "reversible_with_effort",
      cascade_effect:  formData.cascade_effect || "contained",
      detectability:   "detectable_within_days",
      scale_of_impact: {
        geographic_scope:              formData.geographic_scope || "local",
        population_potentially_harmed: formData.population_harmed || "small_group",
      },
    },
    likelihood_inputs: {
      threat_exposure:             formData.threat_exposure || "medium",
      past_incidents:              formData.past_incidents || "none_known",
      model_susceptibility:        formData.susceptibility || "medium",
      deployment_environment_risk: formData.deployment_risk || "internal_only",
    },
    control_inventory: {
      human_oversight: {
        oversight_quality:        formData.oversight_quality || "partial_review",
        can_override_ai:          formData.can_override ?? true,
        can_stop_system:          true,
        automation_bias_training: false,
      },
      explainability: {
        decisions_explainable_to_users: formData.explainable ?? false,
        explanation_quality:            "summary_explanation",
      },
      monitoring_logging: {
        logging_active:        true,
        monitoring_frequency:  "periodic",
        audit_trail_available: false,
      },
      opt_out_and_escalation: {
        user_can_request_human_review: false,
        human_escalation_path_exists:  false,
        vulnerable_user_detection:     false,
      },
      testing_and_validation: {
        bias_testing_performed:        formData.bias_testing ?? false,
        adversarial_testing_performed: false,
        testing_frequency:             "never",
        test_coverage:                 "none",
      },
      supply_chain_controls: {
        vendor_risk_assessed:          false,
        model_card_available:          false,
        bias_test_results_from_vendor: false,
        contractual_audit_rights:      false,
      },
      incident_response: {
        incident_response_plan_exists: false,
        complaint_mechanism_available: false,
        fallback_procedure_defined:    false,
      },
    },
    evidence_layer: {},
  }

  const res = await fetch(`${API_BASE}/assess/risk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(`API hatası: ${res.status}`)
  return res.json()
}
