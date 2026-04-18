"""
scoring/scoring.py
Cyber&Legal AI Governance Lab — Risk Hesaplama Motoru

NE YAPAR:
    intake_schema.json girdilerini alır.
    Harm Score, Likelihood Score, Control Effectiveness hesaplar.
    Inherent Risk ve Residual Risk üretir.
    Regulatory mapping'i tetikler.

METODOLOJİ:
    ISO 31000 risk yönetimi
    Inherent Risk = Harm Score × Likelihood Score
    Control Gap = max(0.2, 1 - Control Effectiveness)
    Residual Risk = Inherent Risk × Control Gap

NEDEN BU FORMÜL:
    Regülasyon ağırlığı risk üretmez — risk profili regülasyonu tetikler.
    Min gap = 0.2: Hiçbir AI sistemi sıfır risk değildir.
    Design × 0.4 + Operating × 0.6: Kağıt kontrol yetmez, kanıt gerekir.

SABIT KALAN:
    Bu formül ve ağırlıklar. Versiyon: v1.0.

GÜNCELLENEN:
    evidence_layer — aylık ENISA + test motoru sonuçları.
"""

import json
import datetime
from typing import Optional

try:
    from scoring.decision import get_deployment_recommendation
except ModuleNotFoundError:
    # direct script run fallback
    from decision import get_deployment_recommendation


# Harm severity → sayısal değer
SEVERITY_MAP = {
    "catastrophic": 1.0,
    "critical": 0.8,
    "significant": 0.6,
    "moderate": 0.4,
    "minor": 0.2,
}

# Reversibility çarpanı
REVERSIBILITY_MAP = {
    "irreversible": 2.0,
    "difficult_to_reverse": 1.5,
    "reversible_with_effort": 1.2,
    "immediately_reversible": 1.0,
}

# Cascade çarpanı
CASCADE_MAP = {
    "systemic": 1.5,
    "affects_many_before_detected": 1.3,
    "triggers_further_automated_decisions": 1.2,
    "contained": 1.0,
}

# Etkilenen kişi ölçeği
SCALE_MAP = {
    "over_100000": 1.0,
    "1000_to_100000": 0.75,
    "100_to_1000": 0.5,
    "under_100": 0.25,
}

# Tehdit maruziyeti
THREAT_EXPOSURE_MAP = {
    "very_high": 1.0,
    "high": 0.75,
    "medium": 0.5,
    "low": 0.25,
}

# Geçmiş olaylar
INCIDENT_MAP = {
    "multiple_known_incidents": 1.0,
    "one_known_incident": 0.6,
    "near_misses_only": 0.3,
    "none_known": 0.1,
}

# Deployment ortamı riski
DEPLOYMENT_MAP = {
    "public_facing_high_volume": 1.0,
    "public_facing_low_volume": 0.7,
    "internal_only": 0.4,
    "sandboxed": 0.2,
}

# Model susceptibility
SUSCEPTIBILITY_MAP = {
    "high": 1.0,
    "unknown": 0.7,
    "medium": 0.6,
    "low": 0.3,
}

# Tespit edilebilirlik
DETECTABILITY_MAP = {
    "may_never_be_detected": 1.0,
    "detectable_within_months": 0.7,
    "detectable_within_days": 0.4,
    "immediately_visible": 0.1,
}

# Gözetim kalitesi
OVERSIGHT_MAP = {
    "full_meaningful_review": 1.0,
    "partial_review": 0.6,
    "rubber_stamp": 0.2,
    "none": 0.0,
}

# Açıklanabilirlik
EXPLAINABILITY_MAP = {
    "full_xai": 1.0,
    "summary_explanation": 0.6,
    "no_explanation": 0.0,
    "not_applicable": 0.5,
}

# İzleme sıklığı
MONITORING_MAP = {
    "real_time": 1.0,
    "daily": 0.8,
    "periodic": 0.4,
    "none": 0.0,
}

# Test kapsamı
TESTING_MAP = {
    "comprehensive": 1.0,
    "partial": 0.6,
    "basic": 0.3,
    "none": 0.0,
}


