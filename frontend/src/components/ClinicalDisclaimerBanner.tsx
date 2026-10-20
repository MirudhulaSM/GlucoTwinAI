import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export const ClinicalDisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex flex-wrap items-center justify-between gap-2 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="p-1 rounded bg-amber-200/60 text-amber-800">
          <AlertTriangle className="w-3.5 h-3.5" />
        </span>
        <span className="font-bold tracking-wide text-amber-950 uppercase text-[11px]">
          Digital Twin Challenge 2026 | Research Prototype Only
        </span>
        <span className="hidden sm:inline text-amber-400">|</span>
        <span className="text-amber-800 text-[11px]">
          All records, telemetry, and scenarios are synthetically generated. Not a certified medical device.
        </span>
      </div>
      <div className="flex items-center gap-3 text-slate-600">
        <span className="flex items-center gap-1 text-teal-700 font-mono text-[11px] font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
          Strict Causal Feature Isolation (Zero Future Leakage)
        </span>
        <span className="hidden md:inline bg-white px-2 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200 font-mono">
          Threshold: &ge; 180 mg/dL in 2h
        </span>
      </div>
    </div>
  );
};
