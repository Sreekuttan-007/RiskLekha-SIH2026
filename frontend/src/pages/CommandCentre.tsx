import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSimulation, getOptimization } from '../api/client';
import { useAppStore } from '../store/store';
import { ProvenanceIcon } from '../components/ProvenanceDrawer';
import { RefreshCw, TrendingDown, ShieldAlert, BarChart3, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area, ReferenceLine } from 'recharts';

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const CommandCentre = () => {
  const { selectedScenarioId, budget, isTechnicalView, setIsTechnicalView } = useAppStore();

  const { data: simData, isLoading: simLoading } = useQuery({
    queryKey: ['simulation', selectedScenarioId],
    queryFn: () => getSimulation(selectedScenarioId),
  });

  const { data: optData, isLoading: optLoading } = useQuery({
    queryKey: ['optimization', selectedScenarioId, budget],
    queryFn: () => getOptimization(selectedScenarioId, budget),
  });

  if (simLoading || optLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-risklekha-orange"></div>
      </div>
    );
  }

  const baseEL = simData?.expected_loss || 0;
  const residualEL = optData?.optimal?.residual_expected_loss || 0;
  const reduction = baseEL - residualEL;
  const reductionPercent = baseEL ? (reduction / baseEL) * 100 : 0;
  const rosi = optData?.optimal?.rosi || 0;

  // Mock data for charts
  const exceedanceData = [
    { loss: 5000000, prob: 0.99 },
    { loss: 10000000, prob: 0.85 },
    { loss: 20000000, prob: 0.50 },
    { loss: 30000000, prob: 0.25 },
    { loss: 40000000, prob: 0.10 },
    { loss: 50000000, prob: 0.05 },
    { loss: 60000000, prob: 0.01 },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold font-space text-dark-navy">Command Centre</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            Demo AICTE Institute <span className="text-xs px-2 py-0.5 bg-slate-200 rounded-full">AICTE</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-500">Last recalculated</p>
            <p className="text-sm font-medium flex items-center gap-1">
              <RefreshCw size={14} className="text-risklekha-green" /> Just now
            </p>
          </div>
          <button 
            onClick={() => setIsTechnicalView(!isTechnicalView)}
            className="px-4 py-2 border border-risklekha-border rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {isTechnicalView ? 'Switch to Executive View' : 'Switch to Technical View'}
          </button>
          <button className="px-4 py-2 bg-dark-navy text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-md">
            <ShieldAlert size={16} className="text-risklekha-orange" /> Simulate New Threat
          </button>
        </div>
      </div>

      {/* Flagship Transformation Card */}
      <div className="bg-gradient-to-br from-dark-navy to-slate-navy rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-risklekha-orange/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-white/70 font-medium mb-1 uppercase tracking-wider text-sm">Expected Annual Loss</p>
            <div className="flex items-baseline gap-4">
              <span className="text-5xl font-space font-bold text-critical-red/90 line-through decoration-critical-red/50 decoration-4">
                {formatCurrency(baseEL)}
              </span>
              <span className="text-4xl">→</</span>
              <span className="text-6xl font-space font-bold text-risklekha-green">
                {formatCurrency(residualEL)}
              </span>
              <ProvenanceIcon metricName="Base Expected Annual Loss" />
            </div>
            <p className="mt-4 text-white/80 max-w-xl">
              RiskLekha estimates an expected annual loss of <strong className="text-white">{formatCurrency(baseEL)}</strong> for the ransomware scenario. 
              Under a <strong className="text-white">{formatCurrency(budget)}</strong> budget, the optimized portfolio reduces expected loss to <strong className="text-white">{formatCurrency(residualEL)}</strong>.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-center min-w-[200px] border border-white/10">
            <TrendingDown size={32} className="mx-auto text-risklekha-orange mb-2" />
            <div className="text-3xl font-bold font-space">{reductionPercent.toFixed(0)}%</div>
            <div className="text-sm text-white/70 mt-1">Risk Reduction</div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-xl font-bold font-space">{rosi.toFixed(2)}×</div>
              <div className="text-xs text-white/70">Modelled ROSI</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-risklekha-border shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">VaR (95%) <ProvenanceIcon metricName="VaR95" /></p>
          <p className="text-2xl font-space font-bold text-dark-navy">{formatCurrency(simData?.var_95 || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-risklekha-border shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">CVaR (95%) <ProvenanceIcon metricName="CVaR95" /></p>
          <p className="text-2xl font-space font-bold text-critical-red">{formatCurrency(simData?.cvar_95 || 0)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-risklekha-border shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Current Security Budget</p>
          <p className="text-2xl font-space font-bold text-dark-navy">{formatCurrency(budget)}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-risklekha-border shadow-sm bg-risklekha-bg/50">
          <p className="text-slate-500 text-sm font-medium mb-1 flex items-center gap-1">
            <AlertCircle size={14} className="text-risklekha-orange" /> Compliance Gap
          </p>
          <p className="text-2xl font-space font-bold text-dark-navy">{optData?.optimal?.compliance_coverage.toFixed(0)}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-risklekha-border shadow-sm">
          <h3 className="font-space font-semibold text-lg mb-6 flex items-center gap-2">
            <BarChart3 className="text-slate-400" /> Loss Exceedance Curve (LEC)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exceedanceData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="loss" 
                  tickFormatter={(val) => formatCurrency(val)} 
                  stroke="#94A3B8" 
                  fontSize={12}
                />
                <YAxis 
                  tickFormatter={(val) => `${(val * 100).toFixed(0)}%`} 
                  stroke="#94A3B8" 
                  fontSize={12}
                />
                <RechartsTooltip 
                  formatter={(val: number) => [`${(val * 100).toFixed(1)}%`, 'Probability of Exceeding']}
                  labelFormatter={(val) => formatCurrency(val as number)}
                />
                <ReferenceLine x={simData?.var_95} stroke="#F47A20" strokeDasharray="3 3" label={{ position: 'top', value: 'VaR95', fill: '#F47A20', fontSize: 12 }} />
                <Area type="monotone" dataKey="prob" stroke="#26364D" fill="#4B5D76" fillOpacity={0.1} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-risklekha-border shadow-sm">
          <h3 className="font-space font-semibold text-lg mb-6 flex items-center gap-2">
            <TrendingDown className="text-slate-400" /> Vulnerability Velocity & Forecast
          </h3>
          <div className="h-72 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            ARIMA Forecast Visualization (Mockup for Demo)
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommandCentre;