def calculate_harm_score(intake: dict) -> dict:
    """
    Harm Score hesapla.

    Harm = severity × scale × rights_impact × reversibility × cascade × vulnerable_group
    Kaynak: OECD harm taxonomy, EU AI Act Art. 27 FRIA, NIST impact characterization.
    """

    harm_dims = intake.get("harm_dimensions", {})
    context = intake.get("context", {})

    # 1. Severity — en yüksek zarar tipinin ağırlıklı ortalaması
    harm_types = harm_dims.get("harm_types", [])
    if harm_types:
        severity_scores = [SEVERITY_MAP.get(h.get("severity", "moderate"), 0.4) for h in harm_types]
        severity_score = sum(severity_scores) / len(severity_scores)
    else:
        severity_score = 0.3

    # 2. Scale — kaç kişi etkileniyor
    freq = context.get("decision_frequency", {})
    people = freq.get("people_affected_monthly", "under_100")
    scale_score = SCALE_MAP.get(people, 0.25)

    # Karar kritikliği scale'i yukarı çeker
    criticality = freq.get("decision_criticality", "moderate")
    if criticality == "life_changing":
        scale_score = min(1.0, scale_score * 1.3)
    elif criticality == "significant":
        scale_score = min(1.0, scale_score * 1.1)

    # 3. Rights impact — kaç temel hak etkileniyor
    rights = harm_dims.get("rights_at_risk", [])
    rights_score = min(1.0, len(rights) * 0.12)

    # 4. Reversibility çarpanı
    rev = harm_dims.get("reversibility", "reversible_with_effort")
    reversibility_mult = REVERSIBILITY_MAP.get(rev, 1.2)

    # 5. Cascade çarpanı
    cascade = harm_dims.get("cascade_effect", "contained")
    cascade_mult = CASCADE_MAP.get(cascade, 1.0)

    # 6. Savunmasız grup çarpanı
    stakeholders = harm_dims.get("affected_stakeholders", [])
    has_vulnerable = any(s.get("is_vulnerable", False) for s in stakeholders)
    has_children = any(s.get("stakeholder_type") == "children_under_18" for s in stakeholders)

    if has_children:
        vulnerable_mult = 1.5
    elif has_vulnerable:
        vulnerable_mult = 1.3
    else:
        vulnerable_mult = 1.0

    # Composite harm — capped at 1.0
    base_harm = (
        severity_score * 0.50 +
        scale_score * 0.30 +
        rights_score * 0.20
    )
    rev_adj = 1.0 + (reversibility_mult - 1.0) * 0.25
    cas_adj = 1.0 + (cascade_mult - 1.0) * 0.25
    vul_adj = 1.0 + (vulnerable_mult - 1.0) * 0.25
    composite = min(1.0, base_harm * rev_adj * cas_adj * vul_adj)

    # Dominant harm type tespiti
    dominant = "unknown"
    if harm_types:
        top = max(harm_types, key=lambda h: SEVERITY_MAP.get(h.get("severity", "minor"), 0))
        dominant = top.get("type", "unknown")

    return {
        "severity_score": round(severity_score, 3),
        "scale_score": round(scale_score, 3),
        "rights_impact_score": round(rights_score, 3),
        "reversibility_multiplier": reversibility_mult,
        "cascade_multiplier": cascade_mult,
        "vulnerable_group_multiplier": vulnerable_mult,
        "composite_harm_score": round(composite, 3),
        "harm_breakdown": {
            "dominant_harm_type": dominant,
            "rights_count": len(rights),
            "vulnerable_groups_present": has_vulnerable,
            "children_present": has_children,
        }
    }


