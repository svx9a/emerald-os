from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from orchestrator import RelaxModeOrchestrator
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AE6 Relax Mode Agent Hub")

# Enable CORS for the frontend and Cloudflare Workers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = RelaxModeOrchestrator()

class AgentRequest(BaseModel):
    command: str
    tenantId: str = "ae6_admin_01"

@app.get("/")
async def root():
    return {"status": "AE6 Agent Hub Operational", "mode": "Relax"}

@app.post("/api/agents/execute")
async def execute_agent(request: AgentRequest):
    try:
        result = orchestrator.handle_command(request.command)
        return {
            "success": True,
            "data": result,
            "tenantId": request.tenantId
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
