import React from 'react';
import { Layers, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { ContributingFactor } from '../types';

interface ExplainabilityPanelProps {
  factors: ContributingFactor[];
}

export const ExplainabilityPanel: React.FC<ExplainabilityPanelProps> = ({ factors }) => {
  return (
    <div className="hospital-card p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Supported Model Feature Attributions
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Empirical gradient weights decomposing 2-hour excursion risk
            </p>
          </div>
          <span className="text-[10px] font-mono bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded border border-slate-200">
            GBDT Gradient SHAP
          </span>
        </div>

        {/* Factors Breakdown */}
        <div className="my-3.5 space-y-2.5">
          {factors.map((factor, idx) => {
            const isRiskIncreasing = factor.impact_score > 0;
            const barWidth = Math.min(100, Math.abs(factor.impact_score) * 2.2);

            return (
              <div key={idx} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                    {isRiskIncreasing ? (
                      <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-teal-600" />
                    )}
                    {factor.display_name}
                  </span>
                  <span
                    className={`font-mono text-[11px] font-bold ${
                      isRiskIncreasing ? 'text-rose-700' : 'text-teal-700'
                    }`}
                  >
                    {isRiskIncreasing ? '+' : ''}
                    {factor.impact_score.toFixed(1)} impact
                  </span>
                </div>

                {/* Contribution Bar */}
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden my-1.5 flex">
                  {isRiskIncreasing ? (
                    <div
                      className="h-full bg-rose-500 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  ) : (
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                </div>

                <div className="text-[11px] text-slate-600 leading-tight">
                  {factor.clinical_context}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-400" />
          Transparent Tree Attributions &bull; Non-Black-Box
        </span>
        <span className="text-[10px] text-slate-500 font-mono">No invented rationales</span>
      </div>
    </div>
  );
};
