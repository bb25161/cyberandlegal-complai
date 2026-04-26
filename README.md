# Cyber&Legal Lab — Trustworthy AI Governance Platform.

Cyber&Legal Lab is an AI governance and risk assessment platform designed to help organizations evaluate, monitor, and improve AI systems in alignment with:

* EU AI Act
* NIST AI RMF
* OWASP LLM Top 10

The platform combines **declarative risk assessment** with a roadmap toward **evidence-based validation**, enabling transparent and explainable AI governance.

---

# 1. Core Value Proposition

The platform distinguishes between:

* **Declarative Assessment**
  (What organizations claim about their AI systems)

* **Evidence-Based Validation (Planned)**
  (What the system actually demonstrates through testing)

This separation is critical to avoid **false assurance** and ensure **trustworthy AI governance**.

---

# 2. Architecture Overview

```
www.cyberandlegal.com        → Framer (Marketing)
lab.cyberandlegal.com        → Firebase Hosting (React SPA)
                             → Cloud Run Backend (FastAPI)
                             → (Planned) Evaluation Layer
```

---

# 3. Technology Stack

| Layer          | Technology                                 |
| -------------- | ------------------------------------------ |
| Frontend       | React 18, Vite, Firebase Hosting           |
| Authentication | Firebase Auth (Email + Google)             |
| Backend        | FastAPI (Python), Cloud Run (europe-west4) |
| Secrets        | Google Secret Manager                      |
| CI/CD          | GitHub Actions (Auto Deploy)               |
| Future Data    | Firestore / BigQuery                       |
| Future AI      | Vertex AI / OpenAI / Anthropic             |

---

# 4. System Flow

```
User Input
 → EU AI Act Screening
 → AI Risk Assessment (NIST-based)
 → Evidence Layer (Planned)
 → Risk Scoring
 → Role-Based Interpretation
 → Report Output
```

---

# 5. Frontend Structure

```
lab-frontend/src/
├── App.jsx
├── components/
│   └── EUScreening.jsx
├── pages/
│   ├── AuthPage.jsx
│   ├── DashboardPage.jsx
│   ├── AssessmentPage.jsx
│   └── ReportPage.jsx
├── lib/
│   ├── api.js
│   ├── i18n.js
│   └── firebase.js
└── hooks/
    └── useAuth.jsx
```

---

# 6. Compliance Coverage

## 6.1 EU AI Act

Implemented via screening logic:

* AI system definition (Art. 3)
* Exemptions (Art. 2(3))
* Role classification (Provider / Deployer / Importer)
* Prohibited AI (Art. 5)
* High-risk classification (Art. 6 + Annex III)
* Transparency obligations (Art. 50)
* GPAI obligations (Art. 51–55)

---

## 6.2 NIST AI RMF

Mapped to structured assessment inputs:

| Area                | Reference            |
| ------------------- | -------------------- |
| Lifecycle Stage     | MAP 1.4              |
| Risk Tolerance      | MAP 1.5 / GOVERN 1.3 |
| Drift Monitoring    | MEASURE 2.4          |
| Explainability      | MEASURE 2.9          |
| Adversarial Testing | MEASURE 2.7          |
| Decommissioning     | GOVERN 1.7           |
| Harm Types          | MEASURE 2.11         |

---

## 6.3 OWASP LLM Top 10

Planned coverage includes:

* Prompt Injection
* Data Leakage
* Model Misuse
* Hallucination Risks
* Insecure Output Handling

---

# 7. Evidence Layer (Planned)

The platform is designed to evolve into a **test-driven governance system**.

Future capabilities:

* Prompt testing (Prompt-based evaluation)
* Model evaluation (benchmark testing)
* Compliance validation (policy checks)
* Security testing (OWASP alignment)

Current state:

> Risk scoring is primarily based on structured input (declarative model)

---

# 8. Backend Notes

NIST-related extensions are implemented in:

```
backend/nist_patch.py
```

### Key data fields:

* lifecycle_stage
* risk_tolerance
* decommission_plan

Mapped fields (frontend-driven):

* model_susceptibility
* adversarial_testing_performed
* explanation_quality
* harm classification

---

# 9. CI/CD Pipeline

Automated deployment via GitHub Actions:

```
GitHub
 → Build (Vite)
 → Firebase Hosting deploy
 → Docker build
 → Cloud Run deploy
```

---

# 10. Deployment

## Frontend

```
firebase deploy --project cyberandlegal-lab
```

## Backend

```
gcloud run deploy cyberandlegal-backend \
  --region europe-west4
```

---

# 11. Backend Endpoint

```
https://cyberandlegal-backend-373426633543.europe-west4.run.app
```

---

# 12. Design Principles

* Transparency over black-box scoring
* Separation of claim vs evidence
* Role-based interpretation (CISO, Legal, Engineering, etc.)
* Alignment with regulatory and technical standards
* Scalable architecture for AI lifecycle governance

---

# 13. Roadmap

## Phase 1 (Current)

* EU AI Act screening
* NIST-based assessment
* Role-based reporting

## Phase 2

* Evidence Layer activation
* Firestore integration
* Persistent audit logging

## Phase 3

* RAG-based regulatory intelligence
* Advanced evaluation pipelines
* Benchmarking & analytics

---

# 14. Disclaimer

This platform provides AI governance insights and risk analysis.
It does not replace legal advice or formal regulatory certification.

---

# 15. Vision

Cyber&Legal Lab aims to become a **trust layer for AI systems**, enabling organizations to:

* Understand AI risks
* Demonstrate compliance
* Build trustworthy AI systems
* Bridge technical, legal, and governance domains

---

**Trustworthy AI is not declared — it is demonstrated.**
