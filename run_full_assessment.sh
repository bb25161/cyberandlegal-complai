{
  "_meta": {
    "title": "ENISA Artificial Intelligence Threat Landscape",
    "source": "European Union Agency for Cybersecurity (ENISA)",
    "url": "https://www.enisa.europa.eu/topics/artificial-intelligence",
    "license": "CC BY 4.0 — Creative Commons Attribution 4.0 International",
    "attribution": "© European Union Agency for Cybersecurity (ENISA), 2024",
    "version": "2024",
    "description": "ENISA's structured taxonomy of AI-specific threats, covering integrity, confidentiality, availability, fairness, transparency, and societal risks."
  },
  "threats": [
    {
      "id": "T-01",
      "title": "AI Model Evasion (Adversarial Attacks)",
      "category": "Integrity",
      "impact": "CRITICAL",
      "likelihood": "HIGH",
      "description": "Adversaries craft inputs specifically designed to fool AI models into making incorrect predictions or classifications, often imperceptible to humans.",
      "sub_types": [
        "White-box attacks (FGSM, PGD, C&W) — require model access",
        "Black-box attacks — only require query access",
        "Transfer attacks — adversarial examples from one model applied to another",
        "Physical-world attacks — adversarial patches, stickers, glasses",
        "Semantic attacks — meaning-preserving text manipulations"
      ],
      "affected_ai_types": ["Image classifiers", "NLP models", "LLMs", "Autonomous systems"],
      "mitigations": [
        "Adversarial training with FGSM/PGD examples",
        "Input preprocessing (feature squeezing, spatial smoothing)",
        "Ensemble methods and model diversity",
        "Certified defenses (randomized smoothing)",
        "Input anomaly detection"
      ],
      "owasp_llm": ["LLM01", "LLM05"],
      "nist_rmf": ["MEASURE-2.3", "MEASURE-2.5"],
      "eu_ai_act": ["Art. 15"],
      "iso42001": ["Clause 8.4", "Annex A.6"]
    },
    {
      "id": "T-02",
      "title": "AI Poisoning (Training Data Manipulation)",
      "category": "Integrity",
      "impact": "CRITICAL",
      "likelihood": "MEDIUM",
      "description": "Attackers contaminate training datasets to corrupt model behavior, embed persistent backdoors, or cause targeted misclassification.",
      "sub_types": [
        "Label flipping — changing ground truth labels for selected samples",
        "Feature poisoning — modifying input features without label changes",
        "Backdoor injection — embedding trigger patterns that activate at test time",
        "Gradient-based poisoning — crafting samples to maximally degrade model",
        "Model poisoning in federated learning — malicious gradient updates"
      ],
      "affected_ai_types": ["All ML models", "LLMs", "Federated learning systems"],
      "mitigations": [
        "Data provenance and supply chain tracking",
        "Statistical outlier detection in training sets",
        "Differential privacy (DP-SGD)",
        "Robust aggregation (Krum, Trimmed Mean) for FL",
        "Independent data verification before training"
      ],
      "owasp_llm": ["LLM04"],
      "nist_rmf": ["MAP-3.5", "MEASURE-2.7"],
      "eu_ai_act": ["Art. 10"],
      "iso42001": ["Clause 8.3", "Annex A.5"]
    },
    {
      "id": "T-03",
      "title": "AI Model Theft and Extraction",
      "category": "Confidentiality",
      "impact": "HIGH",
      "likelihood": "HIGH",
      "description": "Adversaries reconstruct proprietary model functionality through repeated API queries, enabling clone models or exposing intellectual property and training data.",
      "sub_types": [
        "Model extraction — functionally equivalent model via black-box queries",
        "Hyperparameter stealing — inferring model architecture/training details",
        "Dataset reconstruction — recovering training data from model parameters",
        "Gradient leakage in federated settings"
      ],
      "affected_ai_types": ["API-exposed models", "SaaS AI systems", "Embedded AI"],
      "mitigations": [
        "API rate limiting and query monitoring",
        "Query watermarking for model fingerprinting",
        "Output perturbation to hinder reconstruction",
        "Anomaly detection on unusual query patterns",
        "Authentication and access controls"
      ],
      "owasp_llm": ["LLM03"],
      "nist_rmf": ["GOVERN-6.1", "MEASURE-2.6"],
      "eu_ai_act": ["Art. 15"],
      "iso42001": ["Clause 8.4", "Annex A.9"]
    },
    {
      "id": "T-04",
      "title": "AI Inference Attacks (Privacy Violations)",
      "category": "Confidentiality",
      "impact": "HIGH",
      "likelihood": "MEDIUM",
      "description": "Adversaries use model outputs to infer sensitive information about training individuals through membership inference, attribute inference, or data reconstruction.",
      "sub_types": [
        "Membership inference — determine if a sample was in training data",
        "Attribute inference — infer sensitive attributes of training individuals",
        "Property inference — infer dataset-level properties (e.g., demographic ratios)",
        "Data reconstruction — recover actual training samples from model parameters"
      ],
      "affected_ai_types": ["ML models trained on PII", "LLMs", "Medical AI", "Financial AI"],
      "mitigations": [
        "Differential privacy in training (DP-SGD)",
        "Output confidence score rounding",
        "Prediction API rate limiting",
        "Membership inference testing before deployment",
        "Data minimization in training sets"
      ],
      "owasp_llm": ["LLM02", "LLM06"],
      "nist_rmf": ["MAP-3.5", "MEASURE-2.6"],
      "eu_ai_act": ["Art. 10", "GDPR Art. 22"],
      "iso42001": ["Clause 8.3"]
    },
    {
      "id": "T-05",
      "title": "Prompt Injection and Jailbreaking",
      "category": "Integrity",
      "impact": "CRITICAL",
      "likelihood": "VERY HIGH",
      "description": "Malicious inputs manipulate LLM behavior to bypass safety guardrails, override system instructions, or cause production of harmful outputs.",
      "sub_types": [
        "Direct prompt injection — user directly overrides system prompt",
        "Indirect prompt injection — malicious content in retrieved documents",
        "Jailbreaking — role-play and persona-based safety bypass",
        "Many-shot jailbreaking — context window flooding with examples",
        "Multi-modal injection — instructions embedded in images/audio"
      ],
      "affected_ai_types": ["LLMs", "AI chatbots", "Agentic AI systems", "RAG systems"],
      "mitigations": [
        "Instruction hierarchy enforcement (system > user)",
        "Input sanitization and filtering pipeline",
        "Output content classifiers",
        "Regular jailbreak testing (HarmBench, WildGuard)",
        "Sandboxed agent execution environments"
      ],
      "owasp_llm": ["LLM01", "LLM07"],
      "nist_rmf": ["MEASURE-2.3", "MANAGE-2.2"],
      "eu_ai_act": ["Art. 15"],
      "iso42001": ["Clause 8.4", "Annex A.6"]
    },
    {
      "id": "T-06",
      "title": "AI Bias and Discrimination",
      "category": "Fairness",
      "impact": "HIGH",
      "likelihood": "HIGH",
      "description": "AI systems systematically disadvantage protected groups due to biased training data, flawed model design, or discriminatory feedback loops.",
      "sub_types": [
        "Historical bias — reflecting past discrimination in training data",
        "Representation bias — underrepresentation of groups in training data",
        "Measurement bias — inaccurate data collection for certain groups",
        "Aggregation bias — one model for heterogeneous populations",
        "Deployment bias — misuse in contexts different from design"
      ],
      "affected_ai_types": ["Hiring AI", "Credit scoring", "Healthcare AI", "LLMs", "Facial recognition"],
      "mitigations": [
        "Bias audits using BBQ, WinoBias, CrowS-Pairs",
        "Disparate impact analysis by demographic group",
        "Fairness-aware training (adversarial debiasing, reweighting)",
        "Fundamental Rights Impact Assessment (FRIA)",
        "Diverse and representative training data"
      ],
      "owasp_llm": ["LLM09"],
      "nist_rmf": ["MEASURE-2.2", "GOVERN-4.1"],
      "eu_ai_act": ["Art. 10(5)", "EU Charter Art. 21"],
      "iso42001": ["Clause 8.4.2", "Annex A.8"]
    },
    {
      "id": "T-07",
      "title": "Supply Chain Attacks on AI Components",
      "category": "Integrity",
      "impact": "CRITICAL",
      "likelihood": "MEDIUM",
      "description": "Adversaries compromise third-party AI models, datasets, libraries, or ML frameworks used in AI system development or deployment.",
      "sub_types": [
        "Malicious model weights on public repositories",
        "Poisoned public datasets (Wikipedia, Common Crawl)",
        "Backdoored ML framework libraries",
        "Compromised pre-training checkpoints",
        "Vulnerable model serving infrastructure"
      ],
      "affected_ai_types": ["All AI systems using third-party components"],
      "mitigations": [
        "AI Bill of Materials (AIBOM) for all third-party components",
        "Model card and dataset card verification",
        "Cryptographic signing of model artifacts",
        "Automated model scanning (Protect AI Guardian)",
        "Dependency vulnerability tracking (CVE monitoring)"
      ],
      "owasp_llm": ["LLM03"],
      "nist_rmf": ["GOVERN-6.1", "MAP-5.1"],
      "eu_ai_act": ["Art. 25"],
      "iso42001": ["Clause 8.4.3", "Annex A.7"]
    },
    {
      "id": "T-08",
      "title": "Disinformation and Deepfake Generation",
      "category": "Societal",
      "impact": "HIGH",
      "likelihood": "VERY HIGH",
      "description": "AI systems are weaponized to generate synthetic but convincing disinformation, deepfake media, or coordinated inauthentic content at scale.",
      "sub_types": [
        "Text-based disinformation — fake news, fabricated quotes",
        "Image deepfakes — synthetic faces, manipulated photos",
        "Video deepfakes — face-swapped videos of public figures",
        "Audio deepfakes — voice cloning for fraud",
        "Coordinated inauthentic behavior — AI-driven bot networks"
      ],
      "affected_ai_types": ["Generative AI", "LLMs", "Image generation", "Voice synthesis"],
      "mitigations": [
        "C2PA content provenance and watermarking standard",
        "AI-generated content labeling (EU AI Act Art. 50)",
        "Deepfake detection classifiers",
        "Platform-level synthetic content policies",
        "Media literacy and public awareness programs"
      ],
      "owasp_llm": ["LLM09"],
      "nist_rmf": ["GOVERN-1.5", "MEASURE-2.3"],
      "eu_ai_act": ["Art. 50", "Art. 5(f)"],
      "iso42001": ["Clause 8.2"]
    },
    {
      "id": "T-09",
      "title": "Lack of AI Transparency and Explainability",
      "category": "Transparency",
      "impact": "HIGH",
      "likelihood": "HIGH",
      "description": "AI systems operate as black boxes, making it impossible for users, regulators, or affected parties to understand, contest, or appeal AI decisions.",
      "sub_types": [
        "Algorithmic opacity — unexplainable model decisions",
        "Audit trail absence — no logging of AI-assisted decisions",
        "Model card gaps — insufficient documentation",
        "Training data opacity — undisclosed training sources",
        "Confidence calibration failures — misleading certainty scores"
      ],
      "affected_ai_types": ["High-risk AI systems", "LLMs", "Automated decision systems"],
      "mitigations": [
        "SHAP, LIME, or attention-based explainability methods",
        "Immutable audit logs for all AI-assisted decisions",
        "Model cards and system cards publication",
        "Calibrated confidence scores with uncertainty quantification",
        "User-facing plain-language explanations of AI decisions"
      ],
      "owasp_llm": ["LLM09"],
      "nist_rmf": ["GOVERN-1.5", "MEASURE-1.1"],
      "eu_ai_act": ["Art. 13", "Art. 14"],
      "iso42001": ["Clause 8.2", "Annex A.9"]
    },
    {
      "id": "T-10",
      "title": "AI System Availability Attacks (AI-DoS)",
      "category": "Availability",
      "impact": "MEDIUM",
      "likelihood": "MEDIUM",
      "description": "Adversaries degrade or disable AI systems through sponge attacks, resource exhaustion, or model-targeted denial of service attacks.",
      "sub_types": [
        "Sponge attacks — inputs maximizing compute without useful output",
        "Inference-time DoS — flooding API with expensive requests",
        "Context window flooding — forcing maximum token processing",
        "Gradient computation exhaustion — affecting training pipelines",
        "Memory overflow attacks — forcing OOM conditions"
      ],
      "affected_ai_types": ["API-exposed LLMs", "Real-time AI systems", "Agentic pipelines"],
      "mitigations": [
        "Request rate limiting and circuit breakers",
        "Per-query compute budget enforcement",
        "Token length limits on inputs and outputs",
        "DDoS protection at API gateway level",
        "Autoscaling with abuse detection"
      ],
      "owasp_llm": ["LLM10"],
      "nist_rmf": ["MANAGE-4.1", "MEASURE-2.5"],
      "eu_ai_act": ["Art. 15"],
      "iso42001": ["Clause 8.4", "Annex A.6"]
    },
    {
      "id": "T-11",
      "title": "Autonomous AI Agent Misuse",
      "category": "Integrity",
      "impact": "CRITICAL",
      "likelihood": "HIGH",
      "description": "Agentic AI systems perform unintended, harmful, or unauthorized actions due to excessive permissions, insufficient oversight, or adversarial manipulation.",
      "sub_types": [
        "Prompt injection triggering unauthorized tool calls",
        "Scope creep through ambiguous task delegation",
        "Privilege escalation via chained tool use",
        "Autonomous actions without human confirmation",
        "Multi-agent collusion for unintended goals"
      ],
      "affected_ai_types": ["AI agents", "Autonomous systems", "Multi-agent frameworks", "RPA+AI systems"],
      "mitigations": [
        "Principle of least privilege for agent tool permissions",
        "Human-in-the-loop gates for high-impact actions",
        "Agent action logging and immutable audit trails",
        "Sandboxed execution environments for agents",
        "Capability declarations and permission allow-lists"
      ],
      "owasp_llm": ["LLM06"],
      "nist_rmf": ["GOVERN-1.7", "MAP-5.2"],
      "eu_ai_act": ["Art. 14", "Art. 9"],
      "iso42001": ["Clause 6.1.2", "Annex A.6"]
    }
  ]
}
