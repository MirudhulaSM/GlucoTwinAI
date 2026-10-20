import React from 'react';
import { Pill, Activity, Bookmark, FileText } from 'lucide-react';
import { PatientEHR } from '../types';

interface PatientEHRCardProps {
  patient: PatientEHR;
}

export const PatientEHRCard: React.FC<PatientEHRCardProps> = ({ patient }) => {
  return (
    <div className="hospital-card p-5 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-800 font-bold text-base shadow-2xs">
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{patient.name}</h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
                  {patient.id}
                </span>
              </div>
              <p className="text-xs text-blue-700 font-medium">{patient.archetype}</p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            Synthetic EHR
          </span>
        </div>

        {/* Clinical Baseline Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5">
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Demographics</div>
            <div className="text-xs font-semibold text-slate-900 mt-0.5">
              {patient.age}y &bull; {patient.gender}
            </div>
            <div className="text-[10px] text-slate-500">BMI: {patient.bmi} kg/m²</div>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Diabetes Profile</div>
            <div className="text-xs font-semibold text-blue-800 mt-0.5">{patient.diabetes_type}</div>
            <div className="text-[10px] text-slate-500">{patient.years_diagnosed} yrs duration</div>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Baseline HbA1c</div>
            <div className="text-xs font-bold font-mono text-slate-900 mt-0.5 flex items-center gap-1.5">
              <span>{patient.hba1c}%</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-semibold ${
                patient.hba1c > 8.0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {patient.hba1c > 8.0 ? 'Suboptimal' : 'Controlled'}
              </span>
            </div>
            <div className="text-[10px] text-slate-500">Est. avg: {Math.round(28.7 * patient.hba1c - 46.7)} mg/dL</div>
          </div>

          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-bold uppercase">Target Glycemia</div>
            <div className="text-xs font-semibold font-mono text-slate-900 mt-0.5">
              {patient.target_range_mg_dl[0]} &ndash; {patient.target_range_mg_dl[1]}
            </div>
            <div className="text-[10px] text-slate-500">mg/dL (ADA TIR standard)</div>
          </div>
        </div>

        {/* Regimen & Comorbidities */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Documented Baseline Therapy</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {patient.baseline_therapy.map((rx, idx) => (
                <span
                  key={idx}
                  className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-mono"
                >
                  {rx}
                </span>
              ))}
            </div>
          </div>

          {patient.comorbidities.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-600" />
                <span>Documented Comorbidities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.comorbidities.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Notes */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Clinician Summary & Phenotypic Characteristics</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic">
              &ldquo;{patient.clinical_notes}&rdquo;
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 text-blue-700 font-mono font-medium">
          <Activity className="w-3 h-3 text-blue-600" />
          Continuous CGM Telemetry Link
        </span>
        <span className="font-mono text-[10px] text-slate-500">5-minute interval</span>
      </div>
    </div>
  );
};
