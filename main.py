from pydantic import BaseModel
from typing import Optional

class RiskAssessmentRequest(BaseModel):
    use_case: Optional[str] = None
    risk_factors: Optional[dict] = None
    controls: Optional[dict] = None

    model_provider: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None


@app.post("/assess/risk/full")
async def assess_risk_full(request: RiskAssessmentRequest):

    if request.model_provider and not request.api_key:
        raise ValueError("API key is required for selected provider")

    intake = request.dict()

    result = run_full_assessment(intake)

    return result
