from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    role: str

class UserResponse(UserBase):
    id: int
    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    name: str
    description: str

class SecurityControlBase(BaseModel):
    name: str
    description: str
    one_time_cost: float
    annual_recurring_cost: float
    frequency_reduction_factor: float
    magnitude_reduction_factor: float
    implementation_duration: int
    is_mandatory_rbi: bool
    is_mandatory_sebi: bool

class SecurityControlResponse(SecurityControlBase):
    id: int
    scenario_id: int
    class Config:
        from_attributes = True

class RiskScenarioBase(BaseModel):
    name: str
    threat: str
    impact: str
    lambda_val: float
    loss_min: float
    loss_mode: float
    loss_max: float

class RiskScenarioResponse(RiskScenarioBase):
    id: int
    asset_id: int
    class Config:
        from_attributes = True

class SimulationResult(BaseModel):
    expected_loss: float
    var_95: float
    cvar_95: float
    median_loss: float

class PortfolioResponse(BaseModel):
    selected_controls: List[int]
    total_cost: float
    residual_expected_loss: float
    absolute_risk_reduction: float
    percentage_risk_reduction: float
    rosi: float
    compliance_coverage: float

class ProvenanceRecordResponse(BaseModel):
    id: int
    metric_name: str
    value: float
    unit: str
    source_name: str
    source_url: str
    status: str
    confidence: str
    class Config:
        from_attributes = True
