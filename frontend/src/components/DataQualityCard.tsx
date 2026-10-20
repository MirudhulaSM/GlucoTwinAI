import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { DataQualityReport } from '../types';

interface DataQualityCardProps {
  report?: DataQualityReport;
  onInjectAnomaly: (type: string) => void;
  onClearAnomalies: () => void;
  activeAnomalies: string[];
}

export const DataQualityCard: React.FC<DataQualityCardProps> = ({
  report,
  onInjectAnomaly,
  onClearAnomalies,
  activeAnomalies,
}) => {
  const score = report?.overall_score ?? 100;
  const isReliable = report?.is_reliable_for_prediction ?? true;
  const isStale = report?.is_stale ?? false;
  const anomalies = report?.anomalies ?? [];

  return (
    <div className="hospital-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              {isReliable ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
              )}
              Telemetry Quality & Safety Engine
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Continuous monitoring for sensor dropouts, compression artifacts, and stale lag
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${isReliable
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
          >
            {report?.status ?? 'Optimal'}
          </span>
        </div>

        {/* Quality Score Bar */}
        <div className="my-3.5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-semibold">Sensor Reliability Score</span>
            <span className="font-mono font-bold text-slate-900">{score.toFixed(0)} / 100</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${score >= 80 ? 'bg-emerald-600' : score >= 50 ? 'bg-amber-500' : 'bg-rose-600'
                }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Diagnostic Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-3">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Packet Freshness</div>
            <div className={`font-mono font-bold mt-0.5 ${isStale ? 'text-rose-700' : 'text-emerald-700'}`}>
              {isStale ? 'STALE (>25m lag)' : 'Live (<5m latency)'}
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] text-slate-500 font-semibold uppercase">Missing Packets (2h)</div>
            <div className="font-mono font-bold text-slate-800 mt-0.5">
              {report?.missing_count_last_2h ?? 0} missing
            </div>
          </div>
        </div>

        {/* Detected Anomalies */}
        {anomalies.length > 0 ? (
          <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 my-2 space-y-1">
            <div className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Active Telemetry Warnings:
            </div>
            {anomalies.map((anom, idx) => (
              <div key={idx} className="text-[11px] text-rose-900 leading-tight">
                &bull; {anom}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 my-2 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>All sensor packets verified within physiological bounds (40&ndash;400 mg/dL).</span>
          </div>
        )}

        {/* Interactive Safety Testing Buttons */}
        <div className="pt-2">
          <div className="text-[11px] text-slate-600 font-semibold mb-1.5 flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Sensor Fault Testing:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onInjectAnomaly('stale_telemetry')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 hover:text-rose-700 rounded-md border border-slate-200 transition shadow-2xs"
            >
              + Stale Lag
            </button>
            <button
              onClick={() => onInjectAnomaly('compression_artifact')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 hover:text-amber-700 rounded-md border border-slate-200 transition shadow-2xs"
            >
              + Compression Drop
            </button>
            <button
              onClick={() => onInjectAnomaly('missing_packets')}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 text-[10px] font-semibold text-slate-700 hover:text-amber-700 rounded-md border border-slate-200 transition shadow-2xs"
            >
              + Dropout
            </button>
            {activeAnomalies.length > 0 && (
              <button
                onClick={onClearAnomalies}
                className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[10px] font-bold text-blue-800 rounded-md border border-blue-200 transition"
              >
                Clear Faults
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
        Safety Gate: Automates model confidence attenuation upon fault detection.
      </div>
    </div>
  );
};
