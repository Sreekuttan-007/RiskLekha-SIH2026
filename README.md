# RiskLekha

“Every rupee of cyber risk, quantified. Every rupee of budget, optimized.”

**Team**: Beluga
**Problem Statement**: SIH26105 - AI-Powered Continuous Cyber Risk Quantification and Investment Optimization Platform
**Organization**: AICTE
**Theme**: Blockchain & Cybersecurity

## What is RiskLekha?
RiskLekha is an open, explainable cyber-risk quantification and budget-optimization platform designed for resource-constrained Indian institutions. It transforms technical cybersecurity telemetry into actionable financial metrics (Expected Annual Loss, VaR95, CVaR95) and uses advanced operations research to find the optimal security control portfolio under hard budget constraints.

## Core Mathematical Model
The platform uses a **Compound Poisson-Triangular** simulation engine.
- **Why this model?** In cybersecurity, incident frequency is inherently uncertain and discrete (modeled via Poisson), while the financial impact of an incident is highly variable but can usually be bounded by experts (modeled via a Triangular distribution of Min, Mode, Max). This compound distribution perfectly captures the heavy-tailed nature of cyber risk without requiring massive historical datasets that institutions lack.
- **Expected Loss (EL)**: The mathematical mean of the aggregate annual loss.
- **VaR95**: The Value at Risk at 95% confidence (the loss threshold we are 95% confident we will not exceed).
- **CVaR95**: Conditional Value at Risk (the expected loss *given* that we exceed the VaR95 threshold). Captures extreme tail risk.
- **Loss Exceedance Curve (LEC)**: A probability curve showing the likelihood of exceeding any given financial loss.

## Optimizer Formulation & Verification
The platform uses **Mixed-Integer Linear Programming (MILP)** to select the optimal portfolio of controls. 
- Because control effects are multiplicative (diminishing returns), direct optimization is non-linear. 
- **Valid Formulation**: We formulate it as a linear one-hot portfolio selection problem. We enumerate all feasible portfolios, calculate their residual risk, and the MILP selects exactly one portfolio that minimizes Expected Loss subject to the budget constraint.
- **Verification**: The system independently runs a brute-force enumeration of all 256 possible portfolios (2^8 controls) to guarantee the MILP output has a 0.00% optimality gap.

## Demo Calibration
The default scenario ("Ransomware on Student DB") is seeded with synthetic but realistic calibration parameters to demonstrate the platform's capabilities:
- **Base Expected Loss**: ~₹2.45 Cr
- **Optimized Portfolio Cost**: ₹49 L (under a ₹50 L budget)
- **Residual Expected Loss**: ~₹0.41 Cr
- **Modelled ROSI**: ~3.17×
- The optimal MILP strategy significantly outperforms naive (severity-first) selection, demonstrating the value of quantitative optimization.

## Gordon-Loeb Advisory
The platform displays the Gordon-Loeb economic guardrail (advising that optimal security investment rarely exceeds ~37% of expected loss). This is treated as an advisory benchmark, not a hard legal limit, to guide executive decision-making.

## Compliance Disclaimer
RiskLekha provides probabilistic decision-support estimates based on available telemetry, public benchmarks, and user-supplied assumptions. **Results are not guarantees of future loss, regulatory compliance, or investment performance.**

## Project Architecture & Local Setup
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts
- **Backend**: Python 3.11+, FastAPI, PostgreSQL, NumPy, PuLP

### Running Locally (Native Setup)
1. Navigate to the `backend` directory.
2. Install Python dependencies: `pip install -r requirements.txt`
3. Run the database seed script: `python -m scripts.seed_data`
4. Start the FastAPI server: `uvicorn main:app --reload --port 8000`
5. In a new terminal, navigate to the `frontend` directory.
6. Install Node dependencies: `npm install`
7. Start the Vite React app: `npm run dev`
8. Access the platform at `http://localhost:5173`