def calculate_likelihood_score(intake: dict) -> dict:
    """
    Likelihood Score hesapla.

    Likelihood = weighted average of (threat_prevalence, susceptibility,
                 deployment_risk, incident_history, detectability) + evidence_adjustment
    Kaynak: NIST MEASURE, ENISA ETL, EU AI Act Art. 9 probabilistic thresholds.

    NOT: Detectability burada — Control Gap'te değil.
    Tespit edilemeyen zarar daha uzun süre devam eder → efektif likelihood artar.
    """

    likelihood_inputs = intake.get("likelihood_inputs", {})
    evidence = intake.get("evidence_layer", {})
    context = intake.get("context", {})

    # 1. Tehdit maruziyeti — ENISA sektörel tehdit seviyesi
    threat_exp = likelihood_inputs.get("threat_exposure", "medium")
    threat_score = THREAT_EXPOSURE_MAP.get(threat_exp, 0.5)

    # 2. Model susceptibility
    susc = likelihood_inputs.get("model_susceptibility", "unknown")
    susceptibility_score = SUSCEPTIBILITY_MAP.get(susc, 0.7)

    # 3. Geçmiş olaylar
    incidents = likelihood_inputs.get("past_incidents", "none_known")
    incident_score = INCIDENT_MAP.get(incidents, 0.1)

    # 4. Deployment ortamı
    deploy = likelihood_inputs.get("deployment_environment_risk", "internal_only")
    deployment_score = DEPLOYMENT_MAP.get(deploy, 0.4)

    # 5. Tespit edilebilirlik
    detectability = intake.get("harm_dimensions", {}).get("detectability", "detectable_within_days")
    detect_score = DETECTABILITY_MAP.get(detectability, 0.4)

    # 6. Evidence adjustment — test motorlarından gelen sonuçlar
    evidence_adj = _calculate_evidence_adjustment(evidence, context)

    # Ağırlıklı ortalama
    weighted = (
        threat_score * 0.30 +
        susceptibility_score * 0.25 +
        deployment_score * 0.20 +
        incident_score * 0.15 +
        detect_score * 0.10
    )

    composite = min(1.0, max(0.0, weighted + evidence_adj))

    return {
        "threat_prevalence_score": round(threat_score, 3),
        "susceptibility_score": round(susceptibility_score, 3),
        "incident_history_score": round(incident_score, 3),
        "deployment_risk_score": round(deployment_score, 3),
        "detectability_score": round(detect_score, 3),
        "evidence_adjustment": round(evidence_adj, 3),
        "composite_likelihood_score": round(composite, 3),
        "likelihood_breakdown": {
            "primary_driver": _primary_likelihood_driver(
                threat_score, susceptibility_score, deployment_score, incident_score
            ),
            "evidence_available": bool(
                evidence.get("compl_ai_bias_score") or
                evidence.get("owasp_composite_score") or
                evidence.get("lm_eval_score") or
                evidence.get("promptfoo_red_team_score")
            ),
            "evidence_timestamp": evidence.get("evidence_timestamp"),
            "sector_used_for_weighting": context.get("sector", "general"),
        }
    }


def _get_sector_weights(sector: str) -> dict:
    """
    Sektöre gore evidence motor agirlikları.

    NEDEN SEKTORE GORE DEGISIYOR:
        OWASP + Promptfoo = guvenlik sinyali
            Finans/Hukuk: prompt injection, veri sizintisi kritik
        COMPL-AI = regülasyon/bias sinyali
            Saglik/Finans: ayrimcilik riski kritik, EU AI Act Annex III
        LM Eval = kalite/hallucination sinyali
            Hukuk/Saglik: yanlis bilgi olum/dava riski
            Genel: dengeli

    KAYNAK:
        BaFin Dec 2025: finans AI risk = guvenlik + bias esit agirlikli
        EBA Nov 2025: kredi skorlamada fairness testi zorunlu
        MDR + EU AI Act: saglik AI bias testi kritik
        NIST AI RMF: sektor bazli risk profili
    """
    weights = {
        "finance": {
            "owasp": 0.35,
            "compl_ai": 0.35,
            "lm_eval": 0.15,
            "promptfoo": 0.15,
        },
        "healthcare": {
            "owasp": 0.25,
            "compl_ai": 0.45,
            "lm_eval": 0.20,
            "promptfoo": 0.10,
        },
        "legal": {
            "owasp": 0.25,
            "compl_ai": 0.35,
            "lm_eval": 0.30,
            "promptfoo": 0.10,
        },
        "public": {
            "owasp": 0.35,
            "compl_ai": 0.30,
            "lm_eval": 0.20,
            "promptfoo": 0.15,
        },
        "hr_recruitment": {
            "owasp": 0.20,
            "compl_ai": 0.50,
            "lm_eval": 0.20,
            "promptfoo": 0.10,
        },
    }
    # Tanimsiz sektor → dengeli dagilim
    default = {
        "owasp": 0.35,
        "compl_ai": 0.30,
        "lm_eval": 0.20,
        "promptfoo": 0.15,
    }
    return weights.get(sector, default)


