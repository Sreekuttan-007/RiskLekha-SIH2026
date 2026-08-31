from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import scenario_router, controls_router, optimization_router, simulation_router, provenance_router

app = FastAPI(title="RiskLekha API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scenario_router.router)
app.include_router(controls_router.router)
app.include_router(optimization_router.router)
app.include_router(simulation_router.router)
app.include_router(provenance_router.router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "RiskLekha API is running"}
