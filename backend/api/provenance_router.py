from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/provenance", tags=["Provenance"])

@router.get("/scenario/{scenario_id}", response_model=List[schemas.ProvenanceRecordResponse])
def get_provenance_for_scenario(scenario_id: int, db: Session = Depends(get_db)):
    records = db.query(models.ProvenanceRecord).filter(models.ProvenanceRecord.scenario_id == scenario_id).all()
    return records
