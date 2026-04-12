from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import datetime, json, os
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(title="Cyber&Legal AI Governance API", version="2.0.0", docs_url="/docs")

app.add_middleware(CORSMiddleware, allow_origins=["https://cyberandlegal.com","https://www.cyberandlegal.com","https://lab.cyberandlegal.com","http://localhost:3000"], allow_methods=["GET","POST","OPTIONS"], allow_headers=["*"])

class IntakeRequest(BaseModel):
    organization: str = Field(..., min_length=2, max_length=200)
    ai_system: str = Field(..., min_length=2, max_length=200)
    sector: str = Field(default="general")
    model_name: Optional[str] = None
    model_provider: Optional[str] = None
    use_case: Optional[str] = None
    affects_humans: Optional[bool] = None

class GovernanceAnswers(BaseModel):
    organization: str
    ai_system: str
    sector: Optional[str] = "general"
    nist_answers: Optional[dict] = {}
    iso_answers: Optional[dict] = {}
    enisa_answers: Optional[dict] = {}

class ModelTestRequest(BaseModel):
    organization: str
    ai_system: str
    model_name: str
    model_provider: str = "openai"
    api_key: Optional[str] = None
    engines: Optional[list] = ["owasp", "compl_ai"]

class UnifiedScoreRequest(BaseModel):
    organization: str
    ai_system: str
    sector: Optional[str] = "general"
    model_tested: Optional[str] = None
    eu_ai_act: Optional[float] = Field(None, ge=0, le=1)
    nist_rmf: Optional[float] = Field(None, ge=0, le=1)
    owasp: Optional[float] = Field(None, ge=0, le=1)
    enisa: Optional[float] = Field(None, ge=0, le=1)
    iso42001: Optional[float] = Field(None, ge=0, le=1)

@app.get("/")
def root():
    return {"service":"Cyber&Legal AI Governance Lab","version":"2.0.0","status":"operational","timestamp":datetime.datetime.utcnow().isoformat()+"Z","flow":{"step1":"POST /assess/intake","step2":"GET /assess/questions","step3":"POST /assess/governance","step4":"POST /assess/model","step5":"POST /score/unified"},"docs":"/docs"}

@app.get("/health")
def health():
    return {"status":"healthy","timestamp":datetime.datetime.utcnow().isoformat()+"Z"}

@app.get("/frameworks")
def list_frameworks():
    return {"frameworks":[{"id":"eu_ai_act","name":"EU AI Act","engine":"COMPL-AI","weight":"30%","api_key_required":True},{"id":"nist_rmf","name":"NIST AI RMF","engine":"Questionnaire","weight":"20%","api_key_required":False},{"id":"owasp","name":"OWASP LLM Top 10","engine":"Direct + Promptfoo","weight":"25%","api_key_required":True},{"id":"enisa","name":"ENISA Threat Landscape","engine":"Questionnaire","weight":"15%","api_key_required":False},{"id":"iso42001","name":"ISO/IEC 42001:2023","engine":"Questionnaire","weight":"10%","api_key_required":False}]}

@app.post("/assess/intake")
def intake(request: IntakeRequest):
    risk_map={"finance":("HIGH-RISK","Annex III"),"healthcare":("HIGH-RISK","Annex III"),"legal":("HIGH-RISK","Annex III"),"public":("HIGH-RISK","Annex III"),"manufacturing":("LIMITED RISK","Art. 52"),"general":("MINIMAL RISK","Art. 69")}
    risk_class,basis=risk_map.get(request.sector,("MINIMAL RISK","Art. 69"))
    assessment_id=f"CL-{datetime.datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    return {"assessment_id":assessment_id,"organization":request.organization,"ai_system":request.ai_system,"sector":request.sector,"model":request.model_name,"eu_ai_act_risk_class":risk_class,"eu_ai_act_basis":basis,"timestamp":datetime.datetime.utcnow().isoformat()+"Z","next_step":"GET /assess/questions","mandatory_frameworks":["nist_rmf","iso42001","enisa"],"message":f"{'⚠️ HIGH-RISK AI system. EU AI Act Annex III compliance mandatory by August 2026.' if risk_class=='HIGH-RISK' else f'AI system classified as {risk_class}.'}"}

