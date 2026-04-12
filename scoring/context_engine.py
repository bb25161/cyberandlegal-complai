"""
scoring/context_engine.py
Cyber&Legal AI Governance Lab — Orkestrasyon Motoru

NE YAPAR:
    Tüm sistemi birbirine bağlar.
    Intake → Evidence → Risk Engine → Regulatory Mapping → Output

AKIŞ:
    1. Intake verisini al ve doğrula
    2. Evidence layer'ı topla (COMPL-AI, OWASP, LM Eval, Promptfoo)
    3. Risk Engine'i çalıştır (Harm × Likelihood × Control Gap)
    4. Regulatory Mapping'i uygula
    5. Final rapor üret

METODOLOJİ:
    ISO 31000 risk yönetimi
    Regülasyon risk üretmez — riski yorumlar
    Evidence layer aylık güncellenir — formül sabittir

SABIT KALAN: risk formülü, schema versiyonu
GÜNCELLENEBİLEN: evidence katmanı, regulatory_mapping.json
"""

import json
import os
import datetime
from typing import Optional

import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from scoring.scoring import calculate_risk


def load_regulatory_mapping() -> dict:
    """regulatory_mapping.json dosyasını yükle."""
    mapping_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "regulatory_mapping.json"
    )
    try:
        with open(mapping_path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}


