from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Medical Spa AI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai"}

@app.post("/optimize-schedule")
async def optimize_schedule(data: dict):
    # AI optimization logic here
    return {"optimized": True}
