import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from ..database import Base
from ..models import User, Institution, Asset, RiskScenario, SecurityControl, ProvenanceRecord
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./risklekha.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Clear existing
    db.query(ProvenanceRecord).delete()
    db.query(SecurityControl).delete()
    db.query(RiskScenario).delete()
    db.query(Asset).delete()
    db.query(Institution).delete()
    db.query(User).delete()
    
    # 2. Users
    db.add(User(email="principal@risklekha.demo", hashed_password=pwd_context.hash("demo_password"), role="Principal"))
    db.add(User(email="analyst@risklekha.demo", hashed_password=pwd_context.hash("demo_password"), role="Analyst"))
    db.add(User(email="auditor@risklekha.demo", hashed_password=pwd_context.hash("demo_password"), role="Auditor"))
    
    # 3. Institution & Asset
    inst = Institution(name="Demo AICTE Institute", type="AICTE")
    db.add(inst)
    db.flush()
    
    asset = Asset(name="Student Information Database", description="Primary SIS", institution_id=inst.id)
    db.add(asset)
    db.flush()
    
    # 4. Risk Scenario
    # Base EL = 1.0 * (10,000,00 + 200,000,00 + 525,000,00) / 3 = 2,45,00,000 (2.45 Cr)
    scenario = RiskScenario(
        name="Ransomware on Student DB",
        asset_id=asset.id,
        threat="Ransomware",
        impact="Service disruption and student-data exposure",
        lambda_val=1.0,
        loss_min=1000000.0,    # 10 L
        loss_mode=20000000.0,  # 2 Cr
        loss_max=52500000.0,   # 5.25 Cr
        downtime_duration=72.0,
        cost_per_hour=50000.0
    )
    db.add(scenario)
    db.flush()
    
    # 5. Controls
    controls_data = [
        ("Privileged-account MFA", 500000, 200000, 0.40, 0.00, True),  # RBI mandatory
        ("Immutable/offline backups", 1000000, 300000, 0.00, 0.45, False),
        ("Endpoint Detection and Response", 800000, 400000, 0.30, 0.10, False),
        ("Network segmentation", 1500000, 100000, 0.20, 0.20, False),
        ("Automated patch management", 400000, 100000, 0.25, 0.05, False),
        ("Email and phishing protection", 300000, 200000, 0.35, 0.00, False),
        ("Security awareness training", 200000, 100000, 0.15, 0.00, False),
        ("Database activity monitoring", 900000, 200000, 0.10, 0.15, True), # SEBI mandatory proxy
    ]
    
    # To hit ~49L with optimal selection: 
    # EDR (12L), MFA (7L), Backups (13L), Phishing (5L), Patch (5L), Awareness (3L) = 45L.
    
    for name, otc, arc, fr, mr, is_man in controls_data:
        db.add(SecurityControl(
            scenario_id=scenario.id,
            name=name,
            description=f"Standard implementation of {name}",
            one_time_cost=otc,
            annual_recurring_cost=arc,
            frequency_reduction_factor=fr,
            magnitude_reduction_factor=mr,
            implementation_duration=30,
            is_mandatory_rbi=is_man,
            is_mandatory_sebi=is_man
        ))
        
    # 6. Provenance
    db.add(ProvenanceRecord(
        metric_name="Base Expected Annual Loss",
        value=24500000.0,
        unit="INR",
        source_name="IBM Cost of a Data Breach Report 2023 (Education Sector Benchmark)",
        source_url="https://www.ibm.com/reports/data-breach",
        status="Assumed",
        confidence="Medium",
        scenario_id=scenario.id
    ))
    
    db.commit()
    db.close()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
