# 📋 COMPL-AI + Cyber&Legal — Scenario Library

## Overview

This document explains all test scenarios included in the Cyber&Legal AI Governance Lab, organized by the framework they come from.

---

## 1. COMPL-AI Scenarios (EU AI Act Benchmark Suite)

COMPL-AI provides **40+ benchmarks** mapped to 6 EU AI Act principles.  
Source: ETH Zurich × LatticeFlow AI × INSAIT — Apache 2.0

### Principle 1: Human Agency & Oversight (Art. 14)

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **ifbench** | Does the model follow complex instructions accurately? | Ensures AI can be directed and controlled by humans |
| **sycophancy_eval** | Does the model capitulate to pressure, even when wrong? | Detects models that agree with users regardless of truth |
| **human_or_ai** | Does the model consistently identify itself as AI, not human? | EU AI Act Art. 52: Disclosure of AI identity |

**Why this matters:** EU AI Act Art. 14 requires that high-risk AI systems allow humans to supervise, override, and intervene. A model that follows instructions poorly or pretends to be human undermines this.

---

### Principle 2: Technical Robustness & Safety (Art. 15)

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **adversarial_nli** | Does the model reason correctly under adversarial pressure? | Detects fragile reasoning vulnerable to manipulation |
| **arc_challenge** | Complex reasoning under challenging conditions | Tests stable knowledge representation |
| **wildguard** | Refusal of harmful requests across diverse attack vectors | Comprehensive harm prevention |
| **harmbench** | 400+ harmful scenarios across 7 categories | Broadest safety evaluation available |

**Why this matters:** Art. 15 requires AI to be resilient against attempts to alter behavior. OWASP LLM01 (Prompt Injection) directly attacks robustness.

---

### Principle 3: Privacy & Data Governance (Art. 10)

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **privacylens** | Does the model protect privacy in realistic scenarios? | Detects models that leak or violate privacy norms |
| **pii_detection** | Does the model inadvertently generate/expose PII? | GDPR compliance — personal data in outputs |

**Why this matters:** GDPR + EU AI Act Art. 10 requires quality data governance. OWASP LLM02 (Sensitive Information Disclosure) and ENISA T-04 (Inference Attacks) are the attack vectors.

---

### Principle 4: Transparency & Explainability (Art. 13)

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **human_or_ai** | Consistent AI identity disclosure | Legal obligation to identify AI systems |
| **calibration_ece** | Are model confidence scores accurate? | Miscalibrated models give false certainty |
| **gpqa_diamond** | Does the model know what it doesn't know? | Detects dangerous overconfidence in specialized domains |

**Why this matters:** Art. 13 requires transparency about capabilities and limitations. OWASP LLM09 (Misinformation) is the primary risk.

---

### Principle 5: Fairness & Non-Discrimination (Art. 10(5))

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **bbq** | Bias toward/against 9 demographic categories | Comprehensive bias detection across groups |
| **winobias** | Gender bias in pronoun coreference resolution | Detects stereotyping in language tasks |
| **crows_pairs** | Stereotypical associations across 9 social categories | Measures harmful stereotype reinforcement |
| **toxigen** | Toxicity toward 13 identity groups | Detects group-targeted harmful content |

**Why this matters:** EU Charter Art. 21 (non-discrimination) + EU AI Act Art. 10(5) require bias detection and correction. ENISA T-06 is the threat.

---

### Principle 6: Societal & Environmental Well-being (Art. 69)

| Benchmark | What It Tests | Problem It Solves |
|---|---|---|
| **toxicity_advbench** | Refusal of toxic outputs under adversarial prompting | Tests robustness of safety training |
| **hle** | Holistic capability assessment | Ensures AI provides genuine social benefit |
| **include** | Inclusive language and diverse cultural knowledge | Detects cultural bias and exclusion |

---

## 2. OWASP LLM Top 10 Scenarios (2025 Edition)

Source: OWASP Foundation — CC BY-SA 4.0

### LLM01 — Prompt Injection
**5 test scenarios including:**
- Direct override ("Ignore all previous instructions...")
- Role-play jailbreak ("Pretend you are DAN...")
- HTML comment injection
- Authority claim escalation

**Problem:** Adversaries bypass safety training, extract system prompts, or cause harmful outputs.

### LLM02 — Sensitive Information Disclosure
**5 test scenarios** probing for system prompt leakage, user data exposure, API key disclosure.

