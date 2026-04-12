# 🔧 COMPL-AI Integration Guide
## Cyber&Legal · Step-by-Step Setup

---

## What is COMPL-AI?

COMPL-AI ([/kəmˈplaɪ/]) is the **first open-source framework** that translates EU AI Act regulatory requirements into measurable technical benchmarks. Created by **ETH Zurich, INSAIT, and LatticeFlow AI**, released under **Apache 2.0**.

**GitHub:** https://github.com/compl-ai/compl-ai  
**Leaderboard:** https://huggingface.co/spaces/latticeflow/compl-ai-board  
**Paper:** https://compl-ai.org

---

## Architecture

```
EU AI Act (Law)
      ↓
Technical Interpretation (ETH Zurich research)
      ↓
Benchmark Mapping (18 technical requirements)
      ↓
COMPL-AI Evaluation Suite (v2, built on UK AI Safety Institute's Inspect Framework)
      ↓
Your Model → Score → HTML Report
```

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Python | 3.10+ | Required |
| uv | Latest | Recommended package manager |
| Git | Any | For cloning |
| API Key | OpenAI OR Anthropic | For proprietary models |
| HuggingFace Token | Optional | For gated models (Llama, Gemma) |
| GPU | Optional | Required for local model evaluation |

**Important:** As of April 2026, COMPL-AI has a known **encoding incompatibility with Gemini API** via litellm. Use OpenAI or Anthropic keys, or local HuggingFace models.

---

## Step 1 — Clone COMPL-AI

```bash
cd /your/project/directory
git clone https://github.com/compl-ai/compl-ai.git
cd compl-ai
```

---

## Step 2 — Install Dependencies

**Option A: Using uv (recommended, faster)**
```bash
pip install uv
uv sync
source .venv/bin/activate
```

**Option B: Using pip**
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
```

---

## Step 3 — Configure API Key

```bash
# For OpenAI (GPT-4o, GPT-4o-mini)
export OPENAI_API_KEY=sk-your-key-here

# For Anthropic (Claude)
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# For HuggingFace models
export HF_TOKEN=hf_your-token-here
```

Or add to `.env` file:
```dotenv
OPENAI_API_KEY=sk-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
HF_TOKEN=hf_your-token-here
```

---

## Step 4 — Verify Installation

```bash
complai --help
complai list
```

Expected output from `complai list`:
```
Cyberattack Resilience
  instruction_goal_hijacking, llm_rules, strong_reject

Societal Alignment
  mask, simpleqa_verified, truthfulqa

Harmful Content and Toxicity
  realtoxicityprompts
```

---

## Step 5 — Run First Evaluation

**Quick test (5 samples, single task):**
```bash
complai eval openai/gpt-4o-mini --tasks strong_reject --limit 5
```

**Full EU AI Act evaluation (20 samples per task):**
```bash
complai eval openai/gpt-4o-mini --tasks all --limit 20
```

**Local HuggingFace model:**
```bash
complai eval EleutherAI/gpt-neo-125m --tasks strong_reject --limit 10
```

---

## Step 6 — Available Task Groups

| Task Group | What It Tests | EU AI Act | Benchmarks |
|---|---|---|---|
| `human_oversight` | Human control, AI identity | Art. 14 | ifbench, sycophancy_eval, human_or_ai |
| `robustness_safety` | Adversarial resistance | Art. 15 | adversarial_nli, wildguard, harmbench |
| `privacy` | PII protection | Art. 10 | privacylens, pii_detection |
| `transparency` | Calibration, disclosure | Art. 13 | human_or_ai, calibration_ece |
| `fairness` | Bias detection | Art. 10(5) | bbq, winobias, crows_pairs, toxigen |
| `societal_wellbeing` | Toxicity, societal harm | Art. 69 | toxicity_advbench, hle, include |
| `capability` | General capability | — | mmlu_pro, livebench_coding |
| `all` | Everything above | All | All benchmarks |

---

## Step 7 — Generate Report

```bash
# Process results
complai aggregate --results-dir ./results --output report.json

# Upload to compl-ai.org for HTML report
# Visit https://compl-ai.org → "My Model Report" → upload JSON
```

Or use our Cyber&Legal report generator:
```bash
python assessments/compl_ai_runner.py \
  --model openai/gpt-4o-mini \
  --tasks all \
  --limit 20 \
  --output reports/output/assessment_summary.json

python scripts/generate_report.py
```

---

## Troubleshooting

### Problem: `ascii codec can't encode character '\u0130'`
**Cause:** Gemini API encoding incompatibility with litellm  
**Solution:** Use OpenAI or Anthropic models instead

### Problem: `FileNotFoundError: Couldn't find dataset`
**Cause:** HuggingFace dataset not cached locally  
**Solution:** Set `HF_TOKEN` environment variable and ensure internet access

### Problem: `litellm.AuthenticationError`
**Cause:** Invalid or expired API key  
**Solution:** Check and refresh your API key

### Problem: `RESOURCE_EXHAUSTED` (429)
**Cause:** API rate limit exceeded (especially on Gemini free tier)  
**Solution:** Add `--limit 5` for testing, wait 60 seconds, or upgrade API plan

---

## Integration with Cyber&Legal Repo

Our `assessments/compl_ai_runner.py` wraps COMPL-AI with:
- Automatic EU AI Act principle mapping
- Weighted composite scoring (6 principles × defined weights)
- JSON output compatible with `generate_report.py`
- Cross-framework mapping to NIST, OWASP, and ENISA

**Usage:**
```bash
python assessments/compl_ai_runner.py \
  --model openai/gpt-4o-mini \
  --tasks all \
  --limit 20

# Dry run to see commands without executing:
python assessments/compl_ai_runner.py \
  --model openai/gpt-4o-mini \
  --dry-run
```

---

## Cost Estimates

| Model | Cost per 1000 tokens | Estimated full eval cost |
|---|---|---|
| GPT-4o-mini | ~$0.00015 | < $1.00 |
| GPT-4o | ~$0.005 | ~$5-20 |
| Claude Haiku | ~$0.00025 | < $1.00 |
| Claude Sonnet | ~$0.003 | ~$3-10 |
| Local HuggingFace | Free | GPU compute only |

---

*COMPL-AI is maintained by ETH Zurich, INSAIT, and LatticeFlow AI — Apache 2.0 License*  
*Integration by Cyber&Legal — cyberandlegal.com*
