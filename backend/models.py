from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from .database import Base
import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)

class Institution(Base):
    __tablename__ = "institutions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String) # AICTE, SME, NBFC

class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    description = Column(String)
    institution_id = Column(Integer, ForeignKey("institutions.id"))

class RiskScenario(Base):
    __tablename__ = "risk_scenarios"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    asset_id = Column(Integer, ForeignKey("assets.id"))
    threat = Column(String)
    impact = Column(String)
    lambda_val = Column(Float) # base incident frequency
    loss_min = Column(Float)
    loss_mode = Column(Float)
    loss_max = Column(Float)
    downtime_duration = Column(Float)
    cost_per_hour = Column(Float)

class SecurityControl(Base):
    __tablename__ = "security_controls"
    id = Column(Integer, primary_key=True, index=True)
    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"))
    name = Column(String)
    description = Column(String)
    one_time_cost = Column(Float)
    annual_recurring_cost = Column(Float)
    frequency_reduction_factor = Column(Float)
    magnitude_reduction_factor = Column(Float)
    implementation_duration = Column(Integer)
    is_mandatory_rbi = Column(Boolean, default=False)
    is_mandatory_sebi = Column(Boolean, default=False)

class ProvenanceRecord(Base):
    __tablename__ = "provenance_records"
    id = Column(Integer, primary_key=True, index=True)
    metric_name = Column(String)
    value = Column(Float)
    unit = Column(String)
    source_name = Column(String)
    source_url = Column(String)
    status = Column(String) # Observed, Assumed, etc.
    confidence = Column(String)
    scenario_id = Column(Integer, ForeignKey("risk_scenarios.id"), nullable=True)

class AuditEvent(Base):
    __tablename__ = "audit_events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    action = Column(String)
    details = Column(String)
