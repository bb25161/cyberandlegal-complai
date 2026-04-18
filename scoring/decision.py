"""
scoring/decision.py
Cyber&Legal AI Governance Lab -- Deployment Decision Engine

NE YAPAR:
    Residual risk, control effectiveness ve kritik kontrol açıklarına göre
    deployment recommendation üretir.

NE YAPMAZ:
    Risk skorlarını hesaplamaz.
    Regulatory mapping yapmaz.

MANTIK:
    Risk hesaplama ayrı, karar verme ayrı.
    Böylece deployment kararı daha net ve savunulabilir olur.
"""

from typing import Optional, Dict, Any


DECISION_APPROVED = "APPROVED"
DECISION_APPROVED_WITH_CONDITIONS = "APPROVED WITH CONDITIONS"
DECISION_CONDITIONAL = "CONDITIONAL"
DECISION_BLOCKED = "BLOCKED"
DECISION_LEGAL_REVIEW_REQUIRED = "LEGAL REVIEW REQUIRED"


def get_deployment_recommendation(
    residual_level: str,
    intake: dict,
    control_effectiveness: Optional[float] = None,
    critical_failures: Optional[list] = None,
) -> str:
    """
    Deployment recommendation üretir.

    Karar girdileri:
    - residual risk level
    - control effectiveness
    - critical control failures

    Öncelik:
    1. Legal review / prohibited practice check
    2. Critical block conditions
    3. High-risk block conditions
    4. Conditional / approved decisions
    """

    prohibited_decision = _check_prohibited_practice(intake)
    if prohibited_decision is not None:
        return prohibited_decision

    control_effectiveness = control_effectiveness if control_effectiveness is not None else 0.0
    critical_failures = critical_failures or []
    critical_failure_count = len(critical_failures)

    # 1. En ağır durum: CRITICAL residual risk
    if residual_level == "CRITICAL":
        return (
            f"{DECISION_BLOCKED} -- "
            "Residual risk is unacceptable. Do not deploy until major remediation is completed."
        )

    # 2. HIGH residual risk + çok zayıf kontrol yapısı => BLOCK
    if residual_level == "HIGH":
        if control_effectiveness < 0.40:
            return (
                f"{DECISION_BLOCKED} -- "
                "High residual risk with weak control effectiveness. Deployment should not proceed."
            )

        if critical_failure_count >= 3:
            return (
                f"{DECISION_BLOCKED} -- "
                "High residual risk with multiple critical control failures. Remediation is required before deployment."
            )

        return (
            f"{DECISION_CONDITIONAL} -- "
            "High residual risk detected. Deployment may proceed only after prioritized remediation and formal approval."
        )

    # 3. MEDIUM residual risk
    if residual_level == "MEDIUM":
        if critical_failure_count >= 3 and control_effectiveness < 0.50:
            return (
                f"{DECISION_CONDITIONAL} -- "
                "Medium residual risk, but critical controls are weak. Address key gaps before deployment."
            )

        return (
            f"{DECISION_APPROVED_WITH_CONDITIONS} -- "
            "Residual risk is manageable if recommended controls are implemented within the defined remediation window."
        )

    # 4. LOW residual risk
    return (
        f"{DECISION_APPROVED} -- "
        "Residual risk is within acceptable tolerance. Maintain monitoring and review controls periodically."
    )


def _check_prohibited_practice(intake: Dict[str, Any]) -> Optional[str]:
    """
    Basit legal review tetikleyicisi.

    Not:
    Bu tam bir EU AI Act legal qualification engine değildir.
    Sadece açık riskli durumlarda legal review uyarısı verir.
    """
    context = intake.get("context", {})
    use_case = context.get("use_case_type", "")
    sensitive_data = context.get("data_sensitivity", [])

    # Enum gelirse .value yerine stringe dönüştür
    use_case_str = getattr(use_case, "value", use_case)

    prohibited_use_cases = ["monitoring_surveillance"]

    if use_case_str in prohibited_use_cases and "biometric_data" in sensitive_data:
        return (
            f"{DECISION_LEGAL_REVIEW_REQUIRED} -- "
            "Potential prohibited practice under EU AI Act Art. 5. Legal review is required before any deployment decision."
        )

    return None