def apply_regulatory_mapping(risk_result: dict, intake: dict, mapping: dict) -> dict:
    """
    Risk profilini regulatory mapping kurallarıyla eşleştir.

    Risk skoru önce hesaplanır — mapping sadece yorumlar.
    Hangi maddeler tetikleniyor, hangi yükümlülükler var.
    """

    context = intake.get("context", {})
    harm_dims = intake.get("harm_dimensions", {})
    ctrl = intake.get("control_inventory", {})

    sector = context.get("sector", "general")
    use_case = context.get("use_case_type", "")
    automation = context.get("automation_level", "")
    ai_source = context.get("ai_system_source", "")
    data_sensitivity = context.get("data_sensitivity", [])
    transparency = context.get("transparency_level", "")
    residual_level = risk_result.get("residual_risk", {}).get("level", "LOW")
    inherent_level = risk_result.get("inherent_risk", {}).get("level", "LOW")

    stakeholders = harm_dims.get("affected_stakeholders", [])
    harm_types = [h.get("type") for h in harm_dims.get("harm_types", [])]
    rights = harm_dims.get("rights_at_risk", [])

    has_vulnerable = any(s.get("is_vulnerable", False) for s in stakeholders)
    has_children = any(s.get("stakeholder_type") == "children_under_18" for s in stakeholders)

    oversight = ctrl.get("human_oversight", {})
    explainability = ctrl.get("explainability", {})
    supply_chain = ctrl.get("supply_chain_controls", {})

    triggered_rules = []

    # --- EU AI ACT ---
    high_risk_sectors = ["finance", "healthcare", "legal", "public", "hr_recruitment"]
    high_risk_use_cases = ["credit_scoring", "medical_diagnosis", "hr_screening",
                           "decision_making_about_individuals"]

    if sector in high_risk_sectors or use_case in high_risk_use_cases or residual_level in ["HIGH", "CRITICAL"]:
        triggered_rules.append({
            "rule_id": "EUAIA-001",
            "framework": "EU AI Act",
            "classification": "HIGH-RISK — Annex III",
            "trigger_reason": f"Sector: {sector}, Use case: {use_case}, Risk: {residual_level}",
            "key_obligations": [
                "Art. 9 — Risk management system required",
                "Art. 10 — Data governance and bias testing",
                "Art. 13 — Transparency and instructions for use",
                "Art. 14 — Human oversight mechanisms",
                "Art. 49 — EU database registration"
            ],
            "deadline": "2026-08-02",
            "penalty": "Up to 3% global annual turnover"
        })

    if has_vulnerable or has_children:
        triggered_rules.append({
            "rule_id": "EUAIA-002",
            "framework": "EU AI Act",
            "classification": "FRIA Required",
            "trigger_reason": f"Vulnerable group affected: children={has_children}",
            "key_obligations": [
                "Art. 27 — Fundamental Rights Impact Assessment mandatory",
                "Art. 14 — Enhanced human oversight for vulnerable groups"
            ],
            "deadline": "2026-08-02"
        })

    if not explainability.get("decisions_explainable_to_users", True) and automation == "fully_automated":
        triggered_rules.append({
            "rule_id": "EUAIA-003",
            "framework": "EU AI Act",
            "trigger_reason": "Black-box + fully automated",
            "key_obligations": [
                "Art. 13 — Right to explanation must be implemented",
                "Art. 14 — Human must be able to interpret AI outputs"
            ],
            "severity": "HIGH"
        })

    if ai_source in ["third_party_api", "saas_product"] or not supply_chain.get("vendor_risk_assessed", True):
        triggered_rules.append({
            "rule_id": "EUAIA-004",
            "framework": "EU AI Act",
            "trigger_reason": f"Third-party AI source: {ai_source}",
            "key_obligations": [
                "Art. 25 — Deployer responsibility for third-party AI",
                "Art. 13 — Obtain technical documentation from provider"
            ],
            "note": "BaFin Dec 2025: outsourced AI still deployer's responsibility under DORA"
        })

    # --- NIST AI RMF ---
    if inherent_level in ["HIGH", "CRITICAL"] or risk_result.get("control_gap", {}).get("effective_control_gap", 0) > 0.6:
        triggered_rules.append({
            "rule_id": "NIST-001",
            "framework": "NIST AI RMF",
            "trigger_reason": f"High inherent risk ({inherent_level}) or large control gap",
            "key_obligations": [
                "GOVERN-1.1 — AI risk policy documented",
                "MAP-1.1 — Use case context documented",
                "MEASURE-2.2 — Bias testing performed",
                "MEASURE-2.3 — Adversarial testing performed",
                "MANAGE-2.2 — Incident response plan active"
            ]
        })

    # --- OWASP LLM ---
    if ai_source in ["third_party_api", "saas_product"] or automation == "fully_automated":
        triggered_rules.append({
            "rule_id": "OWASP-001",
            "framework": "OWASP LLM Top 10 2025",
            "trigger_reason": f"Third-party AI or fully automated",
            "categories": ["LLM01 — Prompt Injection", "LLM07 — System Prompt Leakage"],
            "key_obligations": [
                "Input sanitisation controls required",
                "Prompt injection testing with Promptfoo mandatory"
            ]
        })

    if any(d in data_sensitivity for d in ["health_data", "financial_data", "special_category_gdpr"]):
        triggered_rules.append({
            "rule_id": "OWASP-002",
            "framework": "OWASP LLM Top 10 2025",
            "trigger_reason": f"Sensitive data: {data_sensitivity}",
            "categories": ["LLM02 — Sensitive Information Disclosure", "LLM04 — Data Poisoning"],
            "key_obligations": [
                "PII detection and filtering required",
                "Training data provenance documentation required"
            ]
        })

    if not oversight.get("can_override_ai", True) and automation == "fully_automated":
        triggered_rules.append({
            "rule_id": "OWASP-004",
            "framework": "OWASP LLM Top 10 2025",
            "trigger_reason": "No override capability + fully automated",
            "categories": ["LLM06 — Excessive Agency"],
            "key_obligations": [
                "Human override mechanism mandatory",
                "Stop/interrupt capability required"
            ],
            "severity": "CRITICAL"
        })

    # --- ENISA ---
    if sector in ["energy", "public", "finance"]:
        triggered_rules.append({
            "rule_id": "ENISA-001",
            "framework": "ENISA Threat Landscape 2024-25",
            "trigger_reason": f"High-target sector: {sector}",
            "threats": ["T-01 Evasion Attacks", "T-02 Data Poisoning", "T-05 Prompt Injection"],
            "key_obligations": [
                "Adversarial robustness testing required",
                "NIS2 compliance check required"
            ],
            "note": "ENISA ETL 2025: public admin 63.1%, finance 11.7% top targets"
        })

    if "discrimination" in harm_types and has_vulnerable:
        triggered_rules.append({
            "rule_id": "ENISA-003",
            "framework": "ENISA Threat Landscape 2024-25",
            "trigger_reason": "Discrimination risk + vulnerable group",
            "threats": ["T-06 Bias and Discrimination"],
            "key_obligations": [
                "Bias testing across demographic groups required",
                "COMPL-AI fairness benchmarks mandatory"
            ]
        })

    # --- ISO 42001 ---
    if residual_level in ["HIGH", "CRITICAL"] or sector in ["finance", "healthcare", "legal"]:
        triggered_rules.append({
            "rule_id": "ISO-001",
            "framework": "ISO/IEC 42001:2023",
            "trigger_reason": f"High residual risk or regulated sector",
            "key_obligations": [
                "Clause 5.1 — Board AI governance commitment",
                "Clause 6.1 — AI risk assessment and treatment plan",
                "Clause 8.2 — AI system lifecycle process defined",
                "Clause 8.4 — Third-party AI supplier assessment"
            ]
        })

    # --- Sektöre özel ---
    if sector == "finance":
        triggered_rules.append({
            "rule_id": "SECTOR-FIN-001",
            "framework": "BaFin / EBA / MAS",
            "trigger_reason": "Financial sector deployment",
            "key_obligations": [
                "BaFin Dec 2025 — AI as ICT risk under DORA",
                "BaFin — Management-approved AI strategy required",
                "EBA — AI inventory with approved scope of use",
                "MAS AIRG Nov 2025 — Risk materiality: impact x complexity x reliance"
            ]
        })

    if sector == "healthcare":
        triggered_rules.append({
            "rule_id": "SECTOR-HEALTH-001",
            "framework": "EU AI Act / MDR",
            "trigger_reason": "Healthcare sector deployment",
            "key_obligations": [
                "EU AI Act Annex III — Medical AI is high-risk by default",
                "MDR compliance check required for medical devices",
                "GDPR Art. 9 — Special category health data lawful basis"
            ]
        })

    return {
        "triggered_rules_count": len(triggered_rules),
        "triggered_rules": triggered_rules,
        "frameworks_triggered": list(set(r["framework"] for r in triggered_rules)),
        "mandatory_actions": _extract_mandatory_actions(triggered_rules),
        "regulatory_note": (
            "Regulatory obligations are triggered by risk profile — "
            "frameworks interpret risk, they do not produce it. "
            "Source: Cyber&Legal Risk Engine v2.0"
        )
    }


