import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Heart,
  Footprints,
  Moon,
  Sun,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { SensorReading, DataQualityReport } from '../types';

interface VitalsQuickBarProps {
  latestReading?: SensorReading;
  trendArrow: string;
  rateOfChange: number;
  qualityReport?: DataQualityReport;
}

export const VitalsQuickBar: React.FC<VitalsQuickBarProps> = ({
  latestReading,
  trendArrow,
  rateOfChange,
  qualityReport,
}) => {
  const glucose = latestReading?.glucose_mg_dl ?? 120.0;
  const hr = latestReading?.heart_rate_bpm ?? 72.0;
  const steps = latestReading?.steps ?? 0;
  const sleepState = latestReading?.sleep_state ?? 'awake';
  const insulin = latestReading?.active_insulin_units ?? 0.0;

  // Determine glycemic band
  let glucoseStatus = { label: 'In Target Range', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  if (glucose >= 180.0) {
    glucoseStatus = { label: 'Hyperglycemic Excursion', color: 'text-rose-800 bg-rose-50 border-rose-200' };
  } else if (glucose < 70.0) {
    glucoseStatus = { label: 'Hypoglycemic Alert', color: 'text-amber-800 bg-amber-50 border-amber-200' };
  }

  // Trend icon and description
  const renderTrend = () => {
    const absRate = Math.abs(rateOfChange);
    if (trendArrow.includes('RISING')) {
      return (
        <span className="flex items-center text-rose-700 font-mono font-semibold text-xs">
          <TrendingUp className="w-3.5 h-3.5 mr-1" />
          +{absRate.toFixed(2)} mg/dL/min
        </span>
      );
    } else if (trendArrow.includes('FALLING')) {
      return (
        <span className="flex items-center text-teal-700 font-mono font-semibold text-xs">
          <TrendingDown className="w-3.5 h-3.5 mr-1" />
          -{absRate.toFixed(2)} mg/dL/min
        </span>
      );
    }
    return (
      <span className="flex items-center text-slate-600 font-mono font-medium text-xs">
        <ArrowRight className="w-3.5 h-3.5 mr-1" />
        &plusmn;{absRate.toFixed(2)} mg/dL/min
      </span>
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Glucose Card */}
      <div className="col-span-2 sm:col-span-1 hospital-card p-4 flex flex-col justify-between border-l-4 border-l-blue-600">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Current Glucose</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${glucoseStatus.color}`}>
            {glucoseStatus.label}
          </span>
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            {glucose.toFixed(1)}
          </span>
          <span className="text-xs text-slate-500 font-medium">mg/dL</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 font-medium">CGM Velocity</span>
          {renderTrend()}
        </div>
      </div>

      {/* 2. Heart Rate Card */}
      <div className="hospital-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Heart Rate</span>
          <Heart className="w-4 h-4 text-rose-500" />
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            {hr.toFixed(0)}
          </span>
          <span className="text-xs text-slate-500 font-medium">BPM</span>
        </div>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
          <span>Vagal Tone</span>
          <span className="text-slate-800 font-semibold">{hr < 60 ? 'Resting Brady' : hr > 100 ? 'Elevated' : 'Normal Sinus'}</span>
        </div>
      </div>

      {/* 3. Steps & Physical Activity Card */}
      <div className="hospital-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Physical Activity</span>
          <Footprints className="w-4 h-4 text-blue-600" />
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-slate-900 font-mono">
            {steps}
          </span>
          <span className="text-xs text-slate-500 font-medium">steps (5m)</span>
        </div>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
          <span>Metabolic Impact</span>
          <span className={steps > 100 ? 'text-teal-700 font-semibold' : 'text-slate-600'}>
            {steps > 250 ? 'High Uptake' : steps > 100 ? 'Moderate Uptake' : 'Basal State'}
          </span>
        </div>
      </div>

      {/* 4. Sleep & Circadian Phase Card */}
      <div className="hospital-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Circadian / Sleep</span>
          {sleepState === 'awake' ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900 capitalize font-mono">
            {sleepState}
          </span>
          <span className="text-xs text-slate-500 font-medium">state</span>
        </div>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
          <span>Active Insulin</span>
          <span className="text-blue-700 font-mono font-semibold">{insulin.toFixed(1)} U</span>
        </div>
      </div>

      {/* 5. Telemetry Quality Pill */}
      <div className="hospital-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px]">Telemetry Quality</span>
          {qualityReport?.is_reliable_for_prediction ? (
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-pulse" />
          )}
        </div>
        <div className="my-2 flex items-baseline gap-2">
          <span className={`text-3xl font-black tracking-tight font-mono ${
            (qualityReport?.overall_score ?? 100) >= 80 ? 'text-emerald-700' : 'text-rose-700'
          }`}>
            {(qualityReport?.overall_score ?? 100).toFixed(0)}%
          </span>
          <span className="text-xs text-slate-500 font-medium">Score</span>
        </div>
        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
          <span>Freshness</span>
          <span className={qualityReport?.is_stale ? 'text-rose-700 font-bold' : 'text-slate-800 font-medium'}>
            {qualityReport?.is_stale ? 'STALE' : '< 5m Live'}
          </span>
        </div>
      </div>
    </div>
  );
};
