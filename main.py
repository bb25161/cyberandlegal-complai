from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import datetime

app = FastAPI(title="Cyber&Legal AI Governance API", version="1.1.0")

app.add_middleware(CORSMiddleware, allow_origins=["https://cyberandlegal.com","https://lab.cyberandlegal.com","http://localhost:3000"], allow_methods=["GET","POST"], allow_headers=["*"])

@app.get("/")
def root():
    return {"service": "Cyber&Legal AI Governance Lab", "version": "1.1.0", "status": "operational", "timestamp": datetime.datetime.utcnow().isoformat()}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/frameworks")
def frameworks():
    return {"frameworks": [{"id": "eu_ai_act", "name": "EU AI Act", "weight": "30%"}, {"id": "nist_rmf", "name": "NIST AI RMF", "weight": "20%"}, {"id": "owasp", "name": "OWASP LLM Top 10", "weight": "25%"}, {"id": "enisa", "name": "ENISA", "weight": "15%"}, {"id": "iso42001", "name": "ISO 42001", "weight": "10%"}]}