def _calculate_evidence_adjustment(evidence: dict, context: Optional[dict] = None) -> float:
    """
    Test motoru sonuçlarından likelihood adjustment hesapla.

    SEKTOR BAZLI AGIRLIK:
        Her motor farklı sinyal verir — hepsi esit degildir.
        OWASP/Promptfoo = guvenlik sinyali
        COMPL-AI = regulasyon/bias sinyali
        LM Eval = kalite/hallucination sinyali

        Finans: COMPL-AI + OWASP esit agirlikli (bias + guvenlik kritik)
        Saglik: COMPL-AI agirlikli (bias/fairness hayati onem tasir)
        Hukuk: LM Eval agirlikli (yanlis bilgi = hukuki risk)
        Genel: dengeli

    FORMUL:
        weighted_risk = sum(agirlik × (1 - skor)) / toplam_agirlik
        adjustment = (weighted_risk - 0.5) × 0.6
        Aralik: ±0.3

    KAYNAK: BaFin Dec 2025, EBA Nov 2025, NIST AI RMF sector profiles
    """
    context = context or {}
    sector = context.get("sector", "general")
    weights = _get_sector_weights(sector)

    weighted_sum = 0.0
    total_weight = 0.0

    motor_map = {
        "owasp": evidence.get("owasp_composite_score"),
        "compl_ai": evidence.get("compl_ai_bias_score"),
        "lm_eval": evidence.get("lm_eval_score"),
        "promptfoo": evidence.get("promptfoo_red_team_score"),
    }

    for motor, score in motor_map.items():
        if score is not None:
            weight = weights[motor]
            weighted_sum += weight * (1.0 - score)
            total_weight += weight

    if total_weight == 0:
        return 0.0

    weighted_risk = weighted_sum / total_weight
    # ±0.3 araliginda adjustment
    return round((weighted_risk - 0.5) * 0.6, 3)


def _primary_likelihood_driver(threat, susceptibility, deployment, incident) -> str:
    """En yüksek likelihood bileşenini tespit et."""
    drivers = {
        "threat_exposure": threat,
        "model_susceptibility": susceptibility,
        "deployment_environment": deployment,
        "incident_history": incident,
    }
    return max(drivers, key=drivers.get)


