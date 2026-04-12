# 🗺️ Cross-Framework Control Mapping
## Cyber&Legal · AI Governance Lab

> **Purpose:** This document shows how the same AI risk is covered simultaneously across EU AI Act, NIST AI RMF, OWASP LLM Top 10, ENISA, and ISO 42001. Use this to avoid duplicate work and maximize compliance coverage with each control implemented.

---

## How to Read This Table

Each row is a **specific AI risk or requirement**. The columns show where that requirement appears in each framework. Implementing one control can satisfy multiple frameworks at once.

**Coverage levels:**
- ✅ **Primary** — this framework defines the core requirement
- ⚠️ **Referenced** — this framework mentions or implies the requirement
- ➖ **Not covered** — outside this framework's scope

---

## Master Cross-Framework Mapping Table

| Risk / Requirement | EU AI Act | NIST AI RMF | OWASP LLM | ENISA | ISO 42001 | COMPL-AI Benchmark |
|---|---|---|---|---|---|---|
| **Human oversight of AI decisions** | Art. 14 ✅ | GOVERN-1.7 ✅ | LLM06 ⚠️ | T-11 ⚠️ | Clause 6.1.2 ✅ | sycophancy_eval, ifbench |
| **Prompt injection prevention** | Art. 15 ✅ | MEASURE-2.3 ✅ | LLM01 ✅ | T-05 ✅ | Annex A.6 ⚠️ | harmbench, wildguard |
| **PII / sensitive data protection** | Art. 10 + GDPR ✅ | MAP-3.5 ✅ | LLM02 ✅ | T-04 ✅ | Clause 8.3 ✅ | privacylens, pii_detection |
| **Bias and fairness testing** | Art. 10(5) ✅ | MEASURE-2.2 ✅ | LLM09 ⚠️ | T-06 ✅ | Clause 8.4.2 ✅ | bbq, winobias, crows_pairs |
| **AI identity transparency** | Art. 13 + Art. 50 ✅ | GOVERN-1.5 ✅ | LLM09 ⚠️ | T-09 ✅ | Clause 7.4 ✅ | human_or_ai, mask |
| **Third-party / supply chain** | Art. 25 ✅ | GOVERN-6.1 ✅ | LLM03 ✅ | T-07 ✅ | Clause 8.4.3 ✅ | — |
| **Adversarial robustness** | Art. 15 ✅ | MEASURE-2.3 ✅ | LLM01, LLM05 ✅ | T-01 ✅ | Annex A.6 ⚠️ | adversarial_nli, arc_challenge |
| **Training data poisoning** | Art. 10 ✅ | MAP-3.5 ✅ | LLM04 ✅ | T-02 ✅ | Clause 8.3 ✅ | — |
| **Model theft / extraction** | Art. 15 ⚠️ | MEASURE-2.6 ✅ | LLM03 ✅ | T-03 ✅ | Annex A.9 ⚠️ | — |
| **Misinformation / hallucination** | Art. 13 ✅ | MEASURE-2.3 ✅ | LLM09 ✅ | T-08 ✅ | Clause 8.2 ✅ | simpleqa_verified, calibration_ece |
| **System prompt leakage** | Art. 13 ⚠️ | GOVERN-1.5 ⚠️ | LLM07 ✅ | T-03 ⚠️ | Clause 7.5 ⚠️ | mask |
| **Excessive agent autonomy** | Art. 14 ✅ | GOVERN-1.7 ✅ | LLM06 ✅ | T-11 ✅ | Clause 6.1.2 ✅ | instruction_goal_hijacking |
| **DoS / availability attacks** | Art. 15 ⚠️ | MANAGE-4.1 ✅ | LLM10 ✅ | T-10 ✅ | Annex A.6 ⚠️ | — |
| **Incident response** | Art. 62 ✅ | MANAGE-2.2 ✅ | LLM07 ⚠️ | T-10 ⚠️ | Clause 10.2 ✅ | — |
| **AI governance policy** | Art. 9 ✅ | GOVERN-1.1 ✅ | — ➖ | — ➖ | Clause 5.2 ✅ | — |
| **Risk management system** | Art. 9 ✅ | MAP-5.1 ✅ | — ➖ | — ➖ | Clause 6.1 ✅ | — |
| **Technical documentation** | Art. 11 ✅ | GOVERN-1.5 ⚠️ | — ➖ | — ➖ | Clause 7.5 ✅ | — |
| **Post-market monitoring** | Art. 72 ✅ | MANAGE-4.1 ✅ | — ➖ | T-01 ⚠️ | Clause 9.1 ✅ | — |
| **Deepfake / synthetic content** | Art. 50 ✅ | GOVERN-1.5 ⚠️ | LLM09 ⚠️ | T-08 ✅ | Clause 8.2 ⚠️ | — |
| **AI literacy / training** | Art. 4 ✅ | GOVERN-2.2 ✅ | — ➖ | — ➖ | Clause 7.2 ✅ | — |

