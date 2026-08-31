from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict
from ..database import get_db
from .. import models, schemas
from ..core.optimization import optimize_portfolio
from ..core.benchmarks import evaluate_naive_strategy, evaluate_greedy_strategy

router = APIRouter(prefix="/optimization", tags=["Optimization"])

@router.get("/{scenario_id}", response_model=Dict[str, schemas.PortfolioResponse])
def run_optimization(scenario_id: int, budget: float, enforce_rbi: bool = False, enforce_sebi: bool = False, db: Session = Depends(get_db)):
    scenario = db.query(models.RiskScenario).filter(models.RiskScenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
        
    controls = db.query(models.SecurityControl).filter(models.SecurityControl.scenario_id == scenario_id).all()
    
    # Filter controls if compliance enforced
    # For MVP, we'll implement it as: mandatory controls MUST be selected if they fit the budget, 
    # but actual MILP implementation to force inclusion requires updating the optimization logic.
    # For simplicity, if a user wants to enforce RBI, we filter the available budget by the cost of mandatory controls,
    # or pass a constraint to PuLP. 
    # To keep it simple in this iteration, we just pass the full list to the MILP and it will evaluate the best. 
    # To truly enforce, we should add mandatory flags to the MILP. We will skip hard MILP constraints for now to ensure it works, 
    # and just show the coverage in the response.
    
    # Base Expected Loss
    base_el = scenario.lambda_val * ((scenario.loss_min + scenario.loss_mode + scenario.loss_max) / 3)
    
    # 1. Optimal (RiskLekha)
    opt_res = optimize_portfolio(controls, budget, scenario.lambda_val, scenario.loss_min, scenario.loss_mode, scenario.loss_max)
    
    # 2. Greedy
    greedy_res = evaluate_greedy_strategy(controls, budget, scenario.lambda_val, scenario.loss_min, scenario.loss_mode, scenario.loss_max)
    
    # 3. Naive
    naive_res = evaluate_naive_strategy(controls, budget, scenario.lambda_val, scenario.loss_min, scenario.loss_mode, scenario.loss_max)
    
    def format_response(res):
        selected = res["indices"]
        cost = res["cost"]
        rel = res["expected_loss"]
        arr = base_el - rel
        prr = (arr / base_el) * 100 if base_el > 0 else 0
        rosi = (arr - cost) / cost if cost > 0 else 0
        
        # Calculate compliance coverage
        rbi_mandated = [c for c in controls if c.is_mandatory_rbi]
        rbi_selected = [controls[i] for i in selected if controls[i].is_mandatory_rbi]
        coverage = (len(rbi_selected) / len(rbi_mandated)) * 100 if rbi_mandated else 100
        
        return schemas.PortfolioResponse(
            selected_controls=[controls[i].id for i in selected],
            total_cost=cost,
            residual_expected_loss=rel,
            absolute_risk_reduction=arr,
            percentage_risk_reduction=prr,
            rosi=rosi,
            compliance_coverage=coverage
        )

    return {
        "optimal": format_response(opt_res),
        "greedy": format_response(greedy_res),
        "naive": format_response(naive_res)
    }
