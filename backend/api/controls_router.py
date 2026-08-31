from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/controls", tags=["Controls"])

@router.get("/scenario/{scenario_id}", response_model=List[schemas.SecurityControlResponse])
def get_controls_for_scenario(scenario_id: int, db: Session = Depends(get_db)):
    controls = db.query(models.SecurityControl).filter(models.SecurityControl.scenario_id == scenario_id).all()
    return controls

@router.get("/{control_id}", response_model=schemas.SecurityControlResponse)
def get_control(control_id: int, db: Session = Depends(get_db)):
    control = db.query(models.SecurityControl).filter(models.SecurityControl.id == control_id).first()
    if not control:
        raise HTTPException(status_code=404, detail="Control not found")
    return control
