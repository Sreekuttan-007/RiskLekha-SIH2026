def evaluate_naive_strategy(controls, budget, base_lambda, base_loss_min, base_loss_mode, base_loss_max):
    """
    Naive strategy: rank controls by a simplistic heuristic (e.g., maximum theoretical benefit ignoring cost, 
    or simply order them by some assumed severity metric). For MVP, we'll rank by highest individual percentage 
    reduction of EL (frequency + magnitude combined), ignoring cost.
    """
    ranked_controls = sorted(controls, key=lambda c: (1 - c.frequency_reduction_factor)*(1 - c.magnitude_reduction_factor))
    
    selected_indices = []
    current_cost = 0
    
    # We need indices to match the original array
    original_indices = {c.name: i for i, c in enumerate(controls)}
    
    for c in ranked_controls:
        c_cost = c.one_time_cost + c.annual_recurring_cost
        if current_cost + c_cost <= budget:
            selected_indices.append(original_indices[c.name])
            current_cost += c_cost
            
    # Calculate residual expected loss
    from .optimization import evaluate_portfolio
    eval_res = evaluate_portfolio(controls, selected_indices, base_lambda, base_loss_min, base_loss_mode, base_loss_max)
    el = eval_res["residual_lambda"] * ((eval_res["residual_loss_min"] + eval_res["residual_loss_mode"] + eval_res["residual_loss_max"]) / 3)
    
    return {
        "indices": selected_indices,
        "cost": current_cost,
        "expected_loss": el
    }

def evaluate_greedy_strategy(controls, budget, base_lambda, base_loss_min, base_loss_mode, base_loss_max):
    """
    Greedy strategy: iteratively select the control that offers the highest marginal expected loss reduction per rupee.
    """
    from .optimization import evaluate_portfolio
    
    selected_indices = []
    current_cost = 0
    available_indices = list(range(len(controls)))
    
    current_lambda = base_lambda
    current_min = base_loss_min
    current_mode = base_loss_mode
    current_max = base_loss_max
    
    current_el = current_lambda * ((current_min + current_mode + current_max) / 3)
    
    while True:
        best_idx = -1
        best_ratio = -1
        best_new_el = current_el
        
        for idx in available_indices:
            c = controls[idx]
            c_cost = c.one_time_cost + c.annual_recurring_cost
            
            if current_cost + c_cost > budget:
                continue
                
            # Marginal impact
            new_lambda = current_lambda * (1 - c.frequency_reduction_factor)
            new_min = current_min * (1 - c.magnitude_reduction_factor)
            new_mode = current_mode * (1 - c.magnitude_reduction_factor)
            new_max = current_max * (1 - c.magnitude_reduction_factor)
            
            new_el = new_lambda * ((new_min + new_mode + new_max) / 3)
            reduction = current_el - new_el
            
            if c_cost > 0:
                ratio = reduction / c_cost
                if ratio > best_ratio:
                    best_ratio = ratio
                    best_idx = idx
                    best_new_el = new_el
                    
        if best_idx != -1:
            selected_indices.append(best_idx)
            available_indices.remove(best_idx)
            
            c = controls[best_idx]
            current_cost += c.one_time_cost + c.annual_recurring_cost
            current_lambda *= (1 - c.frequency_reduction_factor)
            current_min *= (1 - c.magnitude_reduction_factor)
            current_mode *= (1 - c.magnitude_reduction_factor)
            current_max *= (1 - c.magnitude_reduction_factor)
            current_el = best_new_el
        else:
            break
            
    return {
        "indices": selected_indices,
        "cost": current_cost,
        "expected_loss": current_el
    }
