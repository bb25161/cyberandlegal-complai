name: Weekly AI Governance Assessment

on:
  schedule:
    - cron: '0 8 * * 1'  # Every Monday at 08:00 UTC
  workflow_dispatch:      # Allow manual trigger from GitHub UI
    inputs:
      model:
        description: 'Model to evaluate'
        required: false
        default: 'openai/gpt-4o-mini'
      limit:
        description: 'Samples per benchmark'
        required: false
        default: '10'

jobs:
  ai-governance-assessment:
    runs-on: ubuntu-latest
    timeout-minutes: 120

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Python 3.11
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install uv
        run: pip install uv --quiet

      - name: Clone COMPL-AI
        run: |
          git clone https://github.com/compl-ai/compl-ai.git
          cd compl-ai
          uv sync
          echo "COMPL_AI_VENV=$(pwd)/.venv" >> $GITHUB_ENV

      - name: Install Cyber&Legal dependencies
        run: pip install openai anthropic python-dotenv --quiet

      - name: Create output directories
        run: mkdir -p reports/output reports/raw

      - name: Run COMPL-AI EU AI Act Evaluation
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          COMPLAI_MODEL: ${{ github.event.inputs.model || 'openai/gpt-4o-mini' }}
          COMPLAI_LIMIT: ${{ github.event.inputs.limit || '10' }}
        run: |
          source compl-ai/.venv/bin/activate
          python assessments/compl_ai_runner.py \
            --model "$COMPLAI_MODEL" \
            --tasks all \
            --limit "$COMPLAI_LIMIT" \
            --results-dir reports/raw \
            --output reports/output/assessment_summary.json

      - name: Run OWASP LLM Top 10 Assessment
        env:
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        run: |
          python assessments/owasp_llm_assessor.py \
            --model gpt-4o-mini \
            --provider openai \
            --output reports/output/owasp_assessment.json

      - name: Generate HTML Report
        run: |
          python scripts/generate_report.py \
            --title "Weekly AI Governance Assessment — $(date +'%B %d, %Y')" \
            --model "${{ github.event.inputs.model || 'openai/gpt-4o-mini' }}" \
            --output reports/output/assessment_report.html

      - name: Upload Assessment Report
        uses: actions/upload-artifact@v4
        with:
          name: ai-governance-report-${{ github.run_number }}
          path: reports/output/
          retention-days: 90

      - name: Check for Critical Failures
        run: |
          python - <<'EOF'
          import json, sys

          # Check OWASP critical failures
          try:
            with open("reports/output/owasp_assessment.json") as f:
              owasp = json.load(f)
            critical = owasp.get("critical_failures", [])
            if critical:
              print(f"::warning:: OWASP Critical Failures detected: {', '.join(critical)}")
          except FileNotFoundError:
            pass

          # Check EU AI Act composite score
          try:
            with open("reports/output/assessment_summary.json") as f:
              summary = json.load(f)
            score = summary.get("eu_ai_act_assessment", {}).get("composite_eu_ai_act_score")
            if score and score < 0.50:
              print(f"::error:: EU AI Act compliance score below 50%: {score:.0%}")
              sys.exit(1)
          except FileNotFoundError:
            pass

          print("✅ Assessment checks passed")
          EOF

      - name: Post Summary to GitHub
        if: always()
        run: |
          python - <<'EOF'
          import json, os

          summary_lines = ["## 🛡️ AI Governance Assessment Results\n"]

          try:
            with open("reports/output/assessment_summary.json") as f:
              data = json.load(f)
            score = data.get("eu_ai_act_assessment", {}).get("composite_eu_ai_act_score")
            tier = data.get("eu_ai_act_assessment", {}).get("compliance_tier", "N/A")
            summary_lines.append(f"**EU AI Act Score:** {f'{score:.0%}' if score else 'N/A'} — {tier}")
          except:
            summary_lines.append("EU AI Act: Assessment not available")

          try:
            with open("reports/output/owasp_assessment.json") as f:
              owasp = json.load(f)
            score = owasp.get("overall_score")
            status = owasp.get("owasp_status", "N/A")
            summary_lines.append(f"**OWASP LLM Top 10:** {f'{score:.0%}' if score else 'N/A'} — {status}")
          except:
            summary_lines.append("OWASP: Assessment not available")

          summary_lines.append("\nFull report available in workflow artifacts.")

          with open(os.environ.get("GITHUB_STEP_SUMMARY", "/dev/null"), "w") as f:
            f.write("\n".join(summary_lines))
          EOF
