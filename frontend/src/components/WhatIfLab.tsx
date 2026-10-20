import React, { useState } from 'react';
import {
  FlaskConical,
  Footprints,
  Utensils,
  Moon,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { WhatIfScenarioRequest, WhatIfScenarioResponse } from '../types';

interface WhatIfLabProps {
  patientId: string;
  onRunSimulation: (request: WhatIfScenarioRequest) => Promise<WhatIfScenarioResponse | null>;
  scenarioResult: WhatIfScenarioResponse | null;
  onClearScenario: () => void;
  isLoading: boolean;
}

export const WhatIfLab: React.FC<WhatIfLabProps> = ({
  patientId,
  onRunSimulation,
  scenarioResult,
  onClearScenario,
  isLoading,
}) => {
  // Scenario state
  const [activityType, setActivityType] = useState<'sedentary' | 'light_walk' | 'moderate_cardio' | 'hiit_workout'>('light_walk');
  const [activityDuration, setActivityDuration] = useState<number>(20);
  const [carbIntake, setCarbIntake] = useState<number>(30);
  const [carbDelay, setCarbDelay] = useState<number>(10);
  const [sleepMod, setSleepMod] = useState<'restorative_8h' | 'normal_6h' | 'poor_4h' | 'disrupted_shift'>('normal_6h');
  const [hydration, setHydration] = useState<'adequate' | 'mild_dehydration'>('adequate');

  const handleSimulate = async () => {
    await onRunSimulation({
      patient_id: patientId,
      activity_type: activityType,
      activity_duration_minutes: activityDuration,
      carb_intake_g: carbIntake,
      carb_delay_minutes: carbDelay,
      sleep_quality_mod: sleepMod,
      hydration_status: hydration,
    });
  };

  const absDiff = scenarioResult?.absolute_risk_diff ?? 0;
  const absDiffPct = Math.round(absDiff * 100);
  const isRiskDecreased = absDiff < 0;

  return (
    <div className="hospital-card p-6 border-blue-200/90 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              What-If Counterfactual Lab <span className="text-blue-700 font-mono text-xs">(In Silico Engine)</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate hypothetical behavioral, nutritional, and circadian future scenarios for this virtual twin.
          </p>
        </div>

        {scenarioResult && (
          <button
            onClick={onClearScenario}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-3 py-1.5 rounded-lg transition self-start sm:self-auto font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Baseline</span>
          </button>
        )}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 gap-5 my-5 items-start">

        {/* Activity Assumptions */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="min-w-0 text-xs font-bold uppercase tracking-wide leading-snug text-slate-700 flex items-start gap-2">
              <Footprints className="w-4 h-4 shrink-0 text-blue-600" />
              Hypothetical Physical Activity
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'sedentary', label: 'Sedentary (0m)' },
              { id: 'light_walk', label: 'Light Walk (15-20m)' },
              { id: 'moderate_cardio', label: 'Brisk Cardio (30m)' },
              { id: 'hiit_workout', label: 'High Intensity (45m)' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setActivityType(opt.id as any)}
                className={`w-full min-w-0 min-h-[76px] p-3 rounded-lg text-left text-sm leading-snug font-medium transition border ${activityType === opt.id
                  ? 'bg-blue-50 text-blue-800 border-blue-400 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {activityType !== 'sedentary' && (
            <div className="space-y-1 pt-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600">
                <span>Duration</span>
                <span className="font-mono text-blue-700 font-semibold">{activityDuration} minutes</span>
              </div>
              <input
                type="range"
                min="5"
                max="90"
                step="5"
                value={activityDuration}
                onChange={(e) => setActivityDuration(Number(e.target.value))}
                className="w-full accent-blue-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Carbohydrate & Meal Assumptions */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="min-w-0 text-xs font-bold uppercase tracking-wide leading-snug text-slate-700 flex items-start gap-2">
              <Footprints className="w-4 h-4 shrink-0 text-blue-600" />
              Hypothetical Meal / Carbohydrates
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { g: 0, label: 'Fasting / None (0g)' },
              { g: 20, label: 'Light Snack (20g)' },
              { g: 50, label: 'Standard Meal (50g)' },
              { g: 85, label: 'High Carb Meal (85g)' },
            ].map((opt) => (
              <button
                key={opt.g}
                onClick={() => setCarbIntake(opt.g)}
                className={`w-full min-w-0 min-h-[76px] p-3 rounded-lg text-left text-sm leading-snug font-medium transition border ${carbIntake === opt.g
                  ? 'bg-amber-50 text-amber-900 border-amber-400 font-semibold shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 pt-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-slate-600">
              <span>Carb Quantity</span>
              <span className="font-mono text-amber-700 font-semibold">{carbIntake} grams</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              step="5"
              value={carbIntake}
              onChange={(e) => setCarbIntake(Number(e.target.value))}
              className="w-full accent-amber-600 bg-slate-200 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Sleep & Circadian Assumptions */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="min-w-0 text-xs font-bold uppercase tracking-wide leading-snug text-slate-700 flex items-start gap-2">
                <Footprints className="w-4 h-4 shrink-0 text-blue-600" />
                Sleep & Circadian Multipliers
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'restorative_8h', label: 'Restorative (8h, Low Stress)' },
                { id: 'normal_6h', label: 'Standard Normal (6-7h)' },
                { id: 'poor_4h', label: 'Sleep Deficit (4h, Cortisol)' },
                { id: 'disrupted_shift', label: 'Circadian Misalignment' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSleepMod(opt.id as any)}
                  className={`w-full min-w-0 min-h-[76px] p-3 rounded-lg text-left text-sm leading-snug font-medium transition border ${sleepMod === opt.id
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-400 font-semibold shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSimulate}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-lg font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {isLoading ? 'Computing Counterfactual...' : 'Recalculate In Silico Scenario'}
            </button>
          </div>
        </div>

      </div>

      {/* Counterfactual Evaluation Comparison Card */}
      {scenarioResult && (
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 my-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[10px] font-mono text-blue-700 uppercase tracking-wider font-bold">
                Counterfactual Comparison Result
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Baseline vs Hypothetical In Silico Future
              </h3>
            </div>

            {/* Absolute Risk Difference Badge */}
            <div
              className={`px-3.5 py-2 rounded-lg border flex items-center gap-2.5 shadow-2xs ${isRiskDecreased
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-rose-50 text-rose-900 border-rose-300'
                }`}
            >
              {isRiskDecreased ? (
                <TrendingDown className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <TrendingUp className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                  Absolute Risk Difference (&Delta; Risk)
                </div>
                <div className="text-base font-black font-mono">
                  {absDiff > 0 ? '+' : ''}
                  {absDiffPct}% {isRiskDecreased ? 'Risk Reduction' : 'Risk Elevation'}
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-side risk comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
            <div className="bg-white rounded-lg p-3.5 border border-slate-200">
              <div className="text-xs text-slate-500 font-semibold uppercase text-[10px]">
                Observed Baseline Trajectory
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 mt-1">
                {Math.round(scenarioResult.baseline_risk * 100)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Baseline 2-hour excursion probability
              </div>
            </div>

            <div className="bg-white rounded-lg p-3.5 border border-blue-300">
              <div className="text-xs text-blue-700 font-semibold uppercase text-[10px]">
                Counterfactual Scenario Trajectory
              </div>
              <div className="text-2xl font-black font-mono text-blue-700 mt-1">
                {Math.round(scenarioResult.scenario_risk * 100)}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Projected excursion probability under simulated inputs
              </div>
            </div>
          </div>

          {/* Physiological Drivers */}
          <div className="my-2">
            <div className="text-xs font-bold text-slate-800 mb-1.5">
              Simulated Physiological Drivers:
            </div>
            <ul className="space-y-1.5">
              {scenarioResult.key_physiological_drivers.map((driver, idx) => (
                <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mandatory Regulatory & Clinical Non-Causal Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-900 mt-4">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-amber-950">Mandatory Research Disclosure:</span> What-If scenarios reflect
          statistical model associations under simulated input perturbations. They do{' '}
          <span className="underline">NOT</span> represent causal clinical treatment effects, pharmacodynamic
          guarantees, or medical advice. <span className="font-semibold text-slate-900">Never alter prescribed insulin dosages or medication regimens based on simulation outputs.</span>
        </div>
      </div>
    </div>
  );
};
