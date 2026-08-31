import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProvenanceForScenario } from '../api/client';
import { useAppStore } from '../store/store';
import { X, Info, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';
import { motion, AnimatePresence } from 'framer-motion';

// Separate store just for drawer state
interface DrawerState {
  isOpen: boolean;
  metricName: string | null;
  openDrawer: (metricName: string) => void;
  closeDrawer: () => void;
}

export const useDrawerStore = create<DrawerState>((set) => ({
  isOpen: false,
  metricName: null,
  openDrawer: (metricName) => set({ isOpen: true, metricName }),
  closeDrawer: () => set({ isOpen: false, metricName: null }),
}));

export const ProvenanceIcon = ({ metricName }: { metricName: string }) => {
  const openDrawer = useDrawerStore((state) => state.openDrawer);
  return (
    <button 
      onClick={(e) => {
        e.stopPropagation();
        openDrawer(metricName);
      }}
      className="inline-flex items-center justify-center rounded-full p-1 hover:bg-slate-200 transition-colors ml-1 text-slate-500 hover:text-risklekha-orange"
      title="View Provenance"
    >
      <Info size={14} />
    </button>
  );
};

const ProvenanceDrawer = () => {
  const { isOpen, metricName, closeDrawer } = useDrawerStore();
  const scenarioId = useAppStore(state => state.selectedScenarioId);
  
  const { data: provenanceRecords, isLoading } = useQuery({
    queryKey: ['provenance', scenarioId],
    queryFn: () => getProvenanceForScenario(scenarioId),
    enabled: isOpen
  });

  const record = provenanceRecords?.find((r: any) => r.metric_name === metricName) || provenanceRecords?.[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-navy/20 backdrop-blur-sm z-40"
            onClick={closeDrawer}
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-white shadow-2xl z-50 flex flex-col border-l border-risklekha-border"
          >
            <div className="p-6 border-b border-risklekha-border flex justify-between items-center bg-risklekha-bg">
              <h2 className="font-space font-semibold text-lg flex items-center gap-2">
                <Info className="text-risklekha-orange h-5 w-5" />
                Data Provenance
              </h2>
              <button onClick={closeDrawer} className="text-slate-500 hover:text-dark-navy">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-risklekha-orange"></div></div>
              ) : record ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Metric</h3>
                    <p className="text-xl font-space font-medium text-dark-navy">{record.metric_name}</p>
                  </div>
                  
                  <div className="bg-risklekha-bg p-4 rounded-lg border border-risklekha-border space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Value Used</span>
                      <span className="font-space font-bold text-lg text-dark-navy">
                        {record.value.toLocaleString('en-IN')} {record.unit}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        record.status === 'Assumed' ? 'bg-amber-100 text-amber-700' : 'bg-risklekha-green/10 text-risklekha-green'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600">Confidence</span>
                      <span className="text-sm font-medium text-slate-700">{record.confidence}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Source</h3>
                    <div className="border border-risklekha-border rounded-lg p-4">
                      <p className="font-medium text-sm mb-2">{record.source_name}</p>
                      {record.source_url && (
                        <a href={record.source_url} target="_blank" rel="noreferrer" className="text-risklekha-orange hover:underline text-sm flex items-center gap-1">
                          View External Source <ExternalLink size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {record.status === 'Assumed' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                      <div className="text-sm">
                        <p className="font-semibold mb-1">Assumption Notice</p>
                        <p>This value is an adjusted benchmark assumption. Direct telemetry for Indian educational institutions is currently limited.</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-navy/5 border border-slate-navy/10 rounded-lg p-4 flex gap-3 text-slate-700">
                    <ShieldCheck className="h-5 w-5 shrink-0 text-slate-500" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Mathematical Engine</p>
                      <p>Calculated via Compound Poisson-Triangular Monte Carlo simulation (10,000 iterations, Seed: 42).</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  No provenance record found for this metric.
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ProvenanceDrawer;
