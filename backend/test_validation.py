import pytest
import math
from .core.simulation import run_monte_carlo_simulation
from .core.optimization import optimize_portfolio
from .models import SecurityControl

def test_simulation_reproducibility():
    res1 = run_monte_carlo_simulation(1.0, 1000000, 20000000, 52500000, seed=42)
    res2 = run_monte_carlo_simulation(1.0, 1000000, 20000000, 52500000, seed=42)
    assert res1["expected_loss"] == res2["expected_loss"]
    assert res1["var_95"] == res2["var_95"]

def test_cvar_greater_than_var():
    res = run_monte_carlo_simulation(1.0, 1000000, 20000000, 52500000, seed=42)
    assert res["cvar_95"] >= res["var_95"]

def test_optimization_does_not_exceed_budget():
    controls = [
        SecurityControl(name="C1", one_time_cost=10000, annual_recurring_cost=0, frequency_reduction_factor=0.5, magnitude_reduction_factor=0.0),
        SecurityControl(name="C2", one_time_cost=20000, annual_recurring_cost=0, frequency_reduction_factor=0.5, magnitude_reduction_factor=0.0)
    ]
    budget = 15000
    res = optimize_portfolio(controls, budget, 1.0, 1000000, 20000000, 52500000)
    assert res["cost"] <= budget
    
def test_zero_budget_selects_no_controls():
    controls = [
        SecurityControl(name="C1", one_time_cost=10000, annual_recurring_cost=0, frequency_reduction_factor=0.5, magnitude_reduction_factor=0.0),
    ]
    budget = 0
    res = optimize_portfolio(controls, budget, 1.0, 1000000, 20000000, 52500000)
    assert len(res["indices"]) == 0
    assert res["cost"] == 0
