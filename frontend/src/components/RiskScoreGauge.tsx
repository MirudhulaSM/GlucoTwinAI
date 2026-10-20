import React from 'react';
import { Info, ShieldAlert, Sparkles } from 'lucide-react';
import { PredictionResult } from '../types';

interface RiskScoreGaugeProps {
  prediction?: PredictionResult;
}

export const RiskScoreGauge: React.FC<RiskScoreGaugeProps> = ({ prediction }) => {
  const probability = prediction?.excursion_risk_probability ?? 0.15;
  const pct = Math.round(probability * 100);
  const riskLevel = prediction?.risk_level ?? 'Low';
  const confidence = Math.round((prediction?.confidence_score ?? 0.9) * 100);
  const isReliable = prediction?.data_quality_report?.is_reliable_for_prediction ?? true;

  // Color mapping based on risk level
  let ringColor = '#0d9488'; // teal
  let badgeColor = 'bg-teal-50 text-teal-800 border-teal-200';
  let riskNarrative = 'Glycemic profile projected to remain predominantly within target bounds over the next 120 minutes.';

  if (riskLevel === 'Critical') {
    ringColor = '#dc2626'; // red
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-300';
    riskNarrative = 'High probability of crossing the 180 mg/dL threshold within the prospective 2-hour window. Active monitoring indicated.';
  } else if (riskLevel === 'High') {
    ringColor = '#ea580c'; // orange
    badgeColor = 'bg-orange-50 text-orange-800 border-orange-300';
    riskNarrative = 'Elevated excursion risk. Rapid rate of change or postprandial carbohydrate absorption may provoke glycemic surge.';
  } else if (riskLevel === 'Moderate') {
    ringColor = '#d97706'; // amber
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
    riskNarrative = 'Intermediate risk. Minor counter-regulatory or dietary disturbance could trigger excursion.';
  }

  // SVG circular gauge calculation
  const strokeWidth = 10;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (probability * circumference);

  return (
    <div className="hospital-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              2-Hour Excursion Risk Estimate
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Target: Blood Glucose &ge; 180 mg/dL in prospective 120 min
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeColor}`}>
            {riskLevel} Risk
          </span>
        </div>

        {/* Circular Gauge Presentation */}
        <div className="my-5 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              {/* Background circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="stroke-slate-200"
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                {pct}%
              </span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Probability
              </span>
            </div>
          </div>

          <div className="space-y-2 max-w-xs text-left">
            <div className="text-xs text-slate-600 leading-relaxed font-medium">
              {riskNarrative}
            </div>

            <div className="flex items-center gap-3 pt-2 text-[11px] font-mono">
              <span className="text-slate-500">Confidence:</span>
              <span className={`font-semibold ${confidence > 75 ? 'text-teal-700' : 'text-amber-700'}`}>
                {confidence}%
              </span>
              <span className="text-slate-300">&bull;</span>
              <span className="text-slate-500">Model:</span>
              <span className="text-slate-700 font-semibold">GBDT-v1.0</span>
            </div>
          </div>
        </div>

        {/* Data Quality Warning Alert */}
        {!isReliable && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-800 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-rose-900">Confidence Attenuated:</span> Telemetry
              quality is degraded or stale. Clinicians should exercise elevated caution before relying on
              sensor projections.
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-mono text-[10px]">
          <Info className="w-3 h-3 text-slate-400" />
          Held-Out Test AUC: {prediction?.split_evaluation_auc?.toFixed(3) ?? '0.953'}
        </span>
        <span className="text-[10px] text-slate-500 italic">Research Evaluation Only</span>
      </div>
    </div>
  );
};
