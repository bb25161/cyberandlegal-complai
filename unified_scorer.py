{
  "_meta": {
    "title": "OWASP Top 10 for Large Language Model Applications",
    "edition": "2025",
    "source": "OWASP Foundation",
    "url": "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    "license": "CC BY-SA 4.0",
    "attribution": "OWASP Foundation — Creative Commons Attribution-ShareAlike 4.0",
    "version": "2.0 (2025)",
    "description": "The definitive ranked list of the most critical security and safety vulnerabilities in LLM applications. Community-driven, practitioner-validated."
  },
  "vulnerabilities": [
    {
      "id": "LLM01",
      "rank": 1,
      "title": "Prompt Injection",
      "severity": "CRITICAL",
      "description": "Prompt injection vulnerabilities occur when user prompts alter the LLM's behavior in unintended ways. Direct injections override system prompts; indirect injections manipulate inputs from external sources.",
      "attack_vectors": [
        "Direct system prompt override",
        "Jailbreak role-play instructions",
        "Indirect injection via retrieved documents",
        "Multi-modal prompt injection (images, audio)",
        "Context window manipulation"
      ],
      "impacts": [
        "Bypass of safety guardrails",
        "Data exfiltration via crafted outputs",
        "Unauthorized action execution in agentic systems",
        "Impersonation of trusted entities"
      ],
      "mitigations": [
        "Privilege separation between system and user contexts",
        "Input validation and sanitization pipelines",
        "Output filtering with content classifiers",
        "Regular red-teaming and adversarial testing",
        "Human-in-the-loop for high-risk actions"
      ],
      "nist_rmf": ["MEASURE-2.3", "MEASURE-2.5", "MANAGE-2.2"],
      "eu_ai_act": ["Art. 15"],
      "enisa_threats": ["T-05"],
      "compl_ai_benchmarks": ["harmbench", "wildguard", "strong_reject"],
      "cwe": ["CWE-77", "CWE-89"]
    },
    {
      "id": "LLM02",
      "rank": 2,
      "title": "Sensitive Information Disclosure",
      "severity": "HIGH",
      "description": "LLMs may inadvertently reveal confidential data, PII, proprietary algorithms, or training data through their responses.",
      "attack_vectors": [
        "Training data extraction attacks",
        "Membership inference attacks",
        "System prompt extraction",
        "PII reconstruction from partial prompts",
        "Model inversion attacks"
      ],
      "impacts": [
        "GDPR/privacy regulation violations",
        "Exposure of trade secrets",
        "Identity theft via PII leakage",
        "Competitive intelligence loss"
      ],
      "mitigations": [
        "Output filtering for PII patterns",
        "Differential privacy in training",
        "Data minimization in RAG pipelines",
        "Access controls on sensitive document retrieval",
        "Regular PII leakage testing"
      ],
      "nist_rmf": ["MAP-3.5", "MEASURE-2.6", "GOVERN-5.1"],
      "eu_ai_act": ["Art. 10", "GDPR Art. 22"],
      "enisa_threats": ["T-04"],
      "compl_ai_benchmarks": ["privacylens", "pii_detection"],
      "cwe": ["CWE-200", "CWE-359"]
    },
    {
      "id": "LLM03",
      "rank": 3,
      "title": "Supply Chain Vulnerabilities",
      "severity": "HIGH",
      "description": "LLM supply chains are susceptible to vulnerabilities through third-party datasets, pre-trained models, plugins, and deployment infrastructure.",
      "attack_vectors": [
        "Poisoned pre-trained model weights",
        "Malicious fine-tuning datasets",
        "Compromised model hosting platforms",
        "Backdoored third-party plugins",
        "Vulnerable ML framework dependencies"
      ],
      "impacts": [
        "Backdoor activation via trigger phrases",
        "Silent model behavior modification",
        "Intellectual property theft",
        "Supply chain-wide compromise"
      ],
      "mitigations": [
        "AI Bill of Materials (AIBOM) maintenance",
        "Cryptographic signing of model artifacts",
        "Third-party vendor risk assessments",
        "Model scanning before deployment (e.g., Protect AI Guardian)",
        "Dependency vulnerability tracking"
      ],
      "nist_rmf": ["GOVERN-6.1", "MAP-5.1", "MANAGE-2.4"],
      "eu_ai_act": ["Art. 25"],
      "enisa_threats": ["T-07"],
      "compl_ai_benchmarks": [],
      "cwe": ["CWE-494", "CWE-829"]
    },
    {
      "id": "LLM04",
      "rank": 4,
      "title": "Data and Model Poisoning",
      "severity": "CRITICAL",
      "description": "Adversaries manipulate training or fine-tuning data to embed backdoors, degrade performance, or bias model behavior.",
      "attack_vectors": [
        "Backdoor trigger embedding in training data",
        "Label flipping attacks",
        "Byzantine attacks in federated learning",
        "Clean-label poisoning",
        "Instruction poisoning in RLHF"
      ],
      "impacts": [
        "Hidden backdoor activation",
        "Targeted misclassification",
        "Biased outputs favoring attacker",
        "Degraded safety training"
      ],
      "mitigations": [
        "Data provenance and supply chain verification",
        "Statistical anomaly detection in datasets",
        "Differential privacy in training",
        "Robust aggregation methods",
        "Pre-training data audits"
      ],
      "nist_rmf": ["MAP-3.5", "MEASURE-2.7", "GOVERN-6.1"],
      "eu_ai_act": ["Art. 10"],
      "enisa_threats": ["T-02"],
      "compl_ai_benchmarks": [],
      "cwe": ["CWE-915", "CWE-20"]
    },
    {
      "id": "LLM05",
      "rank": 5,
      "title": "Improper Output Handling",
      "severity": "HIGH",
      "description": "LLM outputs passed without validation to downstream components can enable XSS, SSRF, SQL injection, or remote code execution.",
      "attack_vectors": [
        "LLM-generated XSS payloads rendered in browser",
        "SQL injection via LLM-constructed queries",
        "SSRF via LLM-generated URLs",
        "Code injection in automated execution pipelines",
        "Command injection via shell-executed LLM output"
      ],
      "impacts": [
        "Remote code execution",
        "Database compromise",
        "Internal network access (SSRF)",
        "Cross-site scripting in web apps"
      ],
      "mitigations": [
        "Output encoding and sanitization",
        "Content Security Policy enforcement",
        "Sandboxed code execution environments",
        "Parameterized queries for database operations",
        "Output schema validation"
      ],
      "nist_rmf": ["MEASURE-2.3", "MANAGE-2.2"],
      "eu_ai_act": ["Art. 15"],
      "enisa_threats": ["T-01", "T-05"],
      "compl_ai_benchmarks": ["harmbench"],
      "cwe": ["CWE-79", "CWE-89", "CWE-918"]
    },
    {
      "id": "LLM06",
      "rank": 6,
      "title": "Excessive Agency",
      "severity": "CRITICAL",
      "description": "LLM agents given excessive permissions, autonomy, or capabilities may take harmful actions beyond intended scope.",
      "attack_vectors": [
        "Prompt injection triggering unauthorized tool calls",
        "Scope creep through vague task instructions",
        "Chained tool use enabling privilege escalation",
        "Autonomous decision-making without oversight"
      ],
      "impacts": [
        "Unintended data deletion or modification",
        "Financial transactions without authorization",
        "Mass communication sent without approval",
        "Critical system changes without verification"
      ],
      "mitigations": [
        "Principle of least privilege for agent tool access",
        "Human-in-the-loop confirmation for high-impact actions",
        "Explicit allow-lists for agent capabilities",
        "Action logging and audit trails",
        "Rate limiting on agent tool invocations"
      ],
      "nist_rmf": ["GOVERN-1.7", "MAP-5.2", "GOVERN-4.1"],
      "eu_ai_act": ["Art. 14"],
      "enisa_threats": ["T-11"],
      "compl_ai_benchmarks": ["instruction_goal_hijacking"],
      "cwe": ["CWE-732", "CWE-284"]
    },
    {
      "id": "LLM07",
      "rank": 7,
      "title": "System Prompt Leakage",
      "severity": "HIGH",
      "description": "System prompts containing confidential instructions, business logic, or security controls are extracted by adversaries.",
      "attack_vectors": [
        "Direct extraction requests",
        "Encoding tricks (Base64, Caesar cipher requests)",
        "Acrostic or steganographic extraction",
        "Iterative probing with partial confirmations",
        "Multi-turn conversation manipulation"
      ],
      "impacts": [
        "Exposure of proprietary business logic",
        "Safety mechanism bypass via revealed guardrails",
        "Competitive intelligence leakage",
        "Enables more targeted prompt injection"
      ],
      "mitigations": [
        "Instruction hierarchy enforcement",
        "Prompt confidentiality training",
        "Output monitoring for system prompt patterns",
        "Minimal information in system prompts",
        "Regular prompt extraction red-teaming"
      ],
      "nist_rmf": ["GOVERN-1.5", "MEASURE-2.6"],
      "eu_ai_act": ["Art. 13"],
      "enisa_threats": ["T-03"],
      "compl_ai_benchmarks": ["mask"],
      "cwe": ["CWE-200"]
    },
    {
      "id": "LLM08",
      "rank": 8,
      "title": "Vector and Embedding Weaknesses",
      "severity": "HIGH",
      "description": "Vulnerabilities in RAG pipelines and vector stores through data poisoning, cross-tenant leakage, or retrieval manipulation.",
      "attack_vectors": [
        "Poisoned documents in vector stores",
        "Cross-tenant data leakage in shared embeddings",
        "Adversarial documents designed to hijack retrieval",
        "Embedding inversion attacks",
        "Context window stuffing via retrieved content"
      ],
      "impacts": [
        "Misinformation injection into RAG responses",
        "Confidential data leakage across tenants",
        "Retrieval manipulation for targeted attacks",
        "Model behavior modification via poisoned context"
      ],
      "mitigations": [
        "Input validation before vectorization",
        "Tenant isolation in vector stores",
        "Retrieved content filtering",
        "Provenance tracking for retrieved documents",
        "Anomaly detection on retrieval patterns"
      ],
      "nist_rmf": ["MAP-3.5", "MANAGE-2.4"],
      "eu_ai_act": ["Art. 10"],
      "enisa_threats": ["T-02", "T-07"],
      "compl_ai_benchmarks": [],
      "cwe": ["CWE-346", "CWE-494"]
    },
    {
      "id": "LLM09",
      "rank": 9,
      "title": "Misinformation",
      "severity": "HIGH",
      "description": "LLMs generate authoritative-sounding but factually incorrect information, creating legal, reputational, and safety risks.",
      "attack_vectors": [
        "Hallucination on factual queries",
        "False citation generation",
        "Deepfake content creation",
        "Targeted disinformation campaigns",
        "Medical or legal misguidance"
      ],
      "impacts": [
        "Medical harm from incorrect health advice",
        "Legal liability from false legal guidance",
        "Reputational damage via fabricated quotes",
        "Electoral manipulation via synthetic content",
        "Financial harm from fabricated market data"
      ],
      "mitigations": [
        "Retrieval-augmented generation with verified sources",
        "Uncertainty quantification and calibration",
        "Fact-checking pipelines",
        "Clear AI-generated content labeling (EU AI Act Art. 50)",
        "Domain-specific output validation"
      ],
      "nist_rmf": ["MEASURE-2.2", "GOVERN-1.5"],
      "eu_ai_act": ["Art. 13", "Art. 50", "Art. 52"],
      "enisa_threats": ["T-08", "T-09"],
      "compl_ai_benchmarks": ["simpleqa_verified", "truthfulqa", "calibration_ece"],
      "cwe": ["CWE-1059"]
    },
    {
      "id": "LLM10",
      "rank": 10,
      "title": "Unbounded Consumption",
      "severity": "MEDIUM",
      "description": "Adversaries cause excessive resource consumption through repeated complex queries, denial-of-service attacks, or compute exhaustion.",
      "attack_vectors": [
        "Sponge attacks with compute-heavy inputs",
        "Infinite generation requests",
        "Recursive prompt loops",
        "Mass parallel API requests (DDoS)",
        "Context window flooding"
      ],
      "impacts": [
        "Service unavailability (AI-DoS)",
        "Excessive API costs",
        "Degraded performance for legitimate users",
        "Model serving infrastructure overload"
      ],
      "mitigations": [
        "Request rate limiting per user/IP",
        "Token budget enforcement per request",
        "Compute budget circuit breakers",
        "API gateway DDoS protection",
        "Response length limits"
      ],
      "nist_rmf": ["MANAGE-4.1", "MEASURE-2.5"],
      "eu_ai_act": ["Art. 15"],
      "enisa_threats": ["T-10"],
      "compl_ai_benchmarks": [],
      "cwe": ["CWE-400", "CWE-770"]
    }
  ]
}