def calculate_control_effectiveness(intake: dict) -> dict:
    """
    Control Effectiveness hesapla.

    İki boyut:
    - Design Effectiveness: Doğru kontroller var mı? (kağıt üzerinde)
    - Operating Effectiveness: Kontroller gerçekten çalışıyor mu? (kanıtla)

    Composite = design × 0.4 + operating × 0.6
    Operating daha yüksek ağırlık — kağıt kontrol yetmez.
    Kaynak: EU AI Act Art. 14, ISO 42001, ISO/IEC 23894.
    """

    ctrl = intake.get("control_inventory", {})

    # --- DESIGN EFFECTIVENESS ---

    # İnsan gözetimi tasarımı — EU AI Act Art. 14 capability set
    oversight = ctrl.get("human_oversight", {})
    oversight_quality = oversight.get("oversight_quality", "none")
    oversight_score = OVERSIGHT_MAP.get(oversight_quality, 0.0)

    # Override ve stop capability ekstra puan
    if oversight.get("can_override_ai", False):
        oversight_score = min(1.0, oversight_score + 0.1)
    if oversight.get("can_stop_system", False):
        oversight_score = min(1.0, oversight_score + 0.1)
    if oversight.get("automation_bias_training", False):
        oversight_score = min(1.0, oversight_score + 0.05)

    # Açıklanabilirlik tasarımı
    explainability = ctrl.get("explainability", {})
    expl_quality = explainability.get("explanation_quality", "no_explanation")
    explainability_score = EXPLAINABILITY_MAP.get(expl_quality, 0.0)

    # Opt-out tasarımı
    opt_out = ctrl.get("opt_out_and_escalation", {})
    opt_score = 0.0
    if opt_out.get("user_can_request_human_review", False):
        opt_score += 0.4
    if opt_out.get("human_escalation_path_exists", False):
        opt_score += 0.4
    if opt_out.get("vulnerable_user_detection", False):
        opt_score += 0.2

    # Incident response tasarımı
    incident = ctrl.get("incident_response", {})
    incident_score = 0.0
    if incident.get("incident_response_plan_exists", False):
        incident_score += 0.5
    if incident.get("complaint_mechanism_available", False):
        incident_score += 0.3
    if incident.get("fallback_procedure_defined", False):
        incident_score += 0.2

    # Supply chain tasarımı — EU AI Act Art. 25, BaFin DORA
    supply = ctrl.get("supply_chain_controls", {})
    supply_score = 0.0
    if supply.get("vendor_risk_assessed", False):
        supply_score += 0.35
    if supply.get("model_card_available", False):
        supply_score += 0.25
    if supply.get("bias_test_results_from_vendor", False):
        supply_score += 0.25
    if supply.get("contractual_audit_rights", False):
        supply_score += 0.15

    design_composite = (
        oversight_score * 0.30 +
        explainability_score * 0.20 +
        opt_score * 0.20 +
        incident_score * 0.15 +
        supply_score * 0.15
    )

    # --- OPERATING EFFECTIVENESS ---

    # Test kapsamı — EU AI Act Art. 9, NIST MEASURE TEVV
    testing = ctrl.get("testing_and_validation", {})
    test_coverage = testing.get("test_coverage", "none")
    testing_score = TESTING_MAP.get(test_coverage, 0.0)

    # Test sıklığı bonus
    test_freq = testing.get("testing_frequency", "never")
    if test_freq == "continuous":
        testing_score = min(1.0, testing_score + 0.1)
    elif test_freq == "per_release":
        testing_score = min(1.0, testing_score + 0.05)

    # İzleme ve logging
    monitoring = ctrl.get("monitoring_logging", {})
    monitor_freq = monitoring.get("monitoring_frequency", "none")
    monitoring_score = MONITORING_MAP.get(monitor_freq, 0.0)
    if monitoring.get("audit_trail_available", False):
        monitoring_score = min(1.0, monitoring_score + 0.1)

    # Bias testi — COMPL-AI sonuçları buraya girer
    bias_tested = testing.get("bias_testing_performed", False)
    bias_score = 0.8 if bias_tested else 0.0

    # Adversarial testi — OWASP + Promptfoo sonuçları
    adversarial_tested = testing.get("adversarial_testing_performed", False)
    adversarial_score = 0.8 if adversarial_tested else 0.0

    operating_composite = (
        testing_score * 0.30 +
        monitoring_score * 0.25 +
        bias_score * 0.25 +
        adversarial_score * 0.20
    )

    # Composite control effectiveness
    composite = design_composite * 0.4 + operating_composite * 0.6

    # Kritik kontrol başarısızlıkları — 0.3 altındakiler
    critical_failures = []
    areas = {
        "human_oversight": oversight_score,
        "explainability": explainability_score,
        "opt_out": opt_score,
        "incident_response": incident_score,
        "supply_chain": supply_score,
        "testing": testing_score,
        "monitoring": monitoring_score,
        "bias_testing": bias_score,
        "adversarial_testing": adversarial_score,
    }
    for area, score in areas.items():
        if score < 0.3:
            critical_failures.append({
                "control_area": area,
                "current_score": round(score, 3),
                "required_score": 0.7,
            })

    return {
        "design_effectiveness": {
            "human_oversight_score": round(oversight_score, 3),
            "explainability_score": round(explainability_score, 3),
            "opt_out_score": round(opt_score, 3),
            "incident_response_score": round(incident_score, 3),
            "supply_chain_score": round(supply_score, 3),
            "composite_design_score": round(design_composite, 3),
        },
        "operating_effectiveness": {
            "testing_coverage_score": round(testing_score, 3),
            "monitoring_score": round(monitoring_score, 3),
            "bias_testing_score": round(bias_score, 3),
            "adversarial_testing_score": round(adversarial_score, 3),
            "composite_operating_score": round(operating_composite, 3),
        },
        "composite_control_effectiveness": round(composite, 3),
        "critical_control_failures": critical_failures,
    }


