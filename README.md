{
  "_meta": {
    "title": "ISO/IEC 42001:2023 — AI Management System (AIMS) Control Reference",
    "source": "Derived from ISO/IEC 42001:2023 public summaries, NIST mapping, and AWS/Deloitte implementation guides",
    "iso_url": "https://www.iso.org/standard/81230.html",
    "license": "This mapping file: Apache 2.0. ISO 42001 standard itself is proprietary — certification requires official ISO document.",
    "note": "This file contains self-assessment questions and control descriptions derived from publicly available implementation guides. It is NOT a substitute for the official ISO/IEC 42001:2023 standard document.",
    "version": "42001:2023",
    "published": "2023-12-18",
    "description": "World's first certifiable AI Management System standard. Plan-Do-Check-Act (PDCA) structure for organizations developing, providing, or using AI systems."
  },
  "structure_overview": {
    "mandatory_clauses": ["4", "5", "6", "7", "8", "9", "10"],
    "annex_a": "Normative — AI system objectives and controls",
    "annex_b": "Informative — Implementation guidance",
    "high_level_structure": "Harmonized Structure (HS) — aligns with ISO 27001, ISO 9001"
  },
  "clauses": [
    {
      "id": "4",
      "title": "Context of the Organization",
      "subclauses": [
        {
          "id": "4.1",
          "title": "Understanding the organization and its context",
          "description": "Identify internal and external factors affecting AI governance objectives.",
          "self_assessment_questions": [
            "Have you documented internal factors affecting AI use (culture, capabilities, systems)?",
            "Have you documented external factors (regulatory, competitive, societal, technological)?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["MAP-1.1"],
          "owasp_llm": []
        },
        {
          "id": "4.2",
          "title": "Understanding needs and expectations of interested parties",
          "description": "Identify stakeholders and their relevant requirements for AI governance.",
          "self_assessment_questions": [
            "Have you identified all relevant stakeholders (customers, regulators, employees, affected communities)?",
            "Have you documented stakeholder requirements and expectations for AI systems?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 14"],
          "nist_rmf": ["MAP-1.1"],
          "owasp_llm": []
        },
        {
          "id": "4.3",
          "title": "Determining the scope of the AIMS",
          "description": "Define the boundaries and applicability of the AI Management System.",
          "self_assessment_questions": [
            "Is the AIMS scope formally documented, including which AI systems are in scope?",
            "Are exclusions justified and documented?"
          ],
          "eu_ai_act": [],
          "nist_rmf": [],
          "owasp_llm": []
        }
      ]
    },
    {
      "id": "5",
      "title": "Leadership",
      "subclauses": [
        {
          "id": "5.1",
          "title": "Leadership and commitment",
          "description": "Top management must demonstrate leadership for the AIMS.",
          "self_assessment_questions": [
            "Does top management actively champion AI governance?",
            "Is AI governance integrated into strategic planning?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["GOVERN-1.3"],
          "owasp_llm": []
        },
        {
          "id": "5.2",
          "title": "AI policy",
          "description": "Establish an AI policy aligned with organizational context.",
          "self_assessment_questions": [
            "Is there a formal, approved AI policy document?",
            "Does the policy address responsible AI principles, ethics, and compliance obligations?",
            "Is the policy communicated to all relevant personnel?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["GOVERN-1.1"],
          "owasp_llm": []
        },
        {
          "id": "5.3",
          "title": "Organizational roles, responsibilities and authorities",
          "description": "Define and communicate AI governance roles and accountability.",
          "self_assessment_questions": [
            "Are AI governance roles (CAIO, AI Ethics Officer, etc.) formally defined?",
            "Are responsibilities for AIMS implementation clearly assigned?",
            "Is there an AI governance committee or steering body?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 14"],
          "nist_rmf": ["GOVERN-2.1"],
          "owasp_llm": []
        }
      ]
    },
    {
      "id": "6",
      "title": "Planning",
      "subclauses": [
        {
          "id": "6.1",
          "title": "Actions to address risks and opportunities",
          "description": "Identify and address AI-specific risks and opportunities.",
          "self_assessment_questions": [
            "Have you completed a formal AI risk assessment?",
            "Are AI risks mapped to the organization's overall risk management framework?",
            "Are risk treatment options documented and implemented?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["MAP-5.1", "GOVERN-4.1"],
          "owasp_llm": ["LLM01", "LLM06"]
        },
        {
          "id": "6.1.2",
          "title": "AI risk assessment",
          "description": "Systematic process for identifying, analyzing, and evaluating AI risks.",
          "self_assessment_questions": [
            "Do you use a documented methodology for AI risk assessment?",
            "Does the assessment cover technical, ethical, legal, and societal risks?",
            "Are impact assessments (FRIA) conducted for high-risk AI?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 14"],
          "nist_rmf": ["MAP-5.1", "MAP-5.2"],
          "owasp_llm": ["LLM01", "LLM06", "LLM09"]
        }
      ]
    },
    {
      "id": "7",
      "title": "Support",
      "subclauses": [
        {
          "id": "7.2",
          "title": "Competence",
          "description": "Ensure personnel have necessary competence for AI governance.",
          "self_assessment_questions": [
            "Do personnel involved in AI development have appropriate AI governance training?",
            "Is competence assessed and documented?",
            "Are training needs for new AI governance requirements identified?"
          ],
          "eu_ai_act": ["Art. 4"],
          "nist_rmf": ["GOVERN-1.6", "GOVERN-2.2"],
          "owasp_llm": []
        },
        {
          "id": "7.4",
          "title": "Communication",
          "description": "Determine internal and external communication on AI governance.",
          "self_assessment_questions": [
            "Are AI governance decisions communicated to relevant stakeholders?",
            "Is there a process for communicating AI incidents externally?",
            "Are affected users informed about AI system use (transparency)?"
          ],
          "eu_ai_act": ["Art. 13", "Art. 50"],
          "nist_rmf": ["GOVERN-1.5"],
          "owasp_llm": ["LLM09"]
        },
        {
          "id": "7.5",
          "title": "Documented information",
          "description": "Create, update, and control documented information required by the AIMS.",
          "self_assessment_questions": [
            "Are all required AIMS documents controlled and versioned?",
            "Is technical documentation for AI systems maintained (model cards, data sheets)?",
            "Are audit logs and decision records retained appropriately?"
          ],
          "eu_ai_act": ["Art. 11", "Art. 12"],
          "nist_rmf": ["GOVERN-1.5"],
          "owasp_llm": ["LLM07"]
        }
      ]
    },
    {
      "id": "8",
      "title": "Operation",
      "subclauses": [
        {
          "id": "8.2",
          "title": "AI risk assessment (operational)",
          "description": "Perform and document AI risk assessments at planned intervals.",
          "self_assessment_questions": [
            "Are AI risk assessments performed before deployment?",
            "Are risk assessments repeated when significant changes occur?",
            "Are assessment results documented and actioned?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["MAP-5.1"],
          "owasp_llm": ["LLM01", "LLM04"]
        },
        {
          "id": "8.3",
          "title": "AI system lifecycle management",
          "description": "Define and implement controls for AI system development, testing, deployment, monitoring, and decommissioning.",
          "self_assessment_questions": [
            "Are stage gates defined for AI development (design → test → deploy)?",
            "Is model performance monitored continuously post-deployment?",
            "Is there a formal decommissioning process for AI systems?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 14", "Art. 15"],
          "nist_rmf": ["MEASURE-2.5", "MANAGE-4.1"],
          "owasp_llm": ["LLM03", "LLM08"]
        },
        {
          "id": "8.4",
          "title": "AI system impact assessment",
          "description": "Assess societal, ethical, and legal impacts of AI systems.",
          "self_assessment_questions": [
            "Have you conducted impact assessments for fundamental rights?",
            "Are bias and fairness assessments part of the AI lifecycle?",
            "Are environmental impacts of AI systems assessed?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 10(5)"],
          "nist_rmf": ["MAP-5.2", "MEASURE-2.2"],
          "owasp_llm": ["LLM09"]
        },
        {
          "id": "8.4.2",
          "title": "Bias and fairness",
          "description": "Detect, assess, and mitigate bias in AI systems.",
          "self_assessment_questions": [
            "Do you use standardized bias benchmarks (BBQ, WinoBias, CrowS-Pairs)?",
            "Are disparate impact analyses performed by demographic group?",
            "Are bias correction measures implemented and documented?"
          ],
          "eu_ai_act": ["Art. 10(5)", "EU Charter Art. 21"],
          "nist_rmf": ["MEASURE-2.2"],
          "owasp_llm": ["LLM09"],
          "enisa_threats": ["T-06"]
        },
        {
          "id": "8.4.3",
          "title": "Third-party and supply chain",
          "description": "Manage risks from third-party AI components and providers.",
          "self_assessment_questions": [
            "Do you maintain an AI Bill of Materials (AIBOM)?",
            "Are third-party model providers formally assessed for compliance?",
            "Are contractual AI governance requirements included in vendor contracts?"
          ],
          "eu_ai_act": ["Art. 25"],
          "nist_rmf": ["GOVERN-6.1", "MANAGE-2.4"],
          "owasp_llm": ["LLM03"],
          "enisa_threats": ["T-07"]
        }
      ]
    },
    {
      "id": "9",
      "title": "Performance Evaluation",
      "subclauses": [
        {
          "id": "9.1",
          "title": "Monitoring, measurement, analysis and evaluation",
          "description": "Monitor AI system performance against defined metrics and objectives.",
          "self_assessment_questions": [
            "Are KPIs defined for AI system performance, safety, and fairness?",
            "Is model drift monitored continuously?",
            "Are monitoring results analyzed and reported?"
          ],
          "eu_ai_act": ["Art. 72"],
          "nist_rmf": ["MEASURE-2.5", "MEASURE-2.7"],
          "owasp_llm": ["LLM10"]
        },
        {
          "id": "9.2",
          "title": "Internal audit",
          "description": "Conduct internal audits of the AIMS at planned intervals.",
          "self_assessment_questions": [
            "Are internal AI governance audits conducted at least annually?",
            "Do audits cover all AIMS processes and controls?",
            "Are audit findings documented and corrective actions tracked?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["GOVERN-1.1"],
          "owasp_llm": []
        },
        {
          "id": "9.3",
          "title": "Management review",
          "description": "Top management reviews the AIMS to ensure suitability, adequacy, and effectiveness.",
          "self_assessment_questions": [
            "Does management formally review AI governance at planned intervals?",
            "Are review inputs (audit results, incidents, risks) considered?",
            "Are review outputs (decisions, actions) documented?"
          ],
          "eu_ai_act": ["Art. 9"],
          "nist_rmf": ["GOVERN-1.3"],
          "owasp_llm": []
        }
      ]
    },
    {
      "id": "10",
      "title": "Improvement",
      "subclauses": [
        {
          "id": "10.1",
          "title": "Continual improvement",
          "description": "Continually improve suitability, adequacy, and effectiveness of AIMS.",
          "self_assessment_questions": [
            "Is there a formal process for incorporating lessons learned into AI governance?",
            "Are improvement opportunities from audits, incidents, and reviews tracked?",
            "Is the AIMS updated when AI regulations change (EU AI Act updates, NIST updates)?"
          ],
          "eu_ai_act": ["Art. 9", "Art. 62"],
          "nist_rmf": ["MANAGE-4.2"],
          "owasp_llm": ["LLM07"]
        },
        {
          "id": "10.2",
          "title": "Nonconformity and corrective action",
          "description": "React to nonconformities, take corrective actions, and prevent recurrence.",
          "self_assessment_questions": [
            "Is there a formal process for identifying and recording AI governance nonconformities?",
            "Are root cause analyses conducted for AI incidents?",
            "Are corrective actions implemented and verified for effectiveness?"
          ],
          "eu_ai_act": ["Art. 62"],
          "nist_rmf": ["MANAGE-2.2"],
          "owasp_llm": []
        }
      ]
    }
  ],
  "annex_a_summary": {
    "title": "Annex A — AI System Objectives and Controls",
    "note": "Normative — organizations select applicable controls based on risk assessment",
    "control_domains": [
      {"id": "A.2", "title": "Policies for AI"},
      {"id": "A.3", "title": "Internal organization"},
      {"id": "A.4", "title": "Resources for AI systems"},
      {"id": "A.5", "title": "Assessing impacts of AI systems"},
      {"id": "A.6", "title": "AI system lifecycle"},
      {"id": "A.7", "title": "Data for AI systems"},
      {"id": "A.8", "title": "Information for interested parties of AI systems"},
      {"id": "A.9", "title": "Use of AI systems"},
      {"id": "A.10", "title": "Third-party and customer relationships"}
    ]
  }
}
