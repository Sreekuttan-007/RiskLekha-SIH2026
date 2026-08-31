import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getScenarios = async () => {
  const res = await apiClient.get('/scenarios/');
  return res.data;
};

export const getControlsForScenario = async (scenarioId: number) => {
  const res = await apiClient.get(`/controls/scenario/${scenarioId}`);
  return res.data;
};

export const getOptimization = async (scenarioId: number, budget: number) => {
  const res = await apiClient.get(`/optimization/${scenarioId}?budget=${budget}`);
  return res.data;
};

export const getSimulation = async (scenarioId: number) => {
  const res = await apiClient.get(`/simulation/${scenarioId}`);
  return res.data;
};

export const getProvenanceForScenario = async (scenarioId: number) => {
  const res = await apiClient.get(`/provenance/scenario/${scenarioId}`);
  return res.data;
};
