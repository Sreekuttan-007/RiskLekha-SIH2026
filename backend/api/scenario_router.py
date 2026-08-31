from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/scenarios", tags=["Scenarios"])

@router.get("/", response_model=List[schemas.RiskScenarioResponse])
def get_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(models.RiskScenario).all()
    return scenarios

@router.get("/{scenario_id}", response_model=schemas.RiskScenarioResponse)
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    scenario = db.query(models.RiskScenario).filter(models.RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@router.put("/{scenario_id}", response_model=schemas.RiskScenarioResponse)
def update_scenario(scenario_id: int, scenario_update: schemas.RiskScenarioBase, db: Session = Depends(get_db)):
    scenario = db.query(models.RiskScenario).filter(models.RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
        
    for key, value in scenario_update.dict().items():
        setattr(scenario, key, value)
        
    db.commit()
    db.refresh(scenario)
    return scenario
