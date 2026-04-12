"""
assessments/iso42001_checklist.py
Cyber&Legal · ISO/IEC 42001:2023 Self-Assessment Tool
======================================================
Interactive self-assessment questionnaire aligned to ISO/IEC 42001:2023
AI Management System (AIMS) standard.

Data sources:
- ISO/IEC 42001:2023 public summaries and clause descriptions
- AWS AI Lifecycle Risk Management guide (public)
- Deloitte ISO 42001 implementation guide (public)
- HUX AI ISO 42001 Starter Guide (CC BY license, Oct 2025)
- YDC AI Governance Framework (HuggingFace, CC BY-NC 4.0)

Note: This tool assists with self-assessment readiness. It is NOT
a substitute for formal ISO/IEC 42001 certification audit.

Usage:
    python assessments/iso42001_checklist.py --interactive
    python assessments/iso42001_checklist.py --input assessments/iso42001_answers.json
    python assessments/iso42001_checklist.py --output reports/output/iso42001_assessment.json
"""

import json
import argparse
import datetime
from pathlib import Path


# ─── ISO 42001 Self-Assessment Questions ─────────────────────────────────────
# Organized by the 7 mandatory clauses (4-10) of ISO/IEC 42001:2023

ISO42001_ASSESSMENT = [
    {
        "clause": "4",
        "title": "Context of the Organization",
        "weight": 0.10,
        "questions": [
            {
                "id": "4.1-Q1",
                "clause_ref": "4.1",
                "question": "Have you identified and documented internal factors affecting your AI governance (capabilities, culture, systems, technology)?",
                "options": ["Yes, fully documented", "Partially documented", "Not documented"],
                "weights": [1.0, 0.5, 0.0],
                "nist_rmf": "MAP-1.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "4.2-Q1",
                "clause_ref": "4.2",
                "question": "Have you identified all stakeholders affected by your AI systems (customers, regulators, employees, communities)?",
                "options": ["Yes, all stakeholders mapped", "Key stakeholders only", "Not identified"],
                "weights": [1.0, 0.5, 0.0],
                "nist_rmf": "MAP-1.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "4.3-Q1",
                "clause_ref": "4.3",
                "question": "Is the scope of your AI Management System (AIMS) formally defined and documented, including which AI systems are in scope?",
                "options": ["Yes, formally documented", "Informally defined", "Not defined"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MAP-1.1",
                "eu_ai_act": "",
            },
        ],
    },
    {
        "clause": "5",
        "title": "Leadership",
        "weight": 0.12,
        "questions": [
            {
                "id": "5.1-Q1",
                "clause_ref": "5.1",
                "question": "Does top management actively demonstrate commitment to AI governance (resources, strategic integration)?",
                "options": ["Yes, active champion", "Nominal support", "No visible commitment"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.3",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "5.2-Q1",
                "clause_ref": "5.2",
                "question": "Is there a formal, approved AI policy document addressing responsible AI, ethics, and compliance obligations?",
                "options": ["Yes, approved and communicated", "Draft exists", "No AI policy"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "5.3-Q1",
                "clause_ref": "5.3",
                "question": "Are AI governance roles (CAIO, AI Ethics Officer, AI Risk Manager) formally defined with documented responsibilities?",
                "options": ["Yes, formally defined", "Informally assigned", "No defined roles"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-2.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "5.3-Q2",
                "clause_ref": "5.3",
                "question": "Is there an AI governance committee or steering body with cross-functional representation?",
                "options": ["Yes, active committee", "Ad-hoc group", "No committee"],
                "weights": [1.0, 0.3, 0.0],
                "nist_rmf": "GOVERN-2.1",
                "eu_ai_act": "Art. 9",
            },
        ],
    },
    {
        "clause": "6",
        "title": "Planning",
        "weight": 0.15,
        "questions": [
            {
                "id": "6.1-Q1",
                "clause_ref": "6.1",
                "question": "Have you completed a formal AI risk assessment using a documented methodology?",
                "options": ["Yes, comprehensive assessment", "Partial assessment", "No formal assessment"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MAP-5.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "6.1-Q2",
                "clause_ref": "6.1.2",
                "question": "Does your AI risk assessment cover technical, ethical, legal, AND societal risks?",
                "options": ["Yes, all dimensions covered", "Technical only", "No assessment"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MAP-5.2",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "6.1-Q3",
                "clause_ref": "6.1.2",
                "question": "Have you conducted Fundamental Rights Impact Assessments (FRIA) for high-risk AI systems?",
                "options": ["Yes, FRIA completed", "In progress", "Not conducted"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MAP-5.2",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "6.2-Q1",
                "clause_ref": "6.2",
                "question": "Are measurable AI governance objectives defined with assigned owners and timelines?",
                "options": ["Yes, SMART objectives defined", "General objectives only", "No objectives"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.1",
                "eu_ai_act": "Art. 9",
            },
        ],
    },
    {
        "clause": "7",
        "title": "Support",
        "weight": 0.12,
        "questions": [
            {
                "id": "7.2-Q1",
                "clause_ref": "7.2",
                "question": "Do personnel involved in AI development and deployment receive regular AI governance training?",
                "options": ["Yes, structured training program", "Ad-hoc training", "No training"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.6",
                "eu_ai_act": "Art. 4",
            },
            {
                "id": "7.4-Q1",
                "clause_ref": "7.4",
                "question": "Are affected users informed when they are interacting with AI systems (transparency)?",
                "options": ["Yes, always disclosed", "Sometimes disclosed", "Not disclosed"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.5",
                "eu_ai_act": "Art. 13, Art. 50",
            },
            {
                "id": "7.5-Q1",
                "clause_ref": "7.5",
                "question": "Are technical documentation, model cards, and data cards maintained for all AI systems in scope?",
                "options": ["Yes, all systems documented", "Key systems only", "Not maintained"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.5",
                "eu_ai_act": "Art. 11, Art. 12",
            },
            {
                "id": "7.5-Q2",
                "clause_ref": "7.5",
                "question": "Are audit logs and AI decision records maintained with appropriate retention policies?",
                "options": ["Yes, immutable audit logs", "Basic logging", "No audit logs"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.5",
                "eu_ai_act": "Art. 12",
            },
        ],
    },
    {
        "clause": "8",
        "title": "Operation",
        "weight": 0.25,
        "questions": [
            {
                "id": "8.2-Q1",
                "clause_ref": "8.2",
                "question": "Are AI risk assessments performed before deployment AND when significant changes occur?",
                "options": ["Yes, before deploy and on changes", "Before deploy only", "Not performed"],
                "weights": [1.0, 0.5, 0.0],
                "nist_rmf": "MAP-5.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "8.3-Q1",
                "clause_ref": "8.3",
                "question": "Are formal stage gates defined for AI system development (design → test → deploy → monitor → decommission)?",
                "options": ["Yes, all lifecycle stages gated", "Some stages gated", "No stage gates"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MEASURE-2.5",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "8.3-Q2",
                "clause_ref": "8.3",
                "question": "Is AI model performance monitored continuously post-deployment for drift and degradation?",
                "options": ["Yes, real-time monitoring", "Periodic review", "Not monitored"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MEASURE-2.5",
                "eu_ai_act": "Art. 72",
            },
            {
                "id": "8.4-Q1",
                "clause_ref": "8.4.2",
                "question": "Do you use standardized bias benchmarks (BBQ, WinoBias, CrowS-Pairs) to detect discriminatory outputs?",
                "options": ["Yes, automated regular testing", "Manual testing", "No bias testing"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MEASURE-2.2",
                "eu_ai_act": "Art. 10(5)",
            },
            {
                "id": "8.4-Q2",
                "clause_ref": "8.4",
                "question": "Do you perform adversarial testing (red-teaming, prompt injection, jailbreak testing) on AI systems?",
                "options": ["Yes, automated red-teaming", "Manual testing", "Not performed"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MEASURE-2.3",
                "eu_ai_act": "Art. 15",
            },
            {
                "id": "8.4-Q3",
                "clause_ref": "8.4.3",
                "question": "Do you maintain an AI Bill of Materials (AIBOM) and formally assess third-party AI providers?",
                "options": ["Yes, full AIBOM + vendor assessment", "Partial tracking", "Not maintained"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-6.1",
                "eu_ai_act": "Art. 25",
            },
            {
                "id": "8.4-Q4",
                "clause_ref": "8.4",
                "question": "Do AI agents and autonomous systems operate under least-privilege permissions with human oversight for high-impact actions?",
                "options": ["Yes, always enforced", "For critical actions", "Not enforced"],
                "weights": [1.0, 0.5, 0.0],
                "nist_rmf": "GOVERN-1.7",
                "eu_ai_act": "Art. 14",
            },
        ],
    },
    {
        "clause": "9",
        "title": "Performance Evaluation",
        "weight": 0.13,
        "questions": [
            {
                "id": "9.1-Q1",
                "clause_ref": "9.1",
                "question": "Are KPIs defined for AI system performance, safety, and fairness, and measured regularly?",
                "options": ["Yes, defined and measured", "Some KPIs tracked", "No KPIs"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MEASURE-2.5",
                "eu_ai_act": "Art. 72",
            },
            {
                "id": "9.2-Q1",
                "clause_ref": "9.2",
                "question": "Are internal AI governance audits conducted at least annually, covering all AIMS processes?",
                "options": ["Yes, annual structured audits", "Ad-hoc audits", "Not conducted"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.1",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "9.3-Q1",
                "clause_ref": "9.3",
                "question": "Does management formally review the AIMS at planned intervals with documented outputs?",
                "options": ["Yes, formal management review", "Informal review", "Not conducted"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "GOVERN-1.3",
                "eu_ai_act": "Art. 9",
            },
        ],
    },
    {
        "clause": "10",
        "title": "Improvement",
        "weight": 0.13,
        "questions": [
            {
                "id": "10.1-Q1",
                "clause_ref": "10.1",
                "question": "Is there a formal process to incorporate lessons from AI incidents, audits, and regulatory updates into AIMS improvements?",
                "options": ["Yes, formal improvement process", "Informal learning", "No process"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MANAGE-4.2",
                "eu_ai_act": "Art. 9",
            },
            {
                "id": "10.2-Q1",
                "clause_ref": "10.2",
                "question": "Is there a formal process for identifying AI governance nonconformities, conducting root cause analysis, and implementing corrective actions?",
                "options": ["Yes, documented NCR process", "Informal process", "Not defined"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MANAGE-2.2",
                "eu_ai_act": "Art. 62",
            },
            {
                "id": "10.2-Q2",
                "clause_ref": "10.2",
                "question": "Are AI incidents (safety, bias, privacy violations) formally reported, investigated, and acted upon?",
                "options": ["Yes, formal incident process + reporting", "Internal only", "Not managed"],
                "weights": [1.0, 0.4, 0.0],
                "nist_rmf": "MANAGE-2.2",
                "eu_ai_act": "Art. 62",
            },
        ],
    },
]


def run_interactive_assessment() -> dict:
    """Run the interactive ISO 42001 self-assessment."""
    answers = {}

    print("\n" + "=" * 65)
    print("  CYBER&LEGAL · ISO/IEC 42001:2023 SELF-ASSESSMENT")
    print("  AI Management System (AIMS) Readiness Evaluation")
    print("=" * 65)
    print("\n  ⚠️  This is a self-assessment tool, not a formal audit.")
    print("  Answer honestly to identify readiness gaps.\n")

    for section in ISO42001_ASSESSMENT:
        print(f"\n{'─' * 65}")
        print(f"  Clause {section['clause']}: {section['title']} (Weight: {section['weight']:.0%})")
        print(f"{'─' * 65}")

        for q in section["questions"]:
            print(f"\n  [{q['clause_ref']}] {q['question']}")
            print(f"  → NIST: {q['nist_rmf']} | EU AI Act: {q['eu_ai_act'] or 'N/A'}")
            for i, opt in enumerate(q["options"]):
                print(f"    {i + 1}. {opt}")

            while True:
                try:
                    choice = int(input("  Your answer (number): ").strip()) - 1
                    if 0 <= choice < len(q["options"]):
                        answers[q["id"]] = {
                            "clause_ref": q["clause_ref"],
                            "question": q["question"],
                            "answer": q["options"][choice],
                            "score": q["weights"][choice],
                        }
                        break
                except (ValueError, KeyboardInterrupt):
                    print("  Please enter a valid number.")

    return answers


def score_assessment(answers: dict) -> dict:
    """Compute ISO 42001 readiness scores from answers."""
    clause_scores = {}

    for section in ISO42001_ASSESSMENT:
        clause_id = section["clause"]
        scores = []

        for q in section["questions"]:
            if q["id"] in answers:
                scores.append(answers[q["id"]]["score"])

        avg = sum(scores) / len(scores) if scores else 0
        weighted = avg * section["weight"]

        clause_scores[clause_id] = {
            "title": section["title"],
            "weight": section["weight"],
            "score": round(avg, 3),
            "weighted_score": round(weighted, 4),
            "questions_answered": len(scores),
            "questions_total": len(section["questions"]),
            "readiness_level": (
                "ADVANCED" if avg >= 0.85 else
                "ESTABLISHED" if avg >= 0.70 else
                "DEVELOPING" if avg >= 0.50 else
                "INITIAL" if avg >= 0.25 else
                "NOT STARTED"
            ),
        }

    # Overall score
    total_weighted = sum(v["weighted_score"] for v in clause_scores.values())
    all_scores = [v["score"] for v in clause_scores.values()]
    overall = sum(all_scores) / len(all_scores) if all_scores else 0

    # Certification readiness estimate
    cert_ready = (
        "CERTIFICATION READY" if overall >= 0.85 else
        "PRE-CERTIFICATION (3-6 months)" if overall >= 0.70 else
        "IMPLEMENTATION NEEDED (6-12 months)" if overall >= 0.50 else
        "FOUNDATION REQUIRED (12+ months)" if overall >= 0.25 else
        "NOT STARTED"
    )

    # Priority gaps
    gaps = [
        {"clause": k, "title": v["title"], "score": v["score"], "priority": "HIGH"}
        for k, v in clause_scores.items()
        if v["score"] < 0.50
    ]
    gaps.sort(key=lambda x: x["score"])

    return {
        "overall_score": round(overall, 3),
        "weighted_total": round(total_weighted, 3),
        "certification_readiness": cert_ready,
        "clauses": clause_scores,
        "priority_gaps": gaps,
    }


def save_report(scores: dict, answers: dict, output_path: str):
    """Save ISO 42001 assessment report."""
    report = {
        "meta": {
            "tool": "Cyber&Legal · ISO/IEC 42001:2023 Self-Assessment",
            "standard": "ISO/IEC 42001:2023 AI Management System",
            "disclaimer": "Self-assessment only — not a substitute for formal ISO certification audit",
            "timestamp": datetime.datetime.utcnow().isoformat(),
        },
        "scores": scores,
        "answers": answers,
    }

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w") as f:
        json.dump(report, f, indent=2)

    print(f"\n✅ ISO 42001 report saved to: {output_path}")

    # Console summary
    print("\n" + "=" * 65)
    print("  ISO/IEC 42001:2023 SELF-ASSESSMENT RESULTS")
    print("=" * 65)
    for cid, data in scores["clauses"].items():
        bar = "█" * int(data["score"] * 20) + "░" * (20 - int(data["score"] * 20))
        print(f"  Clause {cid}: {data['title'][:30]:<30} {bar} {data['score']:.0%} [{data['readiness_level']}]")
    print(f"\n  OVERALL SCORE       : {scores['overall_score']:.0%}")
    print(f"  CERTIFICATION READY : {scores['certification_readiness']}")
    if scores["priority_gaps"]:
        print(f"\n  PRIORITY GAPS:")
        for g in scores["priority_gaps"][:3]:
            print(f"    ⚠️  Clause {g['clause']}: {g['title']} — {g['score']:.0%}")
    print("=" * 65 + "\n")

    return report


def main():
    parser = argparse.ArgumentParser(
        description="Cyber&Legal · ISO/IEC 42001:2023 Self-Assessment Tool"
    )
    parser.add_argument("--interactive", action="store_true", default=True)
    parser.add_argument("--input", help="Pre-filled answers JSON path")
    parser.add_argument("--output", default="reports/output/iso42001_assessment.json")
    args = parser.parse_args()

    if args.input:
        with open(args.input) as f:
            answers = json.load(f)
        print(f"Loaded answers from: {args.input}")
    else:
        answers = run_interactive_assessment()

    scores = score_assessment(answers)
    save_report(scores, answers, args.output)


if __name__ == "__main__":
    main()
