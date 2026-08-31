import { create } from 'zustand';

interface AppState {
  selectedInstitutionId: number;
  selectedScenarioId: number;
  budget: number;
  setBudget: (budget: number) => void;
  setSelectedScenarioId: (id: number) => void;
  // Executive/Technical View Toggle
  isTechnicalView: boolean;
  setIsTechnicalView: (isTechnical: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedInstitutionId: 1, // Default for MVP Demo
  selectedScenarioId: 1, // Default for MVP Demo
  budget: 5000000, // Default to 50L as per demo instructions
  setBudget: (budget) => set({ budget }),
  setSelectedScenarioId: (id) => set({ selectedScenarioId: id }),
  isTechnicalView: false,
  setIsTechnicalView: (isTechnical) => set({ isTechnicalView: isTechnical }),
}));
