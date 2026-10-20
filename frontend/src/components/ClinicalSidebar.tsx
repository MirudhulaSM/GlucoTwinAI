import React from 'react';
import {
  Activity,
  Users,
  FlaskConical,
  Award,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  Info,
} from 'lucide-react';
import { PatientEHR } from '../types';

interface ClinicalSidebarProps {
  patients: PatientEHR[];
  currentPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onOpenModelModal: () => void;
  activeSection: string;
  onNavigateSection: (section: string) => void;
}

export const ClinicalSidebar: React.FC<ClinicalSidebarProps> = ({
  patients,
  currentPatientId,
  onSelectPatient,
  onOpenModelModal,
  activeSection,
  onNavigateSection,
}) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 shadow-xs z-30">
      <div>
        {/* Hospital Branding Header */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <HeartPulse className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">GlucoTwin AI</h1>
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Clinical In Silico Twin Portal</p>
          </div>
        </div>

        {/* Primary Navigation */}
        <div className="p-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Clinical Modules
          </div>

          <button
            onClick={() => onNavigateSection('overview')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
              activeSection === 'overview'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Patient Telemetry & Chart</span>
          </button>

          <button
            onClick={() => onNavigateSection('whatif')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition text-left ${
              activeSection === 'whatif'
                ? 'bg-blue-50 text-blue-700 font-semibold border border-blue-100'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <FlaskConical className="w-4 h-4 text-teal-600" />
            <span>What-If In Silico Lab</span>
          </button>

          <button
            onClick={onOpenModelModal}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Held-Out Model Validation</span>
          </button>
        </div>

        {/* Patient Cohort Selector */}
        <div className="px-3 py-2 border-t border-slate-200">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              Patient Cohort
            </span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
              4 Active
            </span>
          </div>

          <div className="space-y-1">
            {patients.map((p) => {
              const isSelected = p.id === currentPatientId;
              return (
                <button
                  key={p.id}
                  onClick={() => onSelectPatient(p.id)}
                  className={`w-full text-left p-2.5 rounded-lg transition border flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-200 text-blue-900 shadow-2xs'
                      : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-900 truncate">
                        {p.name}
                      </span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {p.id}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-600 truncate mt-0.5">
                      {p.archetype}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                      <span>HbA1c: <strong className={p.hba1c > 8 ? 'text-rose-600' : 'text-slate-700'}>{p.hba1c}%</strong></span>
                      <span>&bull;</span>
                      <span>Age: {p.age}</span>
                    </div>
                  </div>
                  {isSelected && (
                    <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer System Info */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60 space-y-2">
        <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Model Pipeline:</span>
            <span className="font-semibold text-slate-800 font-mono">GBDT v1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Held-Out Test AUC:</span>
            <span className="font-semibold text-teal-700 font-mono">0.9529</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-700">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              API Connected
            </span>
            <span className="text-slate-600 font-mono">Zero Leakage</span>
          </div>
        </div>

        <div className="px-1 text-[10px] text-slate-600 leading-tight">
          Digital Twin Challenge 2026 &bull; Synthetic EHR & Telemetry
        </div>
      </div>
    </aside>
  );
};