---

## Framework Profiles — What Each Covers Best

### EU AI Act
**Type:** Binding law (regulation)
**Best for:** Legal compliance, market access requirements, penalty avoidance
**Unique to EU AI Act:** Risk classification system (Unacceptable/High/Limited/Minimal), GPAI model obligations, FRIA requirement, mandatory registration
**Does NOT cover:** Technical implementation details — it says *what*, not *how*

### NIST AI RMF (AI 100-1 + AI 600-1)
**Type:** Voluntary framework (but referenced in US federal procurement)
**Best for:** Operational AI risk management, organizational maturity assessment
**Unique to NIST:** Four-function model (GOVERN/MAP/MEASURE/MANAGE), GenAI-specific risk taxonomy (12 categories in AI 600-1), maturity levels
**Does NOT cover:** Binding legal requirements, specific penalties

### OWASP LLM Top 10 (2025)
**Type:** Community security standard
**Best for:** Technical security testing, developer-facing vulnerability prioritization
**Unique to OWASP:** Ranked vulnerability list with attack vectors and CWE mappings, red-team test cases, hands-on technical mitigations
**Does NOT cover:** Organizational governance, data quality, societal impacts

### ENISA AI Threat Landscape
**Type:** European agency advisory
**Best for:** Threat modeling, attack scenario planning, security risk assessment
**Unique to ENISA:** Physical-world attack coverage, geopolitical context, EU-specific threat intelligence
**Does NOT cover:** Organizational governance, compliance certification

### ISO/IEC 42001:2023
**Type:** Certifiable international standard
**Best for:** Third-party certification, enterprise governance, auditable AIMS
**Unique to ISO 42001:** Plan-Do-Check-Act lifecycle, certifiable by accredited auditors, aligns with ISO 27001 and ISO 9001
**Does NOT cover:** Specific technical test methods, regulatory enforcement

---

## Efficiency Map — Controls Satisfying Multiple Frameworks

**Implementing these 5 controls gives maximum cross-framework coverage:**

### 1. Adversarial Testing / Red-Teaming
Satisfies: EU AI Act Art. 15 + NIST MEASURE-2.3 + OWASP LLM01/LLM05 + ENISA T-01/T-05 + ISO Annex A.6
**Tool:** COMPL-AI `harmbench`, `wildguard`, `strong_reject`

### 2. Bias and Fairness Benchmarking
Satisfies: EU AI Act Art. 10(5) + NIST MEASURE-2.2 + OWASP LLM09 + ENISA T-06 + ISO 42001 Clause 8.4.2
**Tool:** COMPL-AI `bbq`, `winobias`, `crows_pairs`, `toxigen`

### 3. Human Oversight Controls
Satisfies: EU AI Act Art. 14 + NIST GOVERN-1.7 + OWASP LLM06 + ENISA T-11 + ISO 42001 Clause 6.1.2
**Tool:** COMPL-AI `sycophancy_eval`, `instruction_goal_hijacking`

### 4. Data Governance and Privacy
Satisfies: EU AI Act Art. 10 + GDPR + NIST MAP-3.5 + OWASP LLM02 + ENISA T-04 + ISO 42001 Clause 8.3
**Tool:** COMPL-AI `privacylens`, `pii_detection`

### 5. Supply Chain Risk Management
Satisfies: EU AI Act Art. 25 + NIST GOVERN-6.1 + OWASP LLM03 + ENISA T-07 + ISO 42001 Clause 8.4.3
**Tool:** AI Bill of Materials (AIBOM), vendor assessment questionnaire

---

## License Compliance Summary

| Framework Data Used | Source License | Our Usage | Conditions |
|---|---|---|---|
| COMPL-AI benchmarks | Apache 2.0 | Wrapper/integration | Attribution required |
| NIST AI RMF | Public Domain (U.S. Gov) | Full reproduction allowed | None |
| OWASP LLM Top 10 | CC BY-SA 4.0 | Referenced, paraphrased | Attribution + ShareAlike |
| ENISA Threat Landscape | CC BY 4.0 | Referenced, adapted | Attribution |
| ISO/IEC 42001 | Proprietary | Self-assessment questions only | Cannot reproduce standard text |
| YDC AIGOV Framework | CC BY-NC 4.0 | Non-commercial reference | Attribution + NonCommercial |

---

*Document maintained by Cyber&Legal — cyberandlegal.com*
*Last updated: 2025 | Apache 2.0*