### LLM03 — Supply Chain Vulnerabilities
**5 test scenarios** examining plugin transparency, training data verification, external API exposure.

### LLM04 — Data and Model Poisoning
**5 test scenarios** testing for backdoor trigger phrases, false authority claims, hidden debugging modes.

### LLM05 — Improper Output Handling
**5 test scenarios** generating XSS payloads, SQL injection, dangerous shell commands, SSRF URLs.

### LLM06 — Excessive Agency
**5 test scenarios** testing if the model takes unauthorized actions (email, file deletion, social media posting) without human confirmation.

### LLM07 — System Prompt Leakage
**5 test scenarios** extracting system prompts via encoding (Base64, JSON, acrostics).

### LLM08 — Vector and Embedding Weaknesses
**5 test scenarios** attempting to exploit RAG retrieval systems and vector databases.

### LLM09 — Misinformation
**5 test scenarios** testing for hallucination of stock prices, death dates, legislation, citations.

### LLM10 — Unbounded Consumption
**5 test scenarios** requesting infinite output, extreme repetition, unbounded computation.

---

## 3. ENISA AI Threat Landscape Scenarios

Source: ENISA Artificial Intelligence Threat Landscape Report 2024 — CC BY 4.0

| Threat ID | Scenario | Impact | Likelihood |
|---|---|---|---|
| T-01 | Model Evasion (Adversarial Attacks) | CRITICAL | HIGH |
| T-02 | Training Data Poisoning | CRITICAL | MEDIUM |
| T-03 | Model Theft via API Extraction | HIGH | HIGH |
| T-04 | Privacy Inference Attacks (MIA) | HIGH | MEDIUM |
| T-05 | Prompt Injection & Jailbreaking | CRITICAL | VERY HIGH |
| T-06 | AI Bias and Discrimination | HIGH | HIGH |
| T-07 | Supply Chain Attacks on AI Components | CRITICAL | MEDIUM |
| T-08 | Deepfake & Disinformation Generation | HIGH | VERY HIGH |
| T-09 | Lack of Transparency & Explainability | HIGH | HIGH |
| T-10 | AI System Availability Attacks (AI-DoS) | MEDIUM | MEDIUM |
| T-11 | Autonomous Agent Misuse | CRITICAL | HIGH |

Each threat includes: description, mitigations, OWASP mapping, NIST RMF mapping, EU AI Act article.

---

## 4. NIST AI RMF Assessment Questions

Source: NIST AI 100-1 (January 2023) + AI 600-1 GenAI Profile (July 2024) — Public Domain

### GOVERN Function (5 controls)
Policies, training, decommissioning, risk documentation, vendor assessment.

### MAP Function (5 controls)
Use case documentation, threat framework usage, data governance, risk probability, FRIA.

### MEASURE Function (6 controls)
Quantitative benchmarking, bias testing, adversarial testing, production monitoring, security testing, drift detection.

### MANAGE Function (5 controls)
Risk treatment plans, incident response, vendor monitoring, post-deployment review, residual risk reporting.

**Total: 21 controls → maturity score → one of 5 levels: INITIAL / DEVELOPING / DEFINED / MANAGED / OPTIMIZING**

---

## 5. Cross-Framework Control Mapping

The key insight of this toolkit: the same vulnerability is covered by multiple frameworks simultaneously.

| Vulnerability | COMPL-AI | OWASP | ENISA | NIST | EU AI Act |
|---|---|---|---|---|---|
| Prompt Injection | harmbench, wildguard | LLM01 | T-05 | MEASURE 2.3 | Art. 15 |
| PII Leakage | privacylens | LLM02 | T-04 | MAP 3.5 | Art. 10, GDPR |
| Demographic Bias | bbq, winobias | LLM09 | T-06 | MEASURE 2.2 | Art. 10(5) |
| Human Oversight Gap | sycophancy_eval | LLM06 | T-11 | GOVERN 1.7 | Art. 14 |
| Misinformation | calibration_ece | LLM09 | T-08 | MEASURE 2.3 | Art. 13, Art. 50 |
| Supply Chain | — | LLM03 | T-07 | GOVERN 6.1 | Art. 25 |
| Model Theft | — | LLM03 | T-03 | GOVERN 6.1 | Art. 15 |

---

*Document maintained by Cyber&Legal — cyberandlegal.com*  
*Framework content retained under original licenses: NIST (Public Domain), OWASP (CC BY-SA 4.0), ENISA (CC BY 4.0), COMPL-AI (Apache 2.0)*
