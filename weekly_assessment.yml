"""
assessments/enisa_threat_evaluator.py
Cyber&Legal · ENISA AI Threat Landscape Assessment
====================================================
Maps your AI system against ENISA's AI Threat Landscape (2023-2024).
Source: ENISA "Artificial Intelligence Cybersecurity Challenges" + 
        "AI Threat Landscape Report 2024"
        https://www.enisa.europa.eu/topics/artificial-intelligence

Usage:
    python assessments/enisa_threat_evaluator.py --interactive
    python assessments/enisa_threat_evaluator.py --output reports/output/enisa_assessment.json
"""

import json
import argparse
import datetime
from pathlib import Path

# ─── ENISA AI Threat Categories (2024) ───────────────────────────────────────
# Source: ENISA Artificial Intelligence Threat Landscape
# License: CC BY 4.0 — https://www.enisa.europa.eu

ENISA_THREATS = {
    "T-01": {
        "title": "AI Model Evasion (Adversarial Attacks)",
        "category": "Integrity",
        "description": (
            "Adversaries craft inputs designed to fool AI models into making incorrect predictions. "
            "Includes image perturbations, text adversarial examples, and prompt-based evasion."
        ),
        "impact": "CRITICAL",
        "likelihood": "HIGH",
        "owasp_mapping": "LLM01, LLM05",
        "nist_rmf": "MEASURE 2.3, MEASURE 2.5",
        "eu_ai_act": "Art. 15 (Accuracy, Robustness, Cybersecurity)",
        "mitigations": [
            "Adversarial training and input preprocessing",
            "Ensemble methods and model diversity",
            "Input validation and anomaly detection",
            "Regular red-team exercises",
        ],
        "assessment_questions": [
            {
                "q": "Do you perform adversarial robustness testing (e.g., FGSM, PGD, AutoAttack) on your models?",
                "options": ["Yes, automated", "Manually", "No"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "q": "Do you have input validation and anomaly detection in production?",
                "options": ["Yes, real-time detection", "Manual monitoring", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-02": {
        "title": "AI Poisoning (Training Data Manipulation)",
        "category": "Integrity",
        "description": (
            "Attackers manipulate training data to corrupt model behavior, "
            "embed backdoors, or degrade model performance on target inputs."
        ),
        "impact": "CRITICAL",
        "likelihood": "MEDIUM",
        "owasp_mapping": "LLM04",
        "nist_rmf": "MAP 3.5, MEASURE 2.7",
        "eu_ai_act": "Art. 10 (Data Governance and Quality)",
        "mitigations": [
            "Data provenance and supply chain verification",
            "Statistical anomaly detection in training data",
            "Differential privacy in training",
            "Robust aggregation methods (for federated learning)",
        ],
        "assessment_questions": [
            {
                "q": "Do you verify training data provenance and detect anomalies before training?",
                "options": ["Yes, formal data auditing", "Basic checks", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Do you use differential privacy or other poison-resistant training techniques?",
                "options": ["Yes", "Exploring", "No"],
                "weights": [1.0, 0.3, 0.0],
            },
        ],
    },
    "T-03": {
        "title": "AI Model Theft and Extraction",
        "category": "Confidentiality",
        "description": (
            "Adversaries steal proprietary model functionality through repeated API queries, "
            "enabling knockoff models or exposing intellectual property."
        ),
        "impact": "HIGH",
        "likelihood": "HIGH",
        "owasp_mapping": "LLM03",
        "nist_rmf": "GOVERN 6.1, MEASURE 2.6",
        "eu_ai_act": "Art. 15 (Cybersecurity)",
        "mitigations": [
            "API rate limiting and anomaly detection",
            "Query watermarking",
            "Output perturbation to prevent reconstruction",
            "Access controls and authentication",
        ],
        "assessment_questions": [
            {
                "q": "Do you implement API rate limiting and monitoring for model extraction patterns?",
                "options": ["Yes, automated detection", "Basic rate limiting", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-04": {
        "title": "AI Inference Attacks (Privacy Violations)",
        "category": "Confidentiality",
        "description": (
            "Adversaries use model outputs to infer sensitive information about "
            "training data individuals (membership inference, attribute inference, data reconstruction)."
        ),
        "impact": "HIGH",
        "likelihood": "MEDIUM",
        "owasp_mapping": "LLM02, LLM06",
        "nist_rmf": "MAP 3.5, MEASURE 2.6",
        "eu_ai_act": "Art. 10 (Privacy), GDPR Art. 22",
        "mitigations": [
            "Differential privacy in training",
            "Output sanitization and confidence score rounding",
            "Membership inference testing before deployment",
            "Data minimization in training",
        ],
        "assessment_questions": [
            {
                "q": "Have you tested your model for membership inference and attribute inference vulnerabilities?",
                "options": ["Yes, formal testing", "Some testing", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Do you apply differential privacy or output sanitization to protect training data?",
                "options": ["Yes", "Partially", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-05": {
        "title": "Prompt Injection and Jailbreaking",
        "category": "Integrity",
        "description": (
            "Malicious inputs manipulate LLM behavior to bypass safety measures, "
            "override system prompts, or cause the model to produce harmful outputs."
        ),
        "impact": "CRITICAL",
        "likelihood": "VERY HIGH",
        "owasp_mapping": "LLM01, LLM07",
        "nist_rmf": "MEASURE 2.3, MANAGE 2.2",
        "eu_ai_act": "Art. 15 (Robustness and Cybersecurity)",
        "mitigations": [
            "Input validation and sanitization pipeline",
            "Instruction hierarchy enforcement",
            "Output filtering and content classifiers",
            "Regular jailbreak testing using HarmBench, WildGuard",
        ],
        "assessment_questions": [
            {
                "q": "Do you regularly test for prompt injection and jailbreak vulnerabilities?",
                "options": ["Yes, automated red-teaming", "Manual testing", "No testing"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "q": "Do you have output filtering to block harmful content in production?",
                "options": ["Yes, real-time filtering", "Post-hoc review", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-06": {
        "title": "AI Bias and Discrimination",
        "category": "Fairness",
        "description": (
            "AI systems systematically disadvantage protected groups due to biased training data, "
            "flawed model design, or discriminatory deployment decisions."
        ),
        "impact": "HIGH",
        "likelihood": "HIGH",
        "owasp_mapping": "LLM09",
        "nist_rmf": "MEASURE 2.2, GOVERN 4.1",
        "eu_ai_act": "Art. 10(5) (Bias detection and correction), Charter Art. 21",
        "mitigations": [
            "Bias audits using BBQ, WinoBias, CrowS-Pairs",
            "Disparate impact analysis by demographic group",
            "Fairness-aware training and post-processing",
            "Human rights impact assessment",
        ],
        "assessment_questions": [
            {
                "q": "Do you regularly audit AI outputs for demographic bias and discriminatory patterns?",
                "options": ["Yes, automated bias testing", "Manual review", "No auditing"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Have you conducted a Fundamental Rights Impact Assessment (FRIA)?",
                "options": ["Yes, completed", "In progress", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-07": {
        "title": "Supply Chain Attacks on AI Components",
        "category": "Integrity",
        "description": (
            "Adversaries compromise third-party AI models, datasets, libraries, "
            "or ML frameworks used in AI system development or deployment."
        ),
        "impact": "CRITICAL",
        "likelihood": "MEDIUM",
        "owasp_mapping": "LLM03",
        "nist_rmf": "GOVERN 6.1, MAP 5.1",
        "eu_ai_act": "Art. 25 (Responsibilities of importers and distributors)",
        "mitigations": [
            "Software Bill of Materials (SBOM/AIBOM) for AI components",
            "Model card and dataset card verification",
            "Cryptographic signing of model artifacts",
            "Dependency vulnerability scanning",
        ],
        "assessment_questions": [
            {
                "q": "Do you maintain an AI Bill of Materials (AIBOM) for all third-party AI components?",
                "options": ["Yes, full AIBOM", "Partial tracking", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Do you verify the integrity and safety of third-party models before deployment?",
                "options": ["Yes, formal vetting", "Basic checks", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
        ],
    },
    "T-08": {
        "title": "Disinformation and Deepfake Generation",
        "category": "Societal",
        "description": (
            "AI systems are weaponized to generate synthetic but convincing false information, "
            "deepfake media, or coordinated inauthentic content at scale."
        ),
        "impact": "HIGH",
        "likelihood": "VERY HIGH",
        "owasp_mapping": "LLM09",
        "nist_rmf": "GOVERN 1.5, MEASURE 2.3",
        "eu_ai_act": "Art. 50 (Transparency for synthetic content), Art. 5(f) (deepfakes)",
        "mitigations": [
            "C2PA content provenance and watermarking",
            "Deepfake detection classifiers",
            "AI output labeling per EU AI Act Art. 50",
            "Terms of service enforcement against misuse",
        ],
        "assessment_questions": [
            {
                "q": "Do you label or watermark AI-generated content (text, images, audio) per EU AI Act Art. 50?",
                "options": ["Yes, mandatory labeling", "Optional labeling", "No labeling"],
                "weights": [1.0, 0.3, 0.0],
            },
        ],
    },
    "T-09": {
        "title": "Lack of AI Transparency and Explainability",
        "category": "Transparency",
        "description": (
            "AI systems operate as black boxes, making it impossible for users, "
            "regulators, or affected parties to understand decisions or appeal outcomes."
        ),
        "impact": "HIGH",
        "likelihood": "HIGH",
        "owasp_mapping": "LLM09",
        "nist_rmf": "GOVERN 1.5, MEASURE 1.1",
        "eu_ai_act": "Art. 13 (Transparency), Art. 14 (Human Oversight)",
        "mitigations": [
            "SHAP, LIME, or attention-based explainability",
            "Audit logs for all AI decisions",
            "Model cards and system cards published",
            "User-facing explanation of AI decisions",
        ],
        "assessment_questions": [
            {
                "q": "Can you explain AI decisions to affected users in plain language?",
                "options": ["Yes, automated explanations", "On request", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Do you maintain comprehensive audit logs of all AI-assisted decisions?",
                "options": ["Yes, immutable audit logs", "Basic logging", "No"],
                "weights": [1.0, 0.5, 0.0],
            },
        ],
    },
    "T-10": {
        "title": "AI System Availability Attacks (AI-DoS)",
        "category": "Availability",
        "description": (
            "Adversaries degrade or disable AI systems through sponge attacks, "
            "resource exhaustion, or model-targeted denial of service."
        ),
        "impact": "MEDIUM",
        "likelihood": "MEDIUM",
        "owasp_mapping": "LLM10",
        "nist_rmf": "MANAGE 4.1, MEASURE 2.5",
        "eu_ai_act": "Art. 15 (Robustness and Cybersecurity)",
        "mitigations": [
            "Request rate limiting and circuit breakers",
            "Compute budget enforcement per query",
            "DDoS protection at API gateway",
            "Model serving infrastructure scaling",
        ],
        "assessment_questions": [
            {
                "q": "Do you have DoS protection specifically for your AI inference endpoints?",
                "options": ["Yes, AI-specific protection", "Generic DDoS protection", "No"],
                "weights": [1.0, 0.5, 0.0],
            },
        ],
    },
    "T-11": {
        "title": "Autonomous AI Agent Misuse",
        "category": "Integrity",
        "description": (
            "Agentic AI systems perform unintended, harmful, or unauthorized actions "
            "due to excessive permissions, missing oversight, or manipulation by adversaries."
        ),
        "impact": "CRITICAL",
        "likelihood": "HIGH",
        "owasp_mapping": "LLM06",
        "nist_rmf": "GOVERN 1.7, MAP 5.2",
        "eu_ai_act": "Art. 14 (Human Oversight), Art. 9 (Risk Management)",
        "mitigations": [
            "Principle of least privilege for agent tool access",
            "Human-in-the-loop for high-impact actions",
            "Agent action logging and audit trail",
            "Sandboxing and containment of agent environments",
        ],
        "assessment_questions": [
            {
                "q": "Do AI agents operate with minimum necessary permissions (least privilege)?",
                "options": ["Yes, enforced", "Partially", "No"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "q": "Are high-impact agent actions gated behind human approval?",
                "options": ["Yes, always", "For critical actions", "No"],
                "weights": [1.0, 0.5, 0.0],
            },
        ],
    },
}


def run_enisa_assessment(interactive: bool = True) -> dict:
    """Run ENISA threat assessment questionnaire."""
    answers = {}

    if interactive:
        print("\n" + "="*65)
        print("  CYBER&LEGAL · ENISA AI THREAT LANDSCAPE ASSESSMENT")
        print("  Based on ENISA AI Threat Landscape Report 2024")
        print("  License: CC BY 4.0 — enisa.europa.eu")
        print("="*65)

    threat_scores = {}

    for tid, threat in ENISA_THREATS.items():
        question_scores = []

        if interactive:
            print(f"\n  {'─'*60}")
            print(f"  [{tid}] {threat['title']}")
            print(f"  Impact: {threat['impact']}  |  Likelihood: {threat['likelihood']}")
            print(f"  {threat['description']}")

        for i, aq in enumerate(threat["assessment_questions"]):
            if interactive:
                print(f"\n  Q{i+1}: {aq['q']}")
                for j, opt in enumerate(aq["options"]):
                    print(f"    {j+1}. {opt}")

                while True:
                    try:
                        choice = int(input("  Your answer: ").strip()) - 1
                        if 0 <= choice < len(aq["options"]):
                            score = aq["weights"][choice]
                            question_scores.append(score)
                            answers[f"{tid}_Q{i+1}"] = {"answer": aq["options"][choice], "score": score}
                            break
                    except (ValueError, KeyboardInterrupt):
                        pass
            else:
                # Default to worst case for non-interactive
                question_scores.append(0.0)

        avg = sum(question_scores) / len(question_scores) if question_scores else 0

        # Risk score = inverse of mitigation score × impact weight
        impact_weight = {"CRITICAL": 1.0, "HIGH": 0.75, "MEDIUM": 0.5, "LOW": 0.25}.get(threat["impact"], 0.5)
        residual_risk = (1 - avg) * impact_weight

        threat_scores[tid] = {
            "title": threat["title"],
            "category": threat["category"],
            "impact": threat["impact"],
            "likelihood": threat["likelihood"],
            "owasp_mapping": threat["owasp_mapping"],
            "eu_ai_act": threat["eu_ai_act"],
            "mitigation_score": round(avg, 3),
            "residual_risk_score": round(residual_risk, 3),
            "risk_level": (
                "LOW" if residual_risk < 0.2 else
                "MEDIUM" if residual_risk < 0.4 else
                "HIGH" if residual_risk < 0.7 else
                "CRITICAL"
            ),
            "recommended_mitigations": threat["mitigations"],
        }

    # Compute overall
    all_residual = [v["residual_risk_score"] for v in threat_scores.values()]
    avg_residual = sum(all_residual) / len(all_residual)

    critical_threats = [tid for tid, v in threat_scores.items() if v["risk_level"] == "CRITICAL"]

    return {
        "meta": {
            "tool": "Cyber&Legal · ENISA Threat Assessor",
            "standard": "ENISA AI Threat Landscape Report 2024",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        },
        "overall_residual_risk": round(avg_residual, 3),
        "risk_rating": (
            "LOW RISK" if avg_residual < 0.2 else
            "MEDIUM RISK" if avg_residual < 0.4 else
            "HIGH RISK" if avg_residual < 0.6 else
            "CRITICAL RISK"
        ),
        "critical_threats": critical_threats,
        "threats": threat_scores,
    }


def main():
    parser = argparse.ArgumentParser(description="Cyber&Legal · ENISA AI Threat Assessor")
    parser.add_argument("--interactive", action="store_true", default=True)
    parser.add_argument("--output", default="reports/output/enisa_assessment.json")
    args = parser.parse_args()

    result = run_enisa_assessment(args.interactive)

    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    with open(args.output, "w") as f:
        json.dump(result, f, indent=2)

    print(f"\n  ENISA Residual Risk: {result['overall_residual_risk']:.0%}")
    print(f"  Risk Rating        : {result['risk_rating']}")
    if result["critical_threats"]:
        print(f"  ⚠️  Critical Threats : {', '.join(result['critical_threats'])}")
    print(f"\n  Report saved to: {args.output}\n")


if __name__ == "__main__":
    main()
