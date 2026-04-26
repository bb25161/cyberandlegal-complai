from engines.owasp_engine import run_owasp_tests

def run_full_assessment(intake):

    owasp_result = run_owasp_tests(
        model=intake.get("model_name"),
        provider=intake.get("model_provider"),
        api_key=intake.get("api_key"),
        dry_run=False
    )

    risk_result = calculate_risk(intake, owasp_result)

    return {
        "risk": risk_result,
        "owasp": owasp_result
    }
