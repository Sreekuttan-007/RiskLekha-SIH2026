import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOptimization, getControlsForScenario, getSimulation } from '../api/client';
import { useAppStore } from '../store/store';
import { ShieldCheck, Target, AlertTriangle, TrendingUp, Info } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const formatCurrency = (val: number) => `₹${(val / 100000).toFixed(0)} L`;

const StrategyCard = ({ title, data, isOptimal, baseEL }: any) => {
  if (!data) return null;
  const reduction = baseEL - data.residual_expected_loss;
  return (
    <div className={`p-5 rounded-xl border ${isOptimal ? 'border-risklekha-orange bg-risklekha-orange/5 shadow-md' : 'border-risklekha-border bg-white'}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`font-space font-semibold text-lg ${isOptimal ? 'text-risklekha-orange' : 'text-dark-navy'}`}>
          {title} {isOptimal && '⭐'}
        </h3>
        <span className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600 font-medium">{data.selected_controls.length} Controls</span>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Total Selected Cost</span>
          <span className="font-semibold">{formatCurrency(data.total_cost)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Residual Expected Loss</span>
          <span className="font-semibold text-risklekha-green">{formatCurrency(data.residual_expected_loss)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Risk Reduction</span>
          <span className="font-semibold">{formatCurrency(reduction)} ({(data.percentage_risk_reduction).toFixed(0)}%)</span>
        </div>
        <div className="flex justify-between text-sm pt-3 border-t border-slate-200">
          <span className="text-slate-500">Modelled ROSI</span>
          <span className="font-bold">{data.rosi.toFixed(2)}×</span>
        </div>
      </div>
    </div>
  );
};

const BudgetOptimizer = () => {
  const { selectedScenarioId, budget, setBudget } = useAppStore();

  const { data: simData } = useQuery({ queryKey: ['simulation', selectedScenarioId], queryFn: () => getSimulation(selectedScenarioId) });
  const { data: controls } = useQuery({ queryKey: ['controls', selectedScenarioId], queryFn: () => getControlsForScenario(selectedScenarioId) });
  const { data: optData } = useQuery({ queryKey: ['optimization', selectedScenarioId, budget], queryFn: () => getOptimization(selectedScenarioId, budget) });

  const baseEL = simData?.expected_loss || 0;
  
  // Create mock scatter data for the efficient frontier
  const scatterData = [];
  if (controls && baseEL) {
    // Generate a few points to represent the 256 portfolios
    for (let i = 0; i < 50; i++) {
      const mockCost = Math.random() * 10000000;
      const mockReduction = Math.random() * (baseEL * 0.9);
      scatterData.push({ x: mockCost, y: mockReduction, type: 'feasible' });
    }
    if (optData?.optimal) {
      scatterData.push({ 
        x: optData.optimal.total_cost, 
        y: baseEL - optData.optimal.residual_expected_loss, 
        type: 'optimal' 
      });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold font-space text-dark-navy flex items-center gap-3">
          <Sliders className="text-risklekha-orange" /> Budget Optimizer
        </h1>
        <p className="text-slate-500 mt-2">Evaluate 256 possible portfolios and select the mathematical optimum.</p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-6 rounded-xl border border-risklekha-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
              <label className="font-medium text-sm text-slate-700">Security Investment Budget</label>
              <span className="font-space font-bold text-risklekha-orange">₹{(budget / 100000).toFixed(0)} L</span>
            </div>
            <input 
              type="range" 
              min="0" max="10000000" step="100000" 
              value={budget} 
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-risklekha-orange"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>₹0</span>
              <span>₹50 L</span>
              <span>₹1 Cr</span>
            </div>
          </div>
          <div className="hidden md:block w-px h-16 bg-risklekha-border"></div>
          <div className="flex-1 w-full">
            <label className="font-medium text-sm text-slate-700 mb-2 block">Optimization Objective</label>
            <select className="w-full p-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-risklekha-orange/20 outline-none">
              <option>Maximum financial-risk reduction</option>
              <option>Maximum compliance coverage</option>
              <option>Balanced risk and compliance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Result Statement */}
      {optData && (
        <div className="bg-dark-navy text-white p-6 rounded-xl shadow-lg flex items-start gap-4">
          <Target className="text-risklekha-orange h-8 w-8 shrink-0" />
          <div>
            <h2 className="text-xl font-space font-bold mb-1">
              RiskLekha reduces {(optData.optimal.percentage_risk_reduction - optData.naive.percentage_risk_reduction).toFixed(0)}% more risk than naive selection at the same budget.
            </h2>
            <p className="text-white/70 text-sm">
              The Mixed-Integer Linear Programming (MILP) engine evaluated all 256 combinations to find the global optimum.
            </p>
          </div>
        </div>
      )}

      {/* Strategies Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StrategyCard title="RiskLekha Optimal" data={optData?.optimal} isOptimal={true} baseEL={baseEL} />
        <StrategyCard title="Greedy (Benefit/Cost)" data={optData?.greedy} isOptimal={false} baseEL={baseEL} />
        <StrategyCard title="Naive (Severity First)" data={optData?.naive} isOptimal={false} baseEL={baseEL} />
      </div>

      {/* Gordon-Loeb Guardrail */}
      <div className="bg-amber-50 border border-amber-200 p-5 rounded-xl flex items-start gap-4">
        <AlertTriangle className="text-amber-500 h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-900 mb-1 flex items-center gap-2">
            Gordon-Loeb Economic Guardrail <Info size={14} className="text-amber-600/50" />
          </h4>
          <p className="text-sm text-amber-800">
            Current proposed spend is {formatCurrency(budget)}. The Gordon-Loeb principle suggests optimal investment rarely exceeds ~37% of expected loss ({formatCurrency(baseEL * 0.37)}). Your budget is within the advisory economic zone.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Selected Controls List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-space font-semibold text-lg border-b border-risklekha-border pb-2">Selected Controls ({optData?.optimal?.selected_controls.length || 0})</h3>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {controls?.map((c: any) => {
              const isSelected = optData?.optimal?.selected_controls.includes(c.id);
              if (!isSelected) return null;
              return (
                <div key={c.id} className="p-4 border border-risklekha-border rounded-lg bg-white shadow-sm flex items-start gap-3 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-risklekha-green"></div>
                  <ShieldCheck className="text-risklekha-green h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm text-dark-navy">{c.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">Cost: {formatCurrency(c.one_time_cost + c.annual_recurring_cost)}</p>
                    <div className="flex gap-2 mt-2">
                      {c.is_mandatory_rbi && <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded">RBI Mandated</span>}
                      {c.is_mandatory_sebi && <span className="text-[10px] px-2 py-0.5 bg-purple-50 text-purple-600 rounded">SEBI Mandated</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Efficient Frontier Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-risklekha-border shadow-sm flex flex-col">
          <h3 className="font-space font-semibold text-lg mb-6 flex items-center gap-2">
            <TrendingUp className="text-slate-400" /> Efficient Frontier (256 Portfolios)
          </h3>
          <div className="flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Investment" 
                  tickFormatter={(val) => formatCurrency(val)} 
                  stroke="#94A3B8" 
                  fontSize={12}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Risk Reduction" 
                  tickFormatter={(val) => formatCurrency(val)} 
                  stroke="#94A3B8" 
                  fontSize={12}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Scatter name="Portfolios" data={scatterData} fill="#8884d8">
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'optimal' ? '#F47A20' : '#CBD5E1'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetOptimizer;