def _extract_mandatory_actions(triggered_rules: list) -> list:
    """Tüm tetiklenen kurallardan zorunlu aksiyonları çıkar."""
    mandatory = []
    seen = set()
    for rule in triggered_rules:
        for obligation in rule.get("key_obligations", []):
            if obligation not in seen:
                seen.add(obligation)
                mandatory.append({
                    "action": obligation,
                    "source": rule.get("framework"),
                    "rule_id": rule.get("rule_id"),
                    "severity": rule.get("severity", "MEDIUM")
                })
    return mandatory


def run_assessment(intake: dict, evidence_overrides: Optional[dict] = None) -> dict:
    """
    Tam assessment çalıştır.

    Adımlar:
    1. Intake doğrula
    2. Evidence ekle (varsa)
    3. Risk Engine çalıştır
    4. Regulatory Mapping uygula
    5. Final rapor üret

    Parametreler:
        intake           : intake_schema formatında dict
        evidence_overrides: Test motorlarından gelen skorlar (opsiyonel)

    Döndürür:
        Tam assessment raporu — PDF'e hazır
    """

    # 1. Evidence varsa intake'e ekle
    if evidence_overrides:
        intake["evidence_layer"] = {
            **intake.get("evidence_layer", {}),
            **evidence_overrides,
            "evidence_timestamp": datetime.datetime.now(
                datetime.timezone.utc
            ).isoformat().replace("+00:00", "Z")
        }

    # 2. Risk Engine
    risk_result = calculate_risk(intake)

    # 3. Regulatory Mapping
    mapping = load_regulatory_mapping()
    regulatory = apply_regulatory_mapping(risk_result, intake, mapping)

    # 4. Final rapor
    report = {
        "assessment_id":      intake.get("assessment_id"),
        "organization":       intake.get("context", {}).get("organization"),
        "ai_system":          intake.get("context", {}).get("use_case_type"),
        "sector":             intake.get("context", {}).get("sector"),
        "timestamp":          datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat().replace("+00:00", "Z"),
        "schema_version":     "1.0",
        "methodology":        "ISO 31000 | NIST AI RMF | EU AI Act Art. 9",

        "executive_summary": {
            "inherent_risk":   risk_result["inherent_risk"]["level"],
            "residual_risk":   risk_result["residual_risk"]["level"],
            "acceptable":      risk_result["residual_risk"]["acceptable"],
            "recommendation":  risk_result["risk_summary"]["deployment_recommendation"],
            "frameworks_triggered": regulatory["frameworks_triggered"],
            "mandatory_actions_count": len(regulatory["mandatory_actions"]),
        },

        "risk_engine":   risk_result,
        "regulatory":    regulatory,

        "audit_trail": {
            "schema_version":        "1.0",
            "risk_formula":          "Inherent = Harm × Likelihood | Residual = Inherent × max(0.2, Control Gap)",
            "weights_baseline":      "v1.0 — April 2026",
            "evidence_included":     bool(intake.get("evidence_layer", {}).get("compl_ai_bias_score")),
            "methodology_statement": risk_result.get("methodology_statement"),
        }
    }

    return report


