import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CommandCentre from './pages/CommandCentre';
import BudgetOptimizer from './pages/BudgetOptimizer';
import RiskLab from './pages/RiskLab';
import Sidebar from './components/Sidebar';
import ProvenanceDrawer from './components/ProvenanceDrawer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-risklekha-bg text-dark-navy font-inter">
          <Sidebar />
          <div className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/command-centre" replace />} />
              <Route path="/command-centre" element={<CommandCentre />} />
              <Route path="/optimizer" element={<BudgetOptimizer />} />
              <Route path="/lab" element={<RiskLab />} />
            </Routes>
          </div>
          <ProvenanceDrawer />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
