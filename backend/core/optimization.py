import itertools
import pulp

def evaluate_portfolio(controls, selected_indices, base_lambda, base_loss_min, base_loss_mode, base_loss_max):
    # Evaluates residual risk for a given selection of controls
    residual_lambda = base_lambda
    residual_loss_min = base_loss_min
    residual_loss_mode = base_loss_mode
    residual_loss_max = base_loss_max
    cost = 0
    
    for idx in selected_indices:
        control = controls[idx]
        residual_lambda *= (1 - control.frequency_reduction_factor)
        residual_loss_min *= (1 - control.magnitude_reduction_factor)
        residual_loss_mode *= (1 - control.magnitude_reduction_factor)
        residual_loss_max *= (1 - control.magnitude_reduction_factor)
        cost += control.one_time_cost + control.annual_recurring_cost # MVP simplification: consider total 1st year cost
        
    return {
        "cost": cost,
        "residual_lambda": max(0, residual_lambda),
        "residual_loss_min": max(0, residual_loss_min),
        "residual_loss_mode": max(0, residual_loss_mode),
        "residual_loss_max": max(0, residual_loss_max)
    }

def optimize_portfolio(controls, budget, base_lambda, base_loss_min, base_loss_mode, base_loss_max):
    # 1. Enumerate all 256 portfolios
    n = len(controls)
    all_portfolios = []
    
    for i in range(2**n):
        selected_indices = [j for j in range(n) if (i & (1 << j))]
        eval_result = evaluate_portfolio(controls, selected_indices, base_lambda, base_loss_min, base_loss_mode, base_loss_max)
        
        # Calculate expected loss directly via EV of Poisson * EV of Triangular
        ev_N = eval_result["residual_lambda"]
        ev_L = (eval_result["residual_loss_min"] + eval_result["residual_loss_mode"] + eval_result["residual_loss_max"]) / 3
        expected_loss = ev_N * ev_L
        
        all_portfolios.append({
            "indices": selected_indices,
            "cost": eval_result["cost"],
            "expected_loss": expected_loss
        })
        
    # Filter feasible portfolios
    feasible_portfolios = [p for p in all_portfolios if p["cost"] <= budget]
    
    if not feasible_portfolios:
        return {"indices": [], "cost": 0, "expected_loss": base_lambda * ((base_loss_min + base_loss_mode + base_loss_max) / 3)}
        
    # 2. MILP Formulation (One-hot selection of portfolio)
    prob = pulp.LpProblem("Portfolio_Optimization", pulp.LpMinimize)
    
    # Variables: y_p for each feasible portfolio
    portfolio_vars = []
    for i, p in enumerate(feasible_portfolios):
        var = pulp.LpVariable(f"y_{i}", cat=pulp.LpBinary)
        portfolio_vars.append((var, p))
        
    # Constraint: Exactly one portfolio selected
    prob += pulp.lpSum([v for v, p in portfolio_vars]) == 1
    
    # Constraint: Budget (already handled by filtering, but we can add it explicitly)
    prob += pulp.lpSum([v * p["cost"] for v, p in portfolio_vars]) <= budget
    
    # Objective: Minimize expected loss
    prob += pulp.lpSum([v * p["expected_loss"] for v, p in portfolio_vars])
    
    # Solve
    prob.solve(pulp.PULP_CBC_CMD(msg=False))
    
    selected_portfolio = None
    for v, p in portfolio_vars:
        if pulp.value(v) == 1.0:
            selected_portfolio = p
            break
            
    if selected_portfolio is None:
        # Fallback to base
        selected_portfolio = {"indices": [], "cost": 0, "expected_loss": base_lambda * ((base_loss_min + base_loss_mode + base_loss_max) / 3)}
        
    return selected_portfolio
