import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertOctagon,
  Award,
  ChevronDown,
  User,
  Clock,
} from 'lucide-react';
import { PatientEHR, DataQualityReport } from '../types';

interface ClinicianHeaderProps {
  patients: PatientEHR[];
  currentPatientId: string;
  onSelectPatient: (patientId: string) => void;
  currentTimeString: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onStepTime: (minutes: number) => void;
  onReset: () => void;
  onInjectAnomaly: (type: string) => void;
  onClearAnomalies: () => void;
  activeAnomalies: string[];
  qualityReport?: DataQualityReport;
  onOpenModelModal: () => void;
}

export const ClinicianHeader: React.FC<ClinicianHeaderProps> = ({
  patients,
  currentPatientId,
  onSelectPatient,
  currentTimeString,
  isPlaying,
  onTogglePlay,
  onStepTime,
  onReset,
  onInjectAnomaly,
  onClearAnomalies,
  activeAnomalies,
  onOpenModelModal,
}) => {
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [showAnomalyMenu, setShowAnomalyMenu] = useState(false);

  const selectedPatient = patients.find((p) => p.id === currentPatientId) || patients[0];

  const formatSimTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return (
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ` (${d.toLocaleDateString([], { month: 'short', day: 'numeric' })})`
      );
    } catch {
      return isoString;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-5 py-3 sticky top-0 z-30 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Active Patient Identity & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Active Twin:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-900">{selectedPatient?.name}</span>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.2 rounded border border-blue-200">
                {selectedPatient?.id}
              </span>
            </div>
            <span className="hidden sm:inline-block text-slate-300">&bull;</span>
            <span className="hidden sm:inline-block text-xs text-slate-600 font-medium">
              {selectedPatient?.archetype}
            </span>
          </div>

          {/* Patient Quick Dropdown for mobile/small screens */}
          <div className="relative md:hidden">
            <button
              onClick={() => setShowPatientMenu(!showPatientMenu)}
              className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            {showPatientMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-100">
                  Select Patient Twin
                </div>
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPatient(p.id);
                      setShowPatientMenu(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg text-xs hover:bg-slate-50 transition ${
                      p.id === currentPatientId ? 'bg-blue-50 text-blue-800 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {p.name} ({p.id})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Simulation Controls & Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simulation Clock Display */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 text-[11px]">Sim Clock:</span>
            <span className="font-semibold text-slate-900">{formatSimTime(currentTimeString)}</span>
          </div>

          {/* Simulation Stepper Buttons */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5">
            <button
              onClick={() => onStepTime(5)}
              title="Advance Simulation 5 Minutes"
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white rounded-md transition shadow-2xs"
            >
              +5m
            </button>
            <button
              onClick={() => onStepTime(15)}
              title="Advance Simulation 15 Minutes"
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white rounded-md transition shadow-2xs"
            >
              +15m
            </button>
            <button
              onClick={() => onStepTime(30)}
              title="Advance Simulation 30 Minutes"
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:bg-white rounded-md transition shadow-2xs hidden sm:inline-block"
            >
              +30m
            </button>
          </div>

          {/* Continuous Simulation Play / Pause */}
          <button
            onClick={onTogglePlay}
            title={isPlaying ? 'Pause Continuous Simulation' : 'Start Continuous Auto-Step Simulation'}
            className={`p-1.5 rounded-lg border transition flex items-center justify-center ${
              isPlaying
                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-amber-700" />
            ) : (
              <Play className="w-4 h-4 fill-blue-700" />
            )}
          </button>

          {/* Reset Twin Clock */}
          <button
            onClick={onReset}
            title="Reset Simulation Clock to Initial Baseline"
            className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sensor Anomaly Injector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAnomalyMenu(!showAnomalyMenu)}
              title="Inject Sensor Fault to Test Quality Safeguards"
              className={`p-1.5 rounded-lg border transition flex items-center gap-1 text-xs ${
                activeAnomalies.length > 0
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              {activeAnomalies.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              )}
            </button>

            {showAnomalyMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50">
                <div className="px-2 py-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100">
                  Sensor Fault & Safety Testing
                </div>
                <div className="p-1 space-y-1">
                  <button
                    onClick={() => {
                      onInjectAnomaly('stale_telemetry');
                      setShowAnomalyMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition"
                  >
                    Stale Telemetry (&gt;25 min latency)
                  </button>
                  <button
                    onClick={() => {
                      onInjectAnomaly('compression_artifact');
                      setShowAnomalyMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition"
                  >
                    Pressure Compression Drop (-65 mg/dL)
                  </button>
                  <button
                    onClick={() => {
                      onInjectAnomaly('missing_packets');
                      setShowAnomalyMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-amber-50 text-slate-700 hover:text-amber-700 transition"
                  >
                    Bluetooth Dropout (8 missing packets)
                  </button>
                  <button
                    onClick={() => {
                      onInjectAnomaly('out_of_range');
                      setShowAnomalyMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-slate-700 hover:text-rose-700 transition"
                  >
                    Sensor Out-of-Range Spike (412 mg/dL)
                  </button>
                  {activeAnomalies.length > 0 && (
                    <button
                      onClick={() => {
                        onClearAnomalies();
                        setShowAnomalyMenu(false);
                      }}
                      className="w-full text-center mt-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-teal-700 border border-slate-300 transition"
                    >
                      Clear All Sensor Anomalies
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Model Validation Dialog Button */}
          <button
            onClick={onOpenModelModal}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Held-Out Validation</span>
          </button>
        </div>
      </div>
    </header>
  );
};
