import React, { useState, useEffect, useRef } from 'react';
import {
  fetchPatients,
  fetchTelemetry,
  fetchPrediction,
  runWhatIfScenario,
  advanceSimulationTime,
  resetSimulationTwin,
  injectAnomaly,
  clearAnomalies,
  fetchModelMetrics,
} from './api/client';
import {
  PatientEHR,
  TelemetryResponse,
  PredictionResult,
  WhatIfScenarioRequest,
  WhatIfScenarioResponse,
  ModelMetricsResponse,
} from './types';
import { ClinicalDisclaimerBanner } from './components/ClinicalDisclaimerBanner';
import { ClinicalSidebar } from './components/ClinicalSidebar';
import { ClinicianHeader } from './components/ClinicianHeader';
import { VitalsQuickBar } from './components/VitalsQuickBar';
import { PatientEHRCard } from './components/PatientEHRCard';
import { GlucoseTimeSeriesChart } from './components/GlucoseTimeSeriesChart';
import { RiskScoreGauge } from './components/RiskScoreGauge';
import { ExplainabilityPanel } from './components/ExplainabilityPanel';
import { WhatIfLab } from './components/WhatIfLab';
import { DataQualityCard } from './components/DataQualityCard';
import { ModelEvaluationModal } from './components/ModelEvaluationModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [patients, setPatients] = useState<PatientEHR[]>([]);
  const [currentPatientId, setCurrentPatientId] = useState<string>('PT-101');
  const [telemetry, setTelemetry] = useState<TelemetryResponse | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [scenarioResult, setScenarioResult] = useState<WhatIfScenarioResponse | null>(null);
  const [modelMetrics, setModelMetrics] = useState<ModelMetricsResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScenarioLoading, setIsScenarioLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('overview');

  const autoPlayTimerRef = useRef<any>(null);
  const whatIfSectionRef = useRef<HTMLDivElement | null>(null);

  // Initial Data Load
  useEffect(() => {
    async function init() {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const [patientsData, metricsData] = await Promise.all([
          fetchPatients(),
          fetchModelMetrics().catch(() => null),
        ]);
        setPatients(patientsData);
        if (metricsData) setModelMetrics(metricsData);

        const initialPid = patientsData[0]?.id || 'PT-101';
        setCurrentPatientId(initialPid);
        await refreshTwinData(initialPid);
      } catch (err: any) {
        console.error('Initialization error:', err);
        setErrorMessage(
          'Could not connect to the GlucoTwin AI Backend. Please ensure FastAPI is running on http://localhost:8000.'
        );
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Fetch telemetry and prediction for patient
  const refreshTwinData = async (pid: string) => {
    try {
      const [telem, pred] = await Promise.all([
        fetchTelemetry(pid, 72),
        fetchPrediction(pid),
      ]);
      setTelemetry(telem);
      setPrediction(pred);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Data refresh error:', err);
      setErrorMessage(`Failed to update digital twin telemetry for ${pid}: ${err.message}`);
    }
  };

  // Change patient
  const handleSelectPatient = async (pid: string) => {
    setCurrentPatientId(pid);
    setScenarioResult(null); // Clear counterfactual scenario
    setIsLoading(true);
    await refreshTwinData(pid);
    setIsLoading(false);
  };

  // Advance simulation clock
  const handleStepTime = async (minutes: number) => {
    try {
      await advanceSimulationTime(currentPatientId, minutes);
      await refreshTwinData(currentPatientId);
    } catch (err: any) {
      console.error('Advance simulation error:', err);
    }
  };

  // Reset twin clock
  const handleReset = async () => {
    try {
      await resetSimulationTwin(currentPatientId);
      setScenarioResult(null);
      await refreshTwinData(currentPatientId);
    } catch (err: any) {
      console.error('Reset simulation error:', err);
    }
  };

  // Toggle continuous auto-simulation
  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Continuous auto-simulation loop
  useEffect(() => {
    if (isPlaying) {
      autoPlayTimerRef.current = setInterval(async () => {
        try {
          await advanceSimulationTime(currentPatientId, 5);
          await refreshTwinData(currentPatientId);
        } catch (e) {
          console.error('Auto-step error', e);
        }
      }, 3500); // Step 5 min every 3.5s
    } else {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
        autoPlayTimerRef.current = null;
      }
    }
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPlaying, currentPatientId]);

  // Inject sensor anomaly
  const handleInjectAnomaly = async (type: string) => {
    try {
      await injectAnomaly(currentPatientId, type);
      await refreshTwinData(currentPatientId);
    } catch (err: any) {
      console.error('Inject anomaly error:', err);
    }
  };

  // Clear sensor anomalies
  const handleClearAnomalies = async () => {
    try {
      await clearAnomalies(currentPatientId);
      await refreshTwinData(currentPatientId);
    } catch (err: any) {
      console.error('Clear anomalies error:', err);
    }
  };

  // What-If Simulation runner
  const handleRunWhatIf = async (request: WhatIfScenarioRequest): Promise<WhatIfScenarioResponse | null> => {
    try {
      setIsScenarioLoading(true);
      const res = await runWhatIfScenario(request);
      setScenarioResult(res);
      return res;
    } catch (err: any) {
      console.error('What-If simulation error:', err);
      setErrorMessage(`What-If simulation failed: ${err.message}`);
      return null;
    } finally {
      setIsScenarioLoading(false);
    }
  };

  const handleClearScenario = () => {
    setScenarioResult(null);
  };

  const handleNavigateSection = (section: string) => {
    setActiveSection(section);
    if (section === 'whatif' && whatIfSectionRef.current) {
      whatIfSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentPatient = patients.find((p) => p.id === currentPatientId) || patients[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* 1. Clinical Disclaimer Top Banner */}
      <ClinicalDisclaimerBanner />

      {/* Main Workspace Layout with Left Sidebar */}
      <div className="flex-1 flex flex-row min-h-0">
        {/* Left Hospital Sidebar */}
        <div className="hidden md:flex">
          <ClinicalSidebar
            patients={patients}
            currentPatientId={currentPatientId}
            onSelectPatient={handleSelectPatient}
            onOpenModelModal={() => setIsModelModalOpen(true)}
            activeSection={activeSection}
            onNavigateSection={handleNavigateSection}
          />
        </div>

        {/* Center / Right Working Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 2. Compact Clinician Header */}
          <ClinicianHeader
            patients={patients}
            currentPatientId={currentPatientId}
            onSelectPatient={handleSelectPatient}
            currentTimeString={telemetry?.latest_reading?.timestamp || ''}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onStepTime={handleStepTime}
            onReset={handleReset}
            onInjectAnomaly={handleInjectAnomaly}
            onClearAnomalies={handleClearAnomalies}
            activeAnomalies={telemetry?.active_anomalies || []}
            qualityReport={prediction?.data_quality_report}
            onOpenModelModal={() => setIsModelModalOpen(true)}
          />

          {/* Main Clinical Command Workspace */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
            {/* Error Notification Banner if Backend is Disconnected */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4 text-rose-800 shadow-2xs">
                <div className="flex items-center gap-3 text-xs">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
                <button
                  onClick={() => refreshTwinData(currentPatientId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-900 text-xs font-semibold transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Connection
                </button>
              </div>
            )}

            {/* 3. Patient Overview Card */}
            {currentPatient ? (
              <PatientEHRCard patient={currentPatient} />
            ) : (
              <div className="hospital-card p-6 h-48 flex items-center justify-center text-slate-500">
                Loading Synthetic EHR profile...
              </div>
            )}

            {/* 4. Vitals & Current Simulated Telemetry Quick Bar */}
            <VitalsQuickBar
              latestReading={telemetry?.latest_reading}
              trendArrow={telemetry?.trend_arrow || 'FLAT'}
              rateOfChange={telemetry?.rate_of_change_15m || 0.0}
              qualityReport={prediction?.data_quality_report}
            />

            {/* 5. Main 2-Column Clinical Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Main Column: Large Glucose Chart + Lower Panels (7 of 12 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* Large Continuous Glucose & 2-Hour Forecast Corridor Chart */}
                <GlucoseTimeSeriesChart
                  history={telemetry?.history || []}
                  forecast={prediction?.forecast_curve || []}
                  scenarioForecast={scenarioResult?.scenario_forecast}
                  threshold={prediction?.target_threshold_mg_dl || 180.0}
                  currentPatientName={currentPatient?.name || 'Virtual Twin'}
                />

                {/* Lower Grid: Explainability & Data Quality */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ExplainabilityPanel
                    factors={prediction?.top_contributing_factors || []}
                  />
                  <DataQualityCard
                    report={prediction?.data_quality_report}
                    onInjectAnomaly={handleInjectAnomaly}
                    onClearAnomalies={handleClearAnomalies}
                    activeAnomalies={telemetry?.active_anomalies || []}
                  />
                </div>
              </div>

              {/* Right Column: 2-Hour Excursion Risk Gauge + What-If Lab (5 of 12 cols) */}
              <div className="lg:col-span-5 space-y-5">
                {/* 2-Hour Excursion Risk Gauge */}
                <RiskScoreGauge prediction={prediction || undefined} />

                {/* What-If Counterfactual Lab (In Silico Engine) */}
                <div ref={whatIfSectionRef}>
                  <WhatIfLab
                    patientId={currentPatientId}
                    onRunSimulation={handleRunWhatIf}
                    scenarioResult={scenarioResult}
                    onClearScenario={handleClearScenario}
                    isLoading={isScenarioLoading}
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Hospital Footer */}
          <footer className="bg-white border-t border-slate-200 py-5 px-6 text-xs text-slate-500 mt-10 shadow-2xs">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">GlucoTwin AI</span>
                <span>&bull;</span>
                <span>Healthcare Digital Twin Research Prototype</span>
                <span>&bull;</span>
                <span className="text-blue-700 font-mono text-[11px] font-semibold">Digital Twin Challenge 2026</span>
              </div>
              <div className="text-center sm:text-right text-[11px] text-slate-500">
                Strict Causal Feature Isolation &bull; Group-based Held-Out Patient Evaluation &bull; MIT License
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Model Evaluation Modal */}
      <ModelEvaluationModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        metricsData={modelMetrics || undefined}
      />
    </div>
  );
};

export default App;
