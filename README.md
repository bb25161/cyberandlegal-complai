# Cyber&Legal Lab — AI Governance Platform

AI risk assessment platform built on **EU AI Act**, **NIST AI RMF**, and **OWASP LLM Top 10**.

## Architecture

```
www.cyberandlegal.com        → Framer (marketing)
lab.cyberandlegal.com        → Firebase Hosting (React SPA)
                             → Cloud Run Backend (Python/FastAPI)
```

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Firebase Hosting |
| Auth | Firebase Auth (Email + Google) |
| Backend | FastAPI, Cloud Run (europe-west4) |
| Secrets | Google Secret Manager |
| CI | Manual deploy via Cloud Shell |

## Frontend structure

```
lab-frontend/src/
├── App.jsx                     # Router + lang state
├── components/
│   └── EUScreening.jsx         # EU AI Act 7-check decision tree
├── pages/
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── AssessmentPage.jsx      # 5-step form (EU + NIST)
│   └── ReportPage.jsx
├── lib/
│   ├── api.js                  # Form → backend payload mapping
│   ├── i18n.js                 # EN/TR translations
│   └── firebase.js
└── hooks/
    └── useAuth.jsx
```

## Compliance coverage

### EU AI Act (via EUScreening.jsx)
- Check 1: AI system definition (Art. 3(1))
- Check 2: Exemptions (Art. 2(3))
- Check 3: Role determination (Art. 3(3–8))
- Check 4: Prohibited practices (Art. 5)
- Check 5: High-risk classification / Annex III (Art. 6)
- Check 6: Transparency obligations (Art. 50)
- Check 7: GPAI + systemic risk (Art. 51–55)

### NIST AI RMF (via AssessmentPage.jsx)
| Question | NIST Reference |
|---|---|
| Lifecycle stage | MAP 1.4 |
| Risk tolerance | MAP 1.5 / GOVERN 1.3 |
| Drift monitoring | MEASURE 2.4 / MANAGE 2.2 |
| Explainability quality | MEASURE 2.9 |
| Adversarial testing | MEASURE 2.7 / GOVERN 4.1 |
| Decommission plan | GOVERN 1.7 / MANAGE 2.4 |
| Harm types (allocational/representational) | MEASURE 2.11 |

## Backend — applying NIST patch

See `backend/nist_patch.py` for Pydantic model additions required.

3 Pydantic changes needed:
1. `context.lifecycle_stage` (LifecycleStageEnum)
2. `context.risk_tolerance` (RiskToleranceEnum)
3. `incident_response.decommission_plan` (DecommissionPlanEnum)

4 fields handled via `api.js` mapping only (no backend change):
- `model_susceptibility` ← drift question
- `adversarial_testing_performed` ← adversarial question
- `explanation_quality` ← explainability question
- `allocational_harm`, `representational_harm` ← harm type dropdown

## Deploy

```bash
# Cloud Shell
source ~/cyberandlegal-lab/load_secrets.sh
cd ~/cyberandlegal-lab && npm run build
firebase deploy --project cyberandlegal-lab
```

## Backend URL

`https://cyberandlegal-backend-373426633543.europe-west4.run.app`
