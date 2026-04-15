"""
main.py — Cyber&Legal AI Governance Lab Backend
================================================
FastAPI backend — Google Cloud Run üzerinde çalışır.
Tüm assessment motorlarını HTTP endpoint'e çevirir.
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import datetime
import json
import os
import sys

# Assessment modüllerini import et
sys.path.append(os.path.dirname(__file__))

app = FastAPI(
    title="Cyber&Legal AI Governance API",
    description="EU AI Act · NIST AI RMF · OWASP LLM Top 10 · ENISA · ISO 42001",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Models ──────────────────────────────────────────────────────────────────

class AssessmentRequest(BaseModel):
    organization: str
    ai_system: str
    sector: Optional[str] = "general"
    model_name: Optional[str] = None
    answers: Optional[dict] = {}

class OWASPRequest(BaseModel):
    model_name: str
    provider: str = "openai"
    api_key: Optional[str] = None

# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {
        "service": "Cyber&Legal AI Governance Lab",
        "version": "1.0.0",
        "status": "operational",
        "frameworks": ["EU AI Act", "NIST AI RMF", "OWASP LLM Top 10", "ENISA", "ISO 42001"],
        "docs": "/docs",
        "timestamp": datetime.datetime.utcnow().isoformat(),
    }

@app.get("/health")
def health():
    return {"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.get("/frameworks")
def list_frameworks():
    return {
        "frameworks": [
            {
                "id": "eu_ai_act",
                "name": "EU AI Act",
                "description": "EU AI Act 6 temel prensibi — COMPL-AI motoru",
                "principles": 6,
                "benchmarks": 8,
                "api_key_required": True,
                "endpoint": "/assess/eu-ai-act",
            },
            {
                "id": "nist_rmf",
                "name": "NIST AI RMF",
                "description": "NIST AI 100-1 — 4 fonksiyon, 21 kontrol",
                "controls": 21,
                "functions": ["GOVERN", "MAP", "MEASURE", "MANAGE"],
                "api_key_required": False,
                "endpoint": "/assess/nist",
            },
            {
                "id": "owasp",
                "name": "OWASP LLM Top 10",
                "description": "2025 edition — 10 kategori, 50 adversarial test",
                "vulnerabilities": 10,
                "test_prompts": 50,
                "api_key_required": True,
                "endpoint": "/assess/owasp",
            },
            {
                "id": "enisa",
                "name": "ENISA AI Threat Landscape",
                "description": "ENISA 2024 — 11 tehdit kategorisi",
                "threats": 11,
                "api_key_required": False,
                "endpoint": "/assess/enisa",
            },
            {
                "id": "iso42001",
                "name": "ISO/IEC 42001:2023",
                "description": "AI Management System — 7 madde, 30 soru",
                "clauses": 7,
                "questions": 30,
                "api_key_required": False,
                "endpoint": "/assess/iso42001",
            },
        ]
    }

@app.post("/assess/nist")
def assess_nist(request: AssessmentRequest):
    """NIST AI RMF değerlendirmesi — API key gerekmez."""
    try:
        from assessments.nist_rmf_mapper import ISO42001_ASSESSMENT, score_assessment
        answers = request.answers or {}

        if not answers:
            return {
                "framework": "NIST AI RMF",
                "organization": request.organization,
                "status": "questions_required",
                "message": "Lütfen /assess/nist/questions endpoint'inden soruları alın",
                "questions_endpoint": "/assess/nist/questions",
            }

        scores = score_assessment(answers)
        return {
            "framework": "NIST AI RMF",
            "organization": request.organization,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "scores": scores,
        }
    except Exception as e:
        return {
            "framework": "NIST AI RMF",
            "organization": request.organization,
            "status": "demo_mode",
            "composite_score": 0.45,
            "maturity_level": "DEVELOPING",
            "message": str(e),
        }

@app.get("/assess/nist/questions")
def get_nist_questions():
    """NIST AI RMF soru listesini döndür."""
    try:
        from assessments.nist_rmf_mapper import NIST_AI_RMF
        questions = []
        for func, data in NIST_AI_RMF.items():
            for control in data["controls"]:
                questions.append({
                    "id": control["id"],
                    "function": func,
                    "question": control["question"],
                    "options": control["options"],
                })
        return {"framework": "NIST AI RMF", "total": len(questions), "questions": questions}
    except Exception as e:
        return {"error": str(e), "framework": "NIST AI RMF"}

@app.post("/assess/iso42001")
def assess_iso42001(request: AssessmentRequest):
    """ISO 42001 self-assessment — API key gerekmez."""
    try:
        from assessments.iso42001_checklist import ISO42001_ASSESSMENT, score_assessment
        answers = request.answers or {}

        if not answers:
            return {
                "framework": "ISO/IEC 42001",
                "organization": request.organization,
                "status": "questions_required",
                "questions_endpoint": "/assess/iso42001/questions",
            }

        scores = score_assessment(answers)
        return {
            "framework": "ISO/IEC 42001:2023",
            "organization": request.organization,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "scores": scores,
        }
    except Exception as e:
        return {
            "framework": "ISO/IEC 42001",
            "organization": request.organization,
            "status": "demo_mode",
            "overall_score": 0.38,
            "certification_readiness": "IMPLEMENTATION NEEDED (6-12 months)",
        }

@app.get("/assess/iso42001/questions")
def get_iso42001_questions():
    """ISO 42001 soru listesini döndür."""
    try:
        from assessments.iso42001_checklist import ISO42001_ASSESSMENT
        questions = []
        for section in ISO42001_ASSESSMENT:
            for q in section["questions"]:
                questions.append({
                    "id": q["id"],
                    "clause": section["clause"],
                    "clause_title": section["title"],
                    "question": q["question"],
                    "options": q["options"],
                })
        return {"framework": "ISO 42001", "total": len(questions), "questions": questions}
    except Exception as e:
        return {"error": str(e)}

@app.post("/assess/enisa")
def assess_enisa(request: AssessmentRequest):
    """ENISA AI Threat Landscape değerlendirmesi."""
    try:
        frameworks_path = os.path.join(os.path.dirname(__file__), "frameworks", "enisa_threats.json")
        with open(frameworks_path) as f:
            enisa_data = json.load(f)

        threats = enisa_data.get("threats", [])
        return {
            "framework": "ENISA AI Threat Landscape 2024",
            "organization": request.organization,
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "total_threats": len(threats),
            "threat_categories": [
                {
                    "id": t["id"],
                    "title": t["title"],
                    "category": t["category"],
                    "impact": t["impact"],
                    "likelihood": t["likelihood"],
                }
                for t in threats
            ],
            "status": "questions_required",
            "questions_endpoint": "/assess/enisa/questions",
        }
    except Exception as e:
        return {"framework": "ENISA", "error": str(e)}

@app.get("/assess/enisa/questions")
def get_enisa_questions():
    """ENISA tehdit değerlendirme sorularını döndür."""
    try:
        frameworks_path = os.path.join(os.path.dirname(__file__), "frameworks", "enisa_threats.json")
        with open(frameworks_path) as f:
            enisa_data = json.load(f)
        threats = enisa_data.get("threats", [])
        questions = []
        for t in threats:
            for i, q in enumerate(t.get("mitigations", [])[:2]):
                questions.append({
                    "threat_id": t["id"],
                    "threat_title": t["title"],
                    "question": f"[{t['id']}] {t['title']} için: {q}",
                    "options": ["Evet, uygulandı", "Kısmen uygulandı", "Hayır"],
                })
        return {"framework": "ENISA", "total": len(questions), "questions": questions}
    except Exception as e:
        return {"error": str(e)}

@app.get("/frameworks/{framework_id}")
def get_framework_detail(framework_id: str):
    """Belirli bir framework'ün detaylarını döndür."""
    try:
        file_map = {
            "eu_ai_act": "eu_ai_act_principles.json",
            "nist_rmf": "nist_rmf_controls.json",
            "owasp": "owasp_top10_2025.json",
            "enisa": "enisa_threats.json",
            "iso42001": "iso42001_controls.json",
        }
        if framework_id not in file_map:
            raise HTTPException(status_code=404, detail=f"Framework '{framework_id}' bulunamadı")

        frameworks_path = os.path.join(os.path.dirname(__file__), "frameworks", file_map[framework_id])
        with open(frameworks_path) as f:
            return json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Framework verisi bulunamadı")

@app.post("/assess/full")
def full_assessment(request: AssessmentRequest):
    """Tüm framework'lerde tam değerlendirme başlat."""
    return {
        "assessment_id": f"CL-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        "organization": request.organization,
        "ai_system": request.ai_system,
        "status": "initiated",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "frameworks": ["eu_ai_act", "nist_rmf", "owasp", "enisa", "iso42001"],
        "message": "Değerlendirme başlatıldı. Her framework için ayrı endpoint kullanın.",
        "endpoints": {
            "nist": "/assess/nist",
            "iso42001": "/assess/iso42001",
            "enisa": "/assess/enisa",
            "owasp": "/assess/owasp (API key gerekir)",
            "eu_ai_act": "/assess/eu-ai-act (API key gerekir)",
        },
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
