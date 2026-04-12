{
  "_meta": {
    "title": "EU Artificial Intelligence Act — Technical Requirements Mapping",
    "source": "Regulation (EU) 2024/1689 of the European Parliament and of the Council",
    "url": "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689",
    "official_short": "EU AI Act",
    "license": "European Union Law — publicly available",
    "entry_into_force": "2024-08-01",
    "enforcement_timeline": {
      "2025-02-02": "Prohibited AI practices (Art. 5) — ENFORCEABLE",
      "2025-08-02": "GPAI model obligations (Art. 51-56) — ENFORCEABLE",
      "2026-08-02": "High-risk AI system obligations (Annex III) — ENFORCEABLE",
      "2027-08-02": "High-risk AI in regulated products (Annex I) — ENFORCEABLE"
    },
    "penalty_structure": {
      "prohibited_practices": "EUR 35,000,000 or 7% of global annual turnover",
      "high_risk_non_compliance": "EUR 15,000,000 or 3% of global annual turnover",
      "false_information": "EUR 7,500,000 or 1% of global annual turnover"
    },
    "description": "The world's first comprehensive AI regulation. Risk-based framework classifying AI systems by risk level: Unacceptable, High, Limited, Minimal."
  },
  "risk_classification": {
    "unacceptable_risk": {
      "article": "Art. 5",
      "description": "Prohibited AI practices — banned outright",
      "examples": [
        "Social scoring by public authorities",
        "Real-time remote biometric identification in public spaces (with exceptions)",
        "Subliminal manipulation causing harm",
        "Exploiting vulnerabilities of specific groups",
        "Emotion recognition in workplaces and schools",
        "Facial recognition database scraping"
      ]
    },
    "high_risk": {
      "article": "Annex III",
      "description": "Subject to strict requirements before market placement",
      "sectors": [
        "Biometric identification and categorization",
        "Critical infrastructure management",
        "Education and vocational training",
        "Employment and workers management",
        "Access to essential services",
        "Law enforcement",
        "Migration, asylum and border control",
        "Administration of justice"
      ]
    },
    "limited_risk": {
      "article": "Art. 50, Art. 52",
      "description": "Transparency obligations only",
      "examples": ["Chatbots", "Deepfakes", "AI-generated content"]
    },
    "minimal_risk": {
      "description": "No specific obligations — encouraged to follow voluntary codes",
      "examples": ["AI-enabled video games", "Spam filters"]
    }
  },
  "principles": [
    {
      "id": "P1",
      "title": "Human Agency and Oversight",
      "articles": ["Art. 14", "Art. 29"],
      "description": "AI systems must be designed to be effectively overseen by humans. They must allow human intervention, monitoring, and the ability to stop system operation.",
      "technical_requirements": [
        "Human-machine interface enabling effective oversight",
        "Ability for humans to override, intervene, or shut down",
        "Clear display of AI limitations and confidence levels",
        "Appropriate logging to enable post-hoc review",
        "Prevention of full automation of high-risk decisions"
      ],
      "compl_ai_benchmarks": ["sycophancy_eval", "ifbench", "human_or_ai"],
      "owasp_llm": ["LLM06"],
      "nist_rmf": ["GOVERN-1.7", "MAP-5.2"],
      "enisa_threats": ["T-11"],
      "iso42001": ["Clause 6.1.2"],
      "weight": 0.20
    },
    {
      "id": "P2",
      "title": "Technical Robustness and Safety",
      "articles": ["Art. 15", "Art. 9"],
      "description": "High-risk AI systems must be resilient to errors, faults, and adversarial inputs. They must implement risk management throughout the lifecycle.",
      "technical_requirements": [
        "Resilience to adversarial attacks and manipulation",
        "Fallback plans for failures",
        "Accuracy, robustness, and cybersecurity measures",
        "Testing under representative conditions",
        "Continuous monitoring post-deployment"
      ],
      "compl_ai_benchmarks": ["adversarial_nli", "arc_challenge", "wildguard", "harmbench", "strong_reject"],
      "owasp_llm": ["LLM01", "LLM04", "LLM05", "LLM10"],
      "nist_rmf": ["MEASURE-2.3", "MEASURE-2.5"],
      "enisa_threats": ["T-01", "T-02", "T-05", "T-10"],
      "iso42001": ["Clause 8.4", "Annex A.6"],
      "weight": 0.20
    },
    {
      "id": "P3",
      "title": "Privacy and Data Governance",
      "articles": ["Art. 10", "GDPR"],
      "description": "Training, validation, and testing data must meet quality criteria. Personal data must be protected. Data governance practices must be documented.",
      "technical_requirements": [
        "Data quality and relevance criteria",
        "Freedom from errors and completeness of data",
        "Appropriate statistical properties for representativeness",
        "Data governance and management practices",
        "Examination for possible biases",
        "GDPR compliance for personal data processing"
      ],
      "compl_ai_benchmarks": ["privacylens", "pii_detection"],
      "owasp_llm": ["LLM02", "LLM06"],
      "nist_rmf": ["MAP-3.5", "MEASURE-2.6"],
      "enisa_threats": ["T-02", "T-04", "T-07"],
      "iso42001": ["Clause 8.3", "Annex A.5"],
      "weight": 0.15
    },
    {
      "id": "P4",
      "title": "Transparency and Explainability",
      "articles": ["Art. 13", "Art. 52", "Art. 50"],
      "description": "High-risk AI systems must be transparent. Users must be informed about AI nature, capabilities, limitations, and decision logic.",
      "technical_requirements": [
        "Instructions for use with capability/limitation descriptions",
        "Logging and traceability of AI decisions",
        "AI identity disclosure to end-users",
        "Explanation of decision logic for affected persons",
        "Labeling of AI-generated synthetic content",
        "Technical documentation for competent authorities"
      ],
      "compl_ai_benchmarks": ["human_or_ai", "calibration_ece", "gpqa_diamond", "mask"],
      "owasp_llm": ["LLM07", "LLM09"],
      "nist_rmf": ["GOVERN-1.5", "MEASURE-1.1"],
      "enisa_threats": ["T-09"],
      "iso42001": ["Clause 8.2", "Annex A.9"],
      "weight": 0.15
    },
    {
      "id": "P5",
      "title": "Fairness and Non-Discrimination",
      "articles": ["Art. 10(5)", "EU Charter Art. 21"],
      "description": "AI systems must not produce outputs that discriminate on grounds of race, sex, religion, disability, sexual orientation, or other protected characteristics.",
      "technical_requirements": [
        "Bias detection in training data",
        "Bias correction measures",
        "Demographic parity testing",
        "Disparate impact analysis",
        "Monitoring for discriminatory outcomes post-deployment",
        "Fundamental Rights Impact Assessment (FRIA) for high-risk"
      ],
      "compl_ai_benchmarks": ["bbq", "winobias", "crows_pairs", "toxigen"],
      "owasp_llm": ["LLM09"],
      "nist_rmf": ["MEASURE-2.2", "GOVERN-4.1"],
      "enisa_threats": ["T-06"],
      "iso42001": ["Clause 8.4.2", "Annex A.8"],
      "weight": 0.20
    },
    {
      "id": "P6",
      "title": "Societal and Environmental Well-being",
      "articles": ["Art. 69", "Preamble 47", "Art. 50"],
      "description": "AI systems should benefit society and the environment. They must avoid negative impacts on democracy, rule of law, fundamental rights, and must not generate harmful content.",
      "technical_requirements": [
        "Assessment of societal impacts including democracy",
        "Prevention of harmful content generation",
        "Energy efficiency and environmental impact monitoring",
        "Safeguards against misuse for disinformation",
        "Protection of vulnerable groups",
        "Compliance with Union law on fundamental rights"
      ],
      "compl_ai_benchmarks": ["toxicity_advbench", "realtoxicityprompts", "hle", "include"],
      "owasp_llm": ["LLM01", "LLM09"],
      "nist_rmf": ["GOVERN-1.5", "MEASURE-2.3"],
      "enisa_threats": ["T-06", "T-08"],
      "iso42001": ["Clause 4.2", "Annex A.10"],
      "weight": 0.10
    }
  ],
  "gpai_specific": {
    "title": "General Purpose AI (GPAI) Model Obligations",
    "articles": ["Art. 51-56"],
    "effective_date": "2025-08-02",
    "threshold": "Training compute >= 10^23 FLOPs",
    "standard_obligations": [
      "Technical documentation (model card + training summary)",
      "Copyright compliance policy",
      "Summary of training data publication",
      "Energy consumption reporting"
    ],
    "systemic_risk_obligations": [
      "Adversarial testing and red-teaming",
      "Incident reporting to EU AI Office",
      "Cybersecurity protection measures",
      "Model evaluation against state-of-the-art benchmarks"
    ]
  }
}
