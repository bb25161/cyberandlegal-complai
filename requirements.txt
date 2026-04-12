"""
assessments/nist_rmf_mapper.py
Cyber&Legal · NIST AI RMF Assessment Tool
==========================================
Interactive questionnaire mapping your AI system against
NIST AI Risk Management Framework (AI 100-1, 2023) and the
Generative AI Profile (AI 600-1, July 2024).

Usage:
    python assessments/nist_rmf_mapper.py --interactive
    python assessments/nist_rmf_mapper.py --input assessments/nist_answers.json --output reports/output/nist_assessment.json
"""

import json
import argparse
import datetime
from pathlib import Path

# ─── NIST AI RMF Control Framework ──────────────────────────────────────────
# Source: NIST AI 100-1 (January 2023) + GenAI Profile AI 600-1 (July 2024)
# Public domain — https://www.nist.gov/artificial-intelligence

NIST_AI_RMF = {
    "GOVERN": {
        "description": "Establish AI risk governance — policies, roles, culture, and accountability structures.",
        "eu_ai_act_alignment": "Art. 9 (Risk Management), Art. 71 (Market Surveillance)",
        "controls": [
            {
                "id": "GOVERN-1.1",
                "statement": "Policies, processes, procedures, and practices across the AI lifecycle are in place, transparent, and implemented effectively.",
                "question": "Does your organization have documented AI governance policies covering the full AI lifecycle (design, development, deployment, monitoring)?",
                "options": ["Yes, fully documented and implemented", "Partially documented", "In development", "No policy exists"],
                "weights": [1.0, 0.6, 0.3, 0.0],
            },
            {
                "id": "GOVERN-1.5",
                "statement": "Organizational teams are committed to AI risk management through ongoing training, awareness, and documentation.",
                "question": "Do your teams receive regular AI risk training and maintain awareness of current AI threats and regulations (EU AI Act, OWASP LLM Top 10)?",
                "options": ["Yes, structured training program exists", "Ad-hoc training", "No formal training"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "GOVERN-1.7",
                "statement": "Processes and procedures are in place for decommissioning AI systems that no longer perform as intended.",
                "question": "Do you have a formal process for retiring or decommissioning AI models that fail compliance or performance thresholds?",
                "options": ["Yes, documented decommission process", "Informal process", "No process"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "id": "GOVERN-4.1",
                "statement": "Organizational teams document the risks and potential impacts of the AI system to be deployed.",
                "question": "Have you completed a formal AI risk assessment document before deploying your current AI systems?",
                "options": ["Yes, FRIA or equivalent completed", "Partial risk assessment", "No formal assessment"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "GOVERN-6.1",
                "statement": "Policies and procedures exist for the responsible acquisition of AI systems and third-party components.",
                "question": "Do you assess third-party AI vendors, model providers, and plugins for compliance before integrating them?",
                "options": ["Yes, formal vendor assessment", "Limited checks", "No assessment"],
                "weights": [1.0, 0.4, 0.0],
            },
        ]
    },
    "MAP": {
        "description": "Identify context, stakeholders, and potential AI risks before deployment.",
        "eu_ai_act_alignment": "Art. 9 (Risk Management System)",
        "controls": [
            {
                "id": "MAP-1.1",
                "statement": "AI system context — including intended use, users, and deployment environment — is established.",
                "question": "Have you formally documented the intended use case, user population, and deployment environment of your AI system?",
                "options": ["Yes, comprehensive use case documentation", "Basic documentation", "No documentation"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MAP-2.2",
                "statement": "Scientific findings and expert knowledge inform risk identification for the AI system.",
                "question": "Do you reference established frameworks (ENISA, OWASP, MITRE ATLAS) when identifying AI-specific threats?",
                "options": ["Yes, multiple frameworks used", "One framework referenced", "No framework used"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MAP-3.5",
                "statement": "Practices for AI data governance are in place.",
                "question": "Do you maintain data lineage, quality documentation, and governance for all data used in AI training and inference?",
                "options": ["Yes, full data governance", "Partial governance", "No data governance"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MAP-5.1",
                "statement": "Likelihood of AI risks is evaluated and documented.",
                "question": "Have you assessed the probability and impact severity of your AI system's risk scenarios?",
                "options": ["Yes, probability × impact matrix", "Qualitative assessment only", "No assessment"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "id": "MAP-5.2",
                "statement": "AI system's potential impacts on individuals, groups, communities, organizations, and society are evaluated.",
                "question": "Have you conducted a Fundamental Rights Impact Assessment (FRIA) or equivalent societal impact evaluation?",
                "options": ["Yes, FRIA or equivalent", "Internal impact review only", "No impact evaluation"],
                "weights": [1.0, 0.4, 0.0],
            },
        ]
    },
    "MEASURE": {
        "description": "Quantitatively assess AI risks using metrics, benchmarks, and testing.",
        "eu_ai_act_alignment": "Art. 9 (Testing), Art. 15 (Robustness)",
        "controls": [
            {
                "id": "MEASURE-1.1",
                "statement": "Approaches and metrics are identified and tested for measuring AI risk.",
                "question": "Do you use quantitative benchmarks (e.g., COMPL-AI, HELM, MMLU) to measure your AI model's risk-related properties?",
                "options": ["Yes, multiple quantitative benchmarks", "Some metrics tracked", "No quantitative measurement"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MEASURE-2.2",
                "statement": "AI system performance or behavior is evaluated against benchmarks for bias, fairness, and equity.",
                "question": "Do you regularly test your AI system for bias, fairness, and discriminatory outputs using standard benchmark datasets?",
                "options": ["Yes, automated regular testing", "Manual testing", "No bias testing"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MEASURE-2.3",
                "statement": "AI system performance is evaluated for robustness against adversarial inputs.",
                "question": "Do you conduct adversarial testing (red-teaming, prompt injection, jailbreak attempts) against your AI systems?",
                "options": ["Yes, formal red-team program", "Informal testing", "No adversarial testing"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MEASURE-2.5",
                "statement": "The AI system's performance is monitored for anomalies and degradation in production.",
                "question": "Do you have production monitoring for AI output quality, safety violations, and behavioral drift?",
                "options": ["Yes, real-time monitoring with alerts", "Periodic manual review", "No monitoring"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MEASURE-2.6",
                "statement": "The AI system is regularly tested for security vulnerabilities including data leakage.",
                "question": "Do you test your AI system for sensitive information disclosure, PII leakage, and training data extraction attacks?",
                "options": ["Yes, regular security testing", "Occasional testing", "No security testing"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MEASURE-2.7",
                "statement": "AI system operation is monitored for concept drift and performance degradation.",
                "question": "Do you track model accuracy, calibration, and behavioral consistency over time in production?",
                "options": ["Yes, continuous drift detection", "Periodic re-evaluation", "No drift monitoring"],
                "weights": [1.0, 0.4, 0.0],
            },
        ]
    },
    "MANAGE": {
        "description": "Prioritize, respond to, and recover from AI risks.",
        "eu_ai_act_alignment": "Art. 9 (Risk Management), Art. 62 (Incident Reporting)",
        "controls": [
            {
                "id": "MANAGE-1.1",
                "statement": "A risk treatment plan has been developed and communicated to relevant stakeholders.",
                "question": "Do you have documented risk treatment plans (accept, mitigate, transfer, avoid) for identified AI risks?",
                "options": ["Yes, formal risk register with treatment plans", "Informal risk tracking", "No risk treatment plan"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "id": "MANAGE-2.2",
                "statement": "Mechanisms for incident response and recovery are in place for AI system failures.",
                "question": "Do you have an AI-specific incident response plan covering model failure, harmful outputs, or safety incidents?",
                "options": ["Yes, AI incident response plan tested", "Generic IT incident response", "No incident response plan"],
                "weights": [1.0, 0.5, 0.0],
            },
            {
                "id": "MANAGE-2.4",
                "statement": "Risks from third-party entities are managed and assessed.",
                "question": "Do you continuously monitor third-party AI components and vendors for emerging risks?",
                "options": ["Yes, continuous vendor monitoring", "Annual review", "No monitoring"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "id": "MANAGE-4.1",
                "statement": "Post-deployment AI risks are identified and managed.",
                "question": "Do you have post-deployment risk assessment processes including user feedback and incident tracking?",
                "options": ["Yes, structured post-deployment review", "User complaints only", "No post-deployment assessment"],
                "weights": [1.0, 0.4, 0.0],
            },
            {
                "id": "MANAGE-4.2",
                "statement": "Residual risks are tracked and communicated to appropriate stakeholders.",
                "question": "Do you maintain and communicate a residual risk register to executive stakeholders?",
                "options": ["Yes, board-level reporting", "Internal tracking only", "No residual risk tracking"],
                "weights": [1.0, 0.4, 0.0],
            },
        ]
    },
}

# ─── GenAI-Specific Risks (AI 600-1, July 2024) ───────────────────────────

GENAI_PROFILE_RISKS = {
    "confabulation": {
        "description": "AI generates plausible but factually incorrect information with apparent confidence.",
        "question": "Have you implemented fact-checking mechanisms or uncertainty quantification to detect and flag AI hallucinations?",
        "owasp_mapping": "LLM09",
        "eu_ai_act": "Art. 13 (Transparency)",
    },
    "data_privacy": {
        "description": "AI systems expose personal data from training or generate content that leaks PII.",
        "question": "Do you test for PII leakage, training data memorization, and GDPR compliance in AI outputs?",
        "owasp_mapping": "LLM02",
        "eu_ai_act": "Art. 10, GDPR",
    },
    "toxic_content": {
        "description": "AI generates hateful, violent, or otherwise harmful content.",
        "question": "Do you use content filtering, output monitoring, and toxicity benchmarks (ToxiGen, HarmBench) regularly?",
        "owasp_mapping": "LLM01",
        "eu_ai_act": "Art. 15 (Robustness)",
    },
    "information_integrity": {
        "description": "AI creates or amplifies misinformation, deepfakes, or coordinated inauthentic content.",
        "question": "Have you assessed your AI system's potential to be weaponized for disinformation campaigns?",
        "owasp_mapping": "LLM09",
        "eu_ai_act": "Art. 50 (Transparency obligations)",
    },
    "intellectual_property": {
        "description": "AI outputs infringe on copyrighted content or reproduce proprietary information.",
        "question": "Do you test AI outputs for copyright infringement and have IP risk management policies in place?",
        "owasp_mapping": "LLM10",
        "eu_ai_act": "Art. 10 (Data Governance)",
    },
    "excessive_agency": {
        "description": "AI agents take harmful or unintended actions autonomously without human oversight.",
        "question": "Do agentic AI systems require human-in-the-loop confirmation for high-impact actions?",
        "owasp_mapping": "LLM06",
        "eu_ai_act": "Art. 14 (Human Oversight)",
    },
}


def run_interactive_questionnaire() -> dict:
    """Run interactive CLI questionnaire and collect answers."""
    print("\n" + "="*65)
    print("  CYBER&LEGAL · NIST AI RMF ASSESSMENT")
    print("  Based on NIST AI 100-1 (2023) + GenAI Profile AI 600-1 (2024)")
    print("="*65)
    print("\n  Answer each question to assess your AI system's risk posture.")
    print("  Enter the number corresponding to your answer.\n")

    answers = {}

    for function_name, function_data in NIST_AI_RMF.items():
        print(f"\n{'─'*65}")
        print(f"  {function_name}: {function_data['description']}")
        print(f"  EU AI Act: {function_data['eu_ai_act_alignment']}")
        print(f"{'─'*65}")

        for control in function_data["controls"]:
            print(f"\n  [{control['id']}] {control['statement']}")
            print(f"  Question: {control['question']}")
            for i, option in enumerate(control["options"]):
                print(f"    {i+1}. {option}")

            while True:
                try:
                    choice = int(input("  Your answer (number): ").strip()) - 1
                    if 0 <= choice < len(control["options"]):
                        answers[control["id"]] = {
                            "answer": control["options"][choice],
                            "score": control["weights"][choice],
                        }
                        break
                    print("  ⚠️  Please enter a valid number.")
                except (ValueError, KeyboardInterrupt):
                    print("  ⚠️  Please enter a number.")

    return answers


def score_assessment(answers: dict) -> dict:
    """Compute NIST AI RMF scores from answers."""
    function_scores = {}

    for function_name, function_data in NIST_AI_RMF.items():
        scores = []
        for control in function_data["controls"]:
            cid = control["id"]
            if cid in answers:
                scores.append(answers[cid]["score"])

        avg = sum(scores) / len(scores) if scores else 0
        function_scores[function_name] = {
            "description": function_data["description"],
            "eu_ai_act_alignment": function_data["eu_ai_act_alignment"],
            "score": round(avg, 3),
            "maturity_level": (
                "OPTIMIZING" if avg >= 0.85 else
                "MANAGED" if avg >= 0.70 else
                "DEFINED" if avg >= 0.50 else
                "DEVELOPING" if avg >= 0.25 else
                "INITIAL"
            ),
            "controls_assessed": len([c for c in function_data["controls"] if c["id"] in answers]),
        }

    overall = sum(v["score"] for v in function_scores.values()) / len(function_scores)

    return {
        "overall_nist_score": round(overall, 3),
        "overall_maturity": (
            "OPTIMIZING" if overall >= 0.85 else
            "MANAGED" if overall >= 0.70 else
            "DEFINED" if overall >= 0.50 else
            "DEVELOPING" if overall >= 0.25 else
            "INITIAL"
        ),
        "functions": function_scores,
    }


def generate_nist_report(scores: dict, answers: dict, output_path: str):
    """Save NIST AI RMF assessment report."""
    report = {
        "meta": {
            "tool": "Cyber&Legal · NIST AI RMF Assessor",
            "standard": "NIST AI 100-1 (2023) + GenAI Profile AI 600-1 (2024)",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        },
        "scores": scores,
        "answers": answers,
        "top_recommendations": generate_recommendations(scores),
    }

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ NIST AI RMF report saved to: {output_path}")
    return report


def generate_recommendations(scores: dict) -> list[dict]:
    """Generate prioritized recommendations based on scores."""
    recs = []
    for func, data in scores["functions"].items():
        if data["score"] < 0.5:
            recs.append({
                "function": func,
                "priority": "HIGH",
                "score": data["score"],
                "action": f"Immediately improve {func} controls — maturity level is {data['maturity_level']}.",
            })
        elif data["score"] < 0.75:
            recs.append({
                "function": func,
                "priority": "MEDIUM",
                "score": data["score"],
                "action": f"Strengthen {func} processes — current maturity: {data['maturity_level']}.",
            })
    return sorted(recs, key=lambda x: x["score"])


def main():
    parser = argparse.ArgumentParser(description="Cyber&Legal · NIST AI RMF Assessment Tool")
    parser.add_argument("--interactive", action="store_true", help="Run interactive questionnaire")
    parser.add_argument("--input", help="Path to pre-filled answers JSON")
    parser.add_argument("--output", default="reports/output/nist_assessment.json")
    args = parser.parse_args()

    if args.interactive:
        answers = run_interactive_questionnaire()
    elif args.input:
        with open(args.input) as f:
            answers = json.load(f)
    else:
        print("Use --interactive to run the questionnaire, or --input to load answers from a file.")
        parser.print_help()
        return

    scores = score_assessment(answers)
    report = generate_nist_report(scores, answers, args.output)

    print(f"\n  NIST AI RMF Score: {scores['overall_nist_score']:.0%}")
    print(f"  Maturity Level  : {scores['overall_maturity']}")


if __name__ == "__main__":
    main()
