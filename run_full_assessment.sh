#!/usr/bin/env bash
# scripts/setup.sh
# Cyber&Legal · One-command environment setup
# ============================================
set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  Cyber&Legal · AI Governance Lab Setup               ║"
echo "║  Powered by COMPL-AI (ETH Zurich × LatticeFlow AI)  ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3.10+ required. Install from https://python.org"
  exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "  ✅ Python $PYTHON_VERSION found"

# Check uv (preferred) or fall back to pip
if command -v uv &> /dev/null; then
  echo "  ✅ uv package manager found"
  USE_UV=true
else
  echo "  ℹ️  uv not found — using pip (install uv for faster: pip install uv)"
  USE_UV=false
fi

# Clone COMPL-AI
if [ ! -d "compl-ai" ]; then
  echo ""
  echo "  📦 Cloning COMPL-AI (ETH Zurich × LatticeFlow AI × INSAIT)..."
  git clone https://github.com/compl-ai/compl-ai.git
  echo "  ✅ COMPL-AI cloned"
fi

# Setup COMPL-AI virtual env
echo ""
echo "  🔧 Setting up COMPL-AI environment..."
cd compl-ai

if [ "$USE_UV" = true ]; then
  uv sync
  source .venv/bin/activate 2>/dev/null || . .venv/bin/activate
else
  python3 -m venv .venv
  source .venv/bin/activate 2>/dev/null || . .venv/bin/activate
  pip install -e . --quiet
fi

cd ..

# Install Cyber&Legal dependencies
echo "  🔧 Installing Cyber&Legal assessment dependencies..."
pip install openai anthropic requests python-dotenv --quiet
echo "  ✅ Dependencies installed"

# Create .env if missing
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo "  ⚠️  Created .env from template"
  echo "  👉 Edit .env and add your API keys before running assessments"
fi

# Create output directories
mkdir -p reports/output reports/raw

echo ""
echo "  ✅ Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Edit .env and add your OPENAI_API_KEY or ANTHROPIC_API_KEY"
echo "  2. Run: ./scripts/run_full_assessment.sh"
echo "  3. View report: open reports/output/assessment_report.html"
echo ""
