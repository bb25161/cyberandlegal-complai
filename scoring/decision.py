"""
scoring/decision.py
Cyber&Legal AI Governance Lab — Deployment Decision Engine

NE YAPAR:
    Residual risk seviyesine ve bağlama göre deployment recommendation üretir.

NE YAPMAZ:
    Risk hesaplamaz.
    Harm / Likelihood / Control score üretmez.
    Regulatory mapping yapmaz.

NEDEN AYRI:
    Risk hesaplama mantığı ile karar mantığını ayırmak için.
    Böylece gelecekte:
        - yeni karar tipleri eklemek,
        - sektör bazlı karar eşikleri tanımlamak,
        - legal review / human sign-off kuralları eklemek
    daha kolay olur.

MEVCUT TASARIM:
    Bu ilk sürümde davranış değiştirilmez.
    Sadece scoring.py içindeki deployment recommendation mantığı buraya taşınır.
"""

from typing import Optional, Dict, Any


# Karar sabitleri
DECISION_APPROVED = "APPROVED"
DECISION_APPROVED_WITH_CONDITIONS = "APPROVED WITH CONDITIONS"
DECISION_CONDITIONAL = "CONDITIONAL"
DECISION_BLOCKED = "BLOCKED"
DECISION_LEGAL_REVIEW_REQUIRED = "LEGAL REVIEW REQUIRED"


def get_deployment_recommendation(residual_level: str, intake: dict) -> str:
    """
    Deployment recommendation üretir.

    Bu sürümde davranış değişmez:
    - prohibited practice benzeri durumlarda legal review
    - CRITICAL → BLOCKED
    - HIGH → CONDITIONAL
    - MEDIUM → APPROVED WITH CONDITIONS
    - LOW → APPROVED
    """

    prohibited_decision = _check_prohibited_practice(intake)
    if prohibited_decision is not None:
        return prohibited_decision

    if residual_level == "CRITICAL":
        return (
            f"{DECISION_BLOCKED} — "
            "Residual risk unacceptable. Major remediation required before deployment."
        )
    elif residual_level == "HIGH":
        return (
            f"{DECISION_CONDITIONAL} — "
            "Address critical control gaps before deployment."
        )
    elif residual_level == "MEDIUM":
        return (
            f"{DECISION_APPROVED_WITH_CONDITIONS} — "
            "Implement recommended controls within 90 days."
        )
    else:
        return (
            f"{DECISION_APPROVED} — "
            "Residual risk within acceptable tolerance. Maintain monitoring."
        )


def _check_prohibited_practice(intake: Dict[str, Any]) -> Optional[str]:
    """
    Basit legal review tetikleyicisi.

    Not:
    Bu gerçek bir tam EU AI Act legal qualification motoru değildir.
    İlk refactor aşamasında eski mantığı korumak için eklenmiştir.

    Şu anki kural:
    - use_case_type == monitoring_surveillance
    - data_sensitivity içinde biometric_data varsa

    Sonuç:
    - LEGAL REVIEW REQUIRED
    """

    context = intake.get("context", {})
    use_case = context.get("use_case_type", "")
    sensitive_data = context.get("data_sensitivity", [])

    prohibited_use_cases = ["monitoring_surveillance"]

    if use_case in prohibited_use_cases and "biometric_data" in sensitive_data:
        return (
            f"{DECISION_LEGAL_REVIEW_REQUIRED} — "
            "Potential prohibited practice under EU AI Act Art. 5"
        )

    return None


if __name__ == "__main__":
    sample_intake = {
        "context": {
            "use_case_type": "monitoring_surveillance",
            "data_sensitivity": ["biometric_data"]
        }
    }

    print(get_deployment_recommendation("HIGH", sample_intake))