if __name__ == "__main__":
    # Test
    sample = {
        "assessment_id": "CL-20260412-001",
        "context": {
            "organization": "Test Bank AG",
            "sector": "finance",
            "use_case_type": "credit_scoring",
            "automation_level": "fully_automated",
            "ai_system_source": "third_party_api",
            "transparency_level": "black_box",
            "data_sensitivity": ["financial_data"],
            "training_data_source": ["third_party_commercial"],
            "vendor_documentation_available": "partial_docs",
            "decision_frequency": {
                "people_affected_monthly": "1000_to_100000",
                "decision_criticality": "significant"
            }
        },
        "harm_dimensions": {
            "harm_types": [
                {"type": "financial_loss", "severity": "significant"},
                {"type": "discrimination", "severity": "critical"}
            ],
            "affected_stakeholders": [
                {"stakeholder_type": "general_adult_users", "is_vulnerable": False},
                {"stakeholder_type": "financially_vulnerable", "is_vulnerable": True}
            ],
            "rights_at_risk": ["non_discrimination", "financial_rights", "right_to_explanation"],
            "reversibility": "difficult_to_reverse",
            "cascade_effect": "affects_many_before_detected",
            "detectability": "detectable_within_months"
        },
        "likelihood_inputs": {
            "threat_exposure": "high",
            "past_incidents": "one_known_incident",
            "model_susceptibility": "high",
            "deployment_environment_risk": "public_facing_high_volume"
        },
        "control_inventory": {
            "human_oversight": {
                "oversight_quality": "rubber_stamp",
                "can_override_ai": False,
                "can_stop_system": True,
                "automation_bias_training": False
            },
            "explainability": {
                "decisions_explainable_to_users": False,
                "explanation_quality": "no_explanation"
            },
            "monitoring_logging": {
                "logging_active": True,
                "monitoring_frequency": "periodic",
                "audit_trail_available": True
            },
            "opt_out_and_escalation": {
                "user_can_request_human_review": False,
                "human_escalation_path_exists": False,
                "vulnerable_user_detection": False
            },
            "testing_and_validation": {
                "bias_testing_performed": False,
                "adversarial_testing_performed": False,
                "testing_frequency": "annual",
                "test_coverage": "basic"
            },
            "supply_chain_controls": {
                "vendor_risk_assessed": True,
                "model_card_available": False,
                "bias_test_results_from_vendor": False,
                "contractual_audit_rights": True
            },
            "incident_response": {
                "incident_response_plan_exists": True,
                "complaint_mechanism_available": False,
                "fallback_procedure_defined": False
            }
        },
        "evidence_layer": {}
    }

    result = run_assessment(sample)

    print("=== EXECUTIVE SUMMARY ===")
    print(json.dumps(result["executive_summary"], indent=2, ensure_ascii=False))
    print()
    print("=== TRIGGERED RULES ===")
    for rule in result["regulatory"]["triggered_rules"]:
        print(f"  {rule['rule_id']} — {rule['framework']}: {rule['trigger_reason']}")
    print()
    print(f"Toplam kural: {result['regulatory']['triggered_rules_count']}")
    print(f"Zorunlu aksiyon: {result['executive_summary']['mandatory_actions_count']}")
