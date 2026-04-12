# 🗺️ Cyber&Legal AI Governance Lab — Roadmap

---

## Current State (v1.0) — What Works Today

| Component | Status | Notes |
|---|---|---|
| NIST AI RMF Assessment | ✅ Working | Interactive + pre-filled JSON mode |
| ENISA Threat Evaluator | ✅ Working | 11 threat categories, interactive |
| ISO 42001 Self-Assessment | ✅ Working | 7 clauses, 30 questions |
| OWASP LLM Top 10 Tests | ✅ Working | OpenAI/Anthropic providers |
| COMPL-AI Integration | ⚠️ Partial | OpenAI/Anthropic only (Gemini encoding bug) |
| HTML Report Generator | ✅ Working | Multi-framework composite report |
| GitHub Actions CI | ✅ Deployed | Weekly automated assessment |
| Framework JSON Files | ✅ Complete | NIST, OWASP, ENISA, EU AI Act, ISO 42001 |

**Known limitations:**
- Gemini API incompatible with COMPL-AI (litellm encoding issue)
- COMPL-AI requires OpenAI or Anthropic API key (not free)
- Rate limits on Gemini free tier affect OWASP direct tests

---

## v1.1 — Near Term (Next 4 Weeks)

### Fix Gemini Compatibility
- Replace litellm with direct Gemini SDK in COMPL-AI wrapper
- Enable Gemini 2.0 Flash for all benchmark evaluations
- Document workarounds for rate limits

### Promptfoo Integration
- Add `assessments/promptfoo_redteam.py` wrapper
- Promptfoo supports Gemini natively
- Red-team reports exportable to our HTML format

### LM Evaluation Harness Integration
- Add `assessments/lm_eval_runner.py`
- 60+ academic benchmarks via EleutherAI's framework
- HuggingFace model support without GPU (small models)

---

## v1.2 — Medium Term (1-3 Months)

### Llama Guard Integration
- Add `assessments/llama_guard_scanner.py`
- Use Meta's Llama Guard 3 for content safety classification
- Free, runs locally on CPU for small batches
- Maps to OWASP LLM01 and ENISA T-05

### Giskard RAG Evaluation
- Add `assessments/giskard_rag_evaluator.py`
- Test RAG pipelines for hallucination, groundedness, retrieval quality
- Maps to OWASP LLM08 (Vector and Embedding Weaknesses)

### ISO 42001 Evidence Pack Generator
- Generate compliance evidence documentation automatically
- Template-based model cards, data cards, risk registers
- Export as PDF or DOCX for auditors

---

## v2.0 — Platform Vision (3-6 Months)

### Web Dashboard
- React/Next.js frontend replacing HTML static reports
- Real-time assessment status
- Historical trend tracking
- LatticeFlow-style UI (dark theme, enterprise look)

### Multi-Tenant Assessment Platform
- Organization accounts
- Multiple AI system tracking
- Role-based access (Assessor, Reviewer, Executive)
- Export reports as PDF for clients

### Continuous Monitoring
- Weekly automated CI/CD assessments
- Alert on compliance score degradation
- Webhook notifications to Slack/Teams
- Integration with model registries

### Additional Framework Support
- CIS AI Benchmark controls
- MITRE ATLAS threat matrix
- IEEE P2894 AI Agent Interoperability
- SOC 2 Type II AI controls

---

## What We Deliberately Will NOT Build

| Item | Reason |
|---|---|
| ISO 42001 certification service | Requires accredited auditors — not our scope |
| Legal compliance advice | We are not lawyers — always recommend legal counsel |
| Model training or fine-tuning | Out of scope — assessment only |
| Real-time production guardrails | Use Llama Guard or GuardionAI for that |
| Paid SaaS platform | Open source first, always |

---

## Contributing

We welcome contributions in these areas:
1. **New framework mappings** — CIS, MITRE ATLAS, sector-specific regulations
2. **Additional assessment questions** — ISO 42001, NIST improvements
3. **Bug fixes** — especially Gemini compatibility
4. **Documentation** — tutorials, use case guides
5. **Translations** — Turkish (TR), German (DE), French (FR) versions

Open a GitHub Issue or Pull Request at: https://github.com/bb25161/cyberandlegal-complai

---

*Roadmap is subject to change based on community feedback and regulatory developments.*  
*Cyber&Legal — cyberandlegal.com*
