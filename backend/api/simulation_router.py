from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..core.simulation import run_monte_carlo_simulation

router = APIRouter(prefix="/simulation", tags=["Simulation"])

@router.get("/{scenario_id}", response_model=schemas.SimulationResult)
def run_simulation(scenario_id: int, iterations: int = 10000, seed: int = 42, db: Session = Depends(get_db)):
    scenario = db.query(models.RiskScenario).filter(models.RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
        
    res = run_monte_carlo_simulation(
        lambda_val=scenario.lambda_val,
        loss_min=scenario.loss_min,
        loss_mode=scenario.loss_mode,
        loss_max=scenario.loss_max,
        iterations=iterations,
        seed=seed
    )
    
    return schemas.SimulationResult(
        expected_loss=res["expected_loss"],
        var_95=res["var_95"],
        cvar_95=res["cvar_95"],
        median_loss=res["median_loss"]
    )