def calculate_risk(intake: dict) -> dict:
    """
    Ana risk hesaplama fonksiyonu.

    Inherent Risk = Harm × Likelihood
    Control Gap = max(0.2, 1 - Control Effectiveness)
    Residual Risk = Inherent Risk × Control Gap

    Kaynak: ISO 31000, NIST AI RMF, EU AI Act Art. 9.
    """

    # 1. Harm Score
    harm = calculate_harm_score(intake)

    # 2. Likelihood Score
    likelihood = calculate_likelihood_score(intake)

    # 3. Control Effectiveness
    controls = calculate_control_effectiveness(intake)

    # 4. Inherent Risk
    inherent_score = round(
        harm["composite_harm_score"] * likelihood["composite_likelihood_score"],
        3
    )
    inherent_level = _risk_level(inherent_score, thresholds=[0.75, 0.50, 0.25])

    # 5. Control Gap
    raw_gap = round(1 - controls["composite_control_effectiveness"], 3)
    effective_gap = round(max(0.2, raw_gap), 3)

    # 6. Residual Risk
    residual_score = round(inherent_score * effective_gap, 3)
    residual_level = _risk_level(residual_score, thresholds=[0.60, 0.40, 0.20])
    acceptable = residual_level not in ["CRITICAL", "HIGH"]

    # 7. Deployment recommendation
# Deployment recommendation
    # 7. Deployment recommendation
    recommendation = get_deployment_recommendation(
        residual_level=residual_level,
        intake=intake,
        control_effectiveness=controls["composite_control_effectiveness"],
        critical_failures=controls["critical_control_failures"],
    )

    # 8. Top 3 risk drivers
    top_drivers = _top_risk_drivers(harm, likelihood, controls)

    # 9. Top 3 remediation actions
    remediation = _remediation_actions(controls, harm, likelihood)

    return {
        "assessment_id": intake.get("assessment_id"),
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z"),
        "schema_version": "1.0",
        "methodology": "ISO 31000 | NIST AI RMF | EU AI Act Art. 9",
        "harm_score": harm,
        "likelihood_score": likelihood,
        "control_effectiveness": controls,
        "control_gap": {
            "raw_control_gap": raw_gap,
            "effective_control_gap": effective_gap,
            "min_gap_applied": raw_gap < 0.2,
            "critical_control_failures": controls["critical_control_failures"],
        },
        "inherent_risk": {
            "score": inherent_score,
            "level": inherent_level,
            "interpretation": _interpret_inherent(inherent_level, intake),
        },
        "residual_risk": {
            "score": residual_score,
            "level": residual_level,
            "acceptable": acceptable,
            "risk_appetite_threshold": 0.40,
            "interpretation": _interpret_residual(residual_level, acceptable),
        },
        "risk_summary": {
            "inherent_risk_score": inherent_score,
            "inherent_risk_level": inherent_level,
            "control_effectiveness_score": controls["composite_control_effectiveness"],
            "control_gap": effective_gap,
            "residual_risk_score": residual_score,
            "residual_risk_level": residual_level,
            "deployment_recommendation": recommendation,
            "top_3_risk_drivers": top_drivers,
            "top_3_remediation_actions": remediation,
        },
        "methodology_statement": (
            "Risk calculated using Cyber&Legal Risk Engine v2.0. "
            "Inherent Risk = Harm Score x Likelihood Score. "
            "Residual Risk = Inherent Risk x max(0.2, Control Gap). "
            "Regulatory frameworks interpret risk scores — they do not produce them. "
            "Formula and schema frozen at v1.0. "
            "Evidence layer updated monthly."
        ),
    }


def _risk_level(score: float, thresholds: list) -> str:
    """Risk seviyesi — CRITICAL/HIGH/MEDIUM/LOW."""
    if score >= thresholds[0]:
        return "CRITICAL"
    elif score >= thresholds[1]:
        return "HIGH"
    elif score >= thresholds[2]:
        return "MEDIUM"
    else:
        return "LOW"


