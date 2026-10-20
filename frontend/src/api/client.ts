import {
  PatientEHR,
  TelemetryResponse,
  PredictionResult,
  WhatIfScenarioRequest,
  WhatIfScenarioResponse,
  ModelMetricsResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function fetchPatients(): Promise<PatientEHR[]> {
  const res = await fetch(`${API_BASE}/api/patients`);
  if (!res.ok) throw new Error(`Failed to fetch patients: ${res.statusText}`);
  return res.json();
}

export async function fetchPatientDetail(patientId: string): Promise<PatientEHR> {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch patient ${patientId}: ${res.statusText}`);
  return res.json();
}

export async function fetchTelemetry(patientId: string, historySteps = 72): Promise<TelemetryResponse> {
  const res = await fetch(`${API_BASE}/api/patients/${patientId}/telemetry?history_steps=${historySteps}`);
  if (!res.ok) throw new Error(`Failed to fetch telemetry for ${patientId}: ${res.statusText}`);
  return res.json();
}

export async function fetchPrediction(patientId: string): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE}/api/predict/${patientId}`);
  if (!res.ok) throw new Error(`Failed to fetch prediction for ${patientId}: ${res.statusText}`);
  return res.json();
}

export async function runWhatIfScenario(request: WhatIfScenarioRequest): Promise<WhatIfScenarioResponse> {
  const res = await fetch(`${API_BASE}/api/whatif/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok) throw new Error(`Failed to simulate scenario: ${res.statusText}`);
  return res.json();
}

export async function advanceSimulationTime(patientId: string, minutes: number): Promise<any> {
  const res = await fetch(`${API_BASE}/api/simulation/${patientId}/step`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ minutes }),
  });
  if (!res.ok) throw new Error(`Failed to advance simulation: ${res.statusText}`);
  return res.json();
}

export async function resetSimulationTwin(patientId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/simulation/${patientId}/reset`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to reset twin: ${res.statusText}`);
  return res.json();
}

export async function injectAnomaly(patientId: string, anomalyType: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/simulation/${patientId}/anomaly`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ anomaly_type: anomalyType }),
  });
  if (!res.ok) throw new Error(`Failed to inject anomaly: ${res.statusText}`);
  return res.json();
}

export async function clearAnomalies(patientId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/api/simulation/${patientId}/clear-anomalies`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error(`Failed to clear anomalies: ${res.statusText}`);
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetricsResponse> {
  const res = await fetch(`${API_BASE}/api/metrics`);
  if (!res.ok) throw new Error(`Failed to fetch model metrics: ${res.statusText}`);
  return res.json();
}