@app.get("/assess/questions")
def get_questions():
    try:
        from engines.questionnaire import get_all_questions
        q=get_all_questions()
        total=sum(len(v["questions"]) for v in q.values())
        return {"total_questions":total,"api_key_required":False,"estimated_time":"10-15 minutes","questionnaires":q}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/assess/governance")
def governance(request: GovernanceAnswers):
    try:
        from engines.questionnaire import calculate_nist_score,calculate_iso42001_score,calculate_enisa_score
        results={}
        if request.nist_answers: results["nist"]=calculate_nist_score(request.nist_answers)
        if request.iso_answers: results["iso42001"]=calculate_iso42001_score(request.iso_answers)
        if request.enisa_answers: results["enisa"]=calculate_enisa_score(request.enisa_answers)
        scores={"nist_rmf":results.get("nist",{}).get("composite_score"),"iso42001":results.get("iso42001",{}).get("composite_score"),"enisa":results.get("enisa",{}).get("composite_score")}
        return {"organization":request.organization,"timestamp":datetime.datetime.utcnow().isoformat()+"Z","results":results,"scores_for_unified":scores,"next_step":"POST /assess/model OR POST /score/unified"}
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.post("/assess/model")
def model_test(request: ModelTestRequest):
    results={}
    scores={}
    api_key=request.api_key or os.environ.get("OPENAI_API_KEY") or os.environ.get("ANTHROPIC_API_KEY")
    if "owasp" in request.engines:
        try:
            from engines.owasp_engine import run_owasp_tests
            r=run_owasp_tests(model=request.model_name,provider=request.model_provider,api_key=api_key,limit_per_category=3,dry_run=not bool(api_key))
            results["owasp"]=r; scores["owasp"]=r.get("composite_score")
        except Exception as e: results["owasp"]={"error":str(e)}
    if "compl_ai" in request.engines:
        try:
            from engines.compl_ai_engine import run_compl_ai
            r=run_compl_ai(model=request.model_name,limit=10,api_key=api_key,dry_run=not bool(api_key))
            results["compl_ai"]=r; scores["eu_ai_act"]=r.get("composite_score")
        except Exception as e: results["compl_ai"]={"error":str(e)}
    if "lm_eval" in request.engines:
        try:
            from engines.lm_eval_engine import run_lm_eval
            r=run_lm_eval(model=request.model_name,dry_run=True)
            results["lm_eval"]=r
        except Exception as e: results["lm_eval"]={"error":str(e)}
    if "promptfoo" in request.engines:
        try:
            from engines.promptfoo_engine import run_promptfoo
            r=run_promptfoo(model=request.model_name,provider=request.model_provider,api_key=api_key,dry_run=not bool(api_key))
            results["promptfoo"]=r
        except Exception as e: results["promptfoo"]={"error":str(e)}
    return {"organization":request.organization,"model_tested":request.model_name,"timestamp":datetime.datetime.utcnow().isoformat()+"Z","engines_run":list(results.keys()),"results":results,"scores_for_unified":scores,"next_step":"POST /score/unified"}

@app.post("/score/unified")
def unified_score(request: UnifiedScoreRequest):
    try:
        from scoring.unified_scorer import compute_unified_score
        scores={"eu_ai_act":request.eu_ai_act,"nist_rmf":request.nist_rmf,"owasp":request.owasp,"enisa":request.enisa,"iso42001":request.iso42001}
        result=compute_unified_score(scores=scores,organization=request.organization,ai_system=request.ai_system,sector=request.sector,model=request.model_tested)
        return result
    except Exception as e:
        raise HTTPException(status_code=500,detail=str(e))

@app.get("/frameworks/{framework_id}")
def framework_detail(framework_id: str):
    file_map={"eu_ai_act":"eu_ai_act_principles.json","nist_rmf":"nist_rmf_controls.json","owasp":"owasp_top10_2025.json","enisa":"enisa_threats.json","iso42001":"iso42001_controls.json"}
    if framework_id not in file_map: raise HTTPException(status_code=404,detail="Framework bulunamadı")
    try:
        with open(os.path.join(os.path.dirname(__file__),file_map[framework_id])) as f: return json.load(f)
    except FileNotFoundError: raise HTTPException(status_code=404,detail="Framework verisi bulunamadı")

if __name__=="__main__":
    import uvicorn
    uvicorn.run(app,host="0.0.0.0",port=8080)
