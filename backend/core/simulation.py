import numpy as np

def run_monte_carlo_simulation(lambda_val: float, loss_min: float, loss_mode: float, loss_max: float, iterations: int = 10000, seed: int = 42) -> dict:
    np.random.seed(seed)
    
    # N ~ Poisson(lambda)
    N = np.random.poisson(lambda_val, iterations)
    
    # Pre-calculate sizes for triangular distribution sampling
    total_events = np.sum(N)
    
    if total_events > 0:
        # Generate all losses at once for efficiency
        losses = np.random.triangular(loss_min, loss_mode, loss_max, total_events)
        
        # Aggregate losses per simulation year
        # Split the flattened losses array based on the number of events per year
        split_indices = np.cumsum(N)[:-1]
        loss_per_year = np.split(losses, split_indices)
        
        S = np.array([np.sum(year_losses) for year_losses in loss_per_year])
    else:
        S = np.zeros(iterations)

    expected_loss = float(np.mean(S))
    median_loss = float(np.median(S))
    var_95 = float(np.percentile(S, 95))
    
    # CVaR95
    cvar_95_losses = S[S >= var_95]
    cvar_95 = float(np.mean(cvar_95_losses)) if len(cvar_95_losses) > 0 else var_95

    return {
        "expected_loss": expected_loss,
        "median_loss": median_loss,
        "var_95": var_95,
        "cvar_95": cvar_95,
        "losses_sample": S.tolist() # Might want to downsample this for API response if needed
    }
