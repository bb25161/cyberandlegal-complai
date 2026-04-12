{
  "_meta": {
    "title": "NIST AI Risk Management Framework (AI RMF 1.0)",
    "source": "NIST AI 100-1 (January 2023) + GenAI Profile AI 600-1 (July 2024)",
    "url": "https://www.nist.gov/artificial-intelligence/ai-rmf",
    "license": "Public Domain — U.S. Government Work",
    "version": "1.0",
    "last_updated": "2024-07-26",
    "description": "Voluntary framework for managing risks to individuals, organizations, and society associated with AI. Four core functions: GOVERN, MAP, MEASURE, MANAGE."
  },
  "functions": {
    "GOVERN": {
      "description": "Cultivate and implement organizational AI risk governance — policies, processes, accountability structures, and culture.",
      "purpose": "Cross-cutting function that enables all other RMF functions.",
      "eu_ai_act_alignment": ["Art. 9", "Art. 71"],
      "iso42001_alignment": ["Clause 4", "Clause 5", "Clause 6"],
      "categories": {
        "GOVERN-1": {
          "title": "Policies, Processes, Procedures and Practices",
          "controls": [
            {
              "id": "GOVERN-1.1",
              "statement": "Policies, processes, procedures, and practices across the organization related to the mapping, measuring, and managing of AI risks are in place, transparent, and implemented effectively.",
              "owasp_llm": [],
              "enisa_threats": ["T-09"]
            },
            {
              "id": "GOVERN-1.2",
              "statement": "The characteristics of trustworthy AI are integrated into organizational policies, processes, procedures, and practices.",
              "owasp_llm": [],
              "enisa_threats": ["T-09"]
            },
            {
              "id": "GOVERN-1.3",
              "statement": "Organizational leaders are responsible and accountable for decisions about risks associated with AI system development and deployment.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "GOVERN-1.4",
              "statement": "Organizational teams are committed to a culture that considers and communicates AI risk.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "GOVERN-1.5",
              "statement": "Organizational teams document the risks and potential impacts of the AI technology they design, develop, deploy, evaluate, and use.",
              "owasp_llm": ["LLM09"],
              "enisa_threats": ["T-09"]
            },
            {
              "id": "GOVERN-1.6",
              "statement": "Organizational teams are committed to AI risk management through ongoing training, awareness, and documentation.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "GOVERN-1.7",
              "statement": "Processes and procedures are in place for the decommissioning of AI systems identified as too high risk.",
              "owasp_llm": ["LLM06"],
              "enisa_threats": ["T-11"]
            }
          ]
        },
        "GOVERN-2": {
          "title": "Accountability",
          "controls": [
            {
              "id": "GOVERN-2.1",
              "statement": "Roles and responsibilities and organizational accountability structures are in place so that the appropriate teams and individuals are empowered, responsible, and trained for mapping, measuring, and managing AI risks.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "GOVERN-2.2",
              "statement": "The organization's personnel and partners are provided with AI risk management training to enable them to perform their duties and responsibilities consistent with related policies, procedures, norms, and organizational risk tolerance.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "GOVERN-4": {
          "title": "Organizational Teams",
          "controls": [
            {
              "id": "GOVERN-4.1",
              "statement": "Organizational teams document the risks and potential impacts of the AI technology they design, develop, deploy, evaluate, and use, and communicate these to relevant AI actors.",
              "owasp_llm": [],
              "enisa_threats": ["T-06", "T-09"]
            },
            {
              "id": "GOVERN-4.2",
              "statement": "Organizational teams establish practices to enable AI risk awareness and communication.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "GOVERN-5": {
          "title": "Organizational Context",
          "controls": [
            {
              "id": "GOVERN-5.1",
              "statement": "Organizational policies and practices are in place to address AI risks, including privacy, intellectual property, and third-party risks.",
              "owasp_llm": ["LLM03"],
              "enisa_threats": ["T-07"]
            },
            {
              "id": "GOVERN-5.2",
              "statement": "Practices and personnel for supporting AI risk management are in place.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "GOVERN-6": {
          "title": "Policies and Procedures",
          "controls": [
            {
              "id": "GOVERN-6.1",
              "statement": "Policies and procedures are in place to address AI risks of third-party entities, including procurement, assessments, and oversight.",
              "owasp_llm": ["LLM03"],
              "enisa_threats": ["T-07"]
            },
            {
              "id": "GOVERN-6.2",
              "statement": "Contingency processes are in place to handle failures or incidents in third-party data or AI systems.",
              "owasp_llm": ["LLM07"],
              "enisa_threats": ["T-07", "T-10"]
            }
          ]
        }
      }
    },
    "MAP": {
      "description": "Identify context, stakeholders, and potential AI risks before system development or deployment.",
      "purpose": "Understand AI system context and risk posture.",
      "eu_ai_act_alignment": ["Art. 9", "Art. 10"],
      "iso42001_alignment": ["Clause 6.1", "Clause 8.4"],
      "categories": {
        "MAP-1": {
          "title": "Context",
          "controls": [
            {
              "id": "MAP-1.1",
              "statement": "Context is established for evaluating AI risk including AI system categorization and organizational policies.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MAP-1.5",
              "statement": "Organizational risk tolerance is determined and documented.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MAP-1.6",
              "statement": "AI system risks are given appropriate priority relative to other organizational risks.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "MAP-2": {
          "title": "Scientific Understanding",
          "controls": [
            {
              "id": "MAP-2.1",
              "statement": "Scientific findings and expert knowledge of AI risk inform organizational risk tolerance and AI risk management.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MAP-2.2",
              "statement": "Scientific findings and expert knowledge are applied to evaluate AI risks.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "MAP-3": {
          "title": "Data and Information",
          "controls": [
            {
              "id": "MAP-3.5",
              "statement": "Practices and personnel for supporting AI data quality are in place, including data quality and data governance.",
              "owasp_llm": ["LLM02", "LLM06"],
              "enisa_threats": ["T-02", "T-04", "T-07"]
            }
          ]
        },
        "MAP-5": {
          "title": "Impacts",
          "controls": [
            {
              "id": "MAP-5.1",
              "statement": "Likelihood of the AI system's potential impacts and the associated risks are estimated.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MAP-5.2",
              "statement": "Practices for AI system impact assessment are in place.",
              "owasp_llm": ["LLM06"],
              "enisa_threats": ["T-06", "T-08", "T-11"]
            }
          ]
        }
      }
    },
    "MEASURE": {
      "description": "Quantitatively and qualitatively assess AI risks using metrics, benchmarks, and testing.",
      "purpose": "Evaluate AI system trustworthiness characteristics.",
      "eu_ai_act_alignment": ["Art. 9", "Art. 15"],
      "iso42001_alignment": ["Clause 8", "Clause 9"],
      "categories": {
        "MEASURE-1": {
          "title": "AI Risk Measurement Approaches",
          "controls": [
            {
              "id": "MEASURE-1.1",
              "statement": "Approaches and metrics are identified and tested for measuring AI risk.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MEASURE-1.3",
              "statement": "Internal experts and teams with domain-specific knowledge are engaged to test and evaluate AI systems.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "MEASURE-2": {
          "title": "AI System Testing and Evaluation",
          "controls": [
            {
              "id": "MEASURE-2.2",
              "statement": "AI system performance or behavior is evaluated for bias, fairness, and equity.",
              "owasp_llm": ["LLM09"],
              "enisa_threats": ["T-06"]
            },
            {
              "id": "MEASURE-2.3",
              "statement": "AI system performance is evaluated for robustness and adversarial inputs.",
              "owasp_llm": ["LLM01", "LLM04", "LLM05"],
              "enisa_threats": ["T-01", "T-05"]
            },
            {
              "id": "MEASURE-2.5",
              "statement": "The AI system's performance is monitored for anomalies and degradation.",
              "owasp_llm": ["LLM01", "LLM10"],
              "enisa_threats": ["T-01", "T-10"]
            },
            {
              "id": "MEASURE-2.6",
              "statement": "The AI system is regularly tested for security vulnerabilities including data leakage.",
              "owasp_llm": ["LLM02", "LLM07"],
              "enisa_threats": ["T-03", "T-04"]
            },
            {
              "id": "MEASURE-2.7",
              "statement": "AI system is monitored for concept drift and performance degradation.",
              "owasp_llm": [],
              "enisa_threats": ["T-02"]
            }
          ]
        }
      }
    },
    "MANAGE": {
      "description": "Prioritize, respond to, and recover from AI risks.",
      "purpose": "Implement risk treatment and response plans.",
      "eu_ai_act_alignment": ["Art. 9", "Art. 62"],
      "iso42001_alignment": ["Clause 8", "Clause 10"],
      "categories": {
        "MANAGE-1": {
          "title": "Risk Treatment",
          "controls": [
            {
              "id": "MANAGE-1.1",
              "statement": "A risk treatment plan, including benefits and costs, is developed and communicated.",
              "owasp_llm": [],
              "enisa_threats": []
            },
            {
              "id": "MANAGE-1.3",
              "statement": "AI risks based on assessments are prioritized.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        },
        "MANAGE-2": {
          "title": "Incident Response",
          "controls": [
            {
              "id": "MANAGE-2.2",
              "statement": "Mechanisms are in place and activated in the event of an incident or failure.",
              "owasp_llm": ["LLM07"],
              "enisa_threats": ["T-10"]
            },
            {
              "id": "MANAGE-2.4",
              "statement": "Risks from third-party entities are managed and assessed.",
              "owasp_llm": ["LLM03"],
              "enisa_threats": ["T-07"]
            }
          ]
        },
        "MANAGE-4": {
          "title": "Post-Deployment",
          "controls": [
            {
              "id": "MANAGE-4.1",
              "statement": "Post-deployment risks are identified and managed.",
              "owasp_llm": ["LLM10"],
              "enisa_threats": ["T-01", "T-10"]
            },
            {
              "id": "MANAGE-4.2",
              "statement": "Residual risks are identified and documented.",
              "owasp_llm": [],
              "enisa_threats": []
            }
          ]
        }
      }
    }
  },
  "genai_profile": {
    "title": "Generative AI Profile (AI 600-1)",
    "source": "NIST AI 600-1 (July 2024)",
    "url": "https://doi.org/10.6028/NIST.AI.600-1",
    "risk_categories": [
      {"id": "GAI-1", "name": "Confabulation", "owasp_llm": "LLM09", "enisa": "T-08"},
      {"id": "GAI-2", "name": "Data Privacy", "owasp_llm": "LLM02", "enisa": "T-04"},
      {"id": "GAI-3", "name": "Environmental Impact", "owasp_llm": null, "enisa": null},
      {"id": "GAI-4", "name": "Information Integrity", "owasp_llm": "LLM09", "enisa": "T-08"},
      {"id": "GAI-5", "name": "Intellectual Property", "owasp_llm": "LLM10", "enisa": null},
      {"id": "GAI-6", "name": "Toxic Content", "owasp_llm": "LLM01", "enisa": "T-05"},
      {"id": "GAI-7", "name": "Harmful Bias and Homogenization", "owasp_llm": "LLM09", "enisa": "T-06"},
      {"id": "GAI-8", "name": "Human-AI Configuration", "owasp_llm": "LLM06", "enisa": "T-11"},
      {"id": "GAI-9", "name": "Data Privacy in Training", "owasp_llm": "LLM02", "enisa": "T-02"},
      {"id": "GAI-10", "name": "Obscene, Degrading, and Abusive Content", "owasp_llm": "LLM01", "enisa": "T-05"},
      {"id": "GAI-11", "name": "Value Chain and Component Integration", "owasp_llm": "LLM03", "enisa": "T-07"},
      {"id": "GAI-12", "name": "Dangerous, Violent, or Hateful Content", "owasp_llm": "LLM01", "enisa": "T-05"}
    ]
  }
}