def _top_risk_drivers(harm: dict, likelihood: dict, controls: dict) -> list:
    """En yüksek risk faktörlerini tespit et."""
    drivers = []

    if harm["composite_harm_score"] > 0.7:
        dominant = harm["harm_breakdown"].get("dominant_harm_type", "unknown")
        drivers.append(f"High harm potential: {dominant} ({harm['composite_harm_score']:.0%})")

    if harm["harm_breakdown"].get("children_present"):
        drivers.append("Children affected — FRIA mandatory, vulnerable group multiplier applied")

    if likelihood["composite_likelihood_score"] > 0.6:
        primary = likelihood["likelihood_breakdown"].get("primary_driver", "unknown")
        drivers.append(f"High likelihood: {primary} ({likelihood['composite_likelihood_score']:.0%})")

    if controls["composite_control_effectiveness"] < 0.4:
        drivers.append(f"Weak controls: {controls['composite_control_effectiveness']:.0%} effectiveness")

    if likelihood["evidence_adjustment"] > 0.1:
        drivers.append("Automated tests revealed vulnerabilities — evidence layer active")

    return drivers[:3]


def _remediation_actions(controls: dict, harm: dict, likelihood: dict) -> list:
    """Öncelikli düzeltme adımları."""
    actions = []
    failures = controls.get("critical_control_failures", [])

    priority_map = {
        "human_oversight": "Implement meaningful human oversight (EU AI Act Art. 14)",
        "bias_testing": "Run bias tests: COMPL-AI bbq, winobias, crows_pairs",
        "adversarial_testing": "Run adversarial tests: OWASP engine + Promptfoo red-team",
        "monitoring": "Activate real-time monitoring and audit logging",
        "explainability": "Implement explainability for affected persons (EU AI Act Art. 13)",
        "supply_chain": "Obtain vendor documentation and conduct due diligence",
        "incident_response": "Create incident response plan with complaint mechanism",
        "opt_out": "Implement human escalation path for affected persons",
        "testing": "Establish regular testing and validation programme",
    }

    for failure in failures[:3]:
        area = failure["control_area"]
        if area in priority_map:
            actions.append(priority_map[area])

    if not actions:
        if harm["composite_harm_score"] > 0.6:
            actions.append("Conduct FRIA — high harm potential identified")
        if likelihood["composite_likelihood_score"] > 0.6:
            actions.append("Review deployment environment and threat exposure")
        actions.append("Schedule quarterly compliance review")

    return actions[:3]


def _interpret_inherent(level: str, intake: dict) -> str:
    """Inherent risk için plain English açıklama."""
    sector = intake.get("context", {}).get("sector", "general")
    interpretations = {
        "CRITICAL": f"Without any safeguards, this AI system poses critical risk in the {sector} sector. Immediate action required.",
        "HIGH": f"Without safeguards, this system carries high risk. Robust controls are essential.",
        "MEDIUM": f"Moderate inherent risk. Standard controls should be sufficient if properly implemented.",
        "LOW": f"Low inherent risk. Basic governance controls recommended.",
    }
    return interpretations.get(level, "Risk level undetermined.")


def _interpret_residual(level: str, acceptable: bool) -> str:
    """Residual risk için plain English açıklama."""
    if not acceptable:
        return (
            "Current safeguards are insufficient. "
            "Residual risk exceeds acceptable threshold. "
            "Deployment should be paused until critical gaps are addressed."
        )
    interpretations = {
        "MEDIUM": "Residual risk is within tolerance but improvement is recommended. Monitor closely.",
        "LOW": "Residual risk is well-managed. Maintain current controls and continue monitoring.",
    }
    return interpretations.get(level, "Residual risk acceptable.")


if __name__ == "__main__":
    # Hızlı test
    sample_intake = {
        "assessment_id": "CL-20260412-TEST",
        "timestamp": "2026-04-12T18:00:00Z",
        "context": {
            "organization": "Test Bank",
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
            "detectability": "detectable_within_months",
            "scale_of_impact": {
                "geographic_scope": "national",
                "population_potentially_harmed": "large_group"
            }
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

    result = calculate_risk(sample_intake)
    print(json.dumps(result["risk_summary"], indent=2, ensure_ascii=False))
    print(f"\nInherent Risk: {result['inherent_risk']['level']} ({result['inherent_risk']['score']})")
    print(f"Residual Risk: {result['residual_risk']['level']} ({result['residual_risk']['score']})")
    print(f"Recommendation: {result['risk_summary']['deployment_recommendation']}")