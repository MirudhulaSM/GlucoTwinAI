import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
} from 'recharts';
import { Activity, ShieldCheck } from 'lucide-react';
import { SensorReading, ForecastPoint } from '../types';

interface GlucoseTimeSeriesChartProps {
  history: SensorReading[];
  forecast: ForecastPoint[];
  scenarioForecast?: ForecastPoint[];
  threshold?: number;
  currentPatientName: string;
}

export const GlucoseTimeSeriesChart: React.FC<GlucoseTimeSeriesChartProps> = ({
  history,
  forecast,
  scenarioForecast,
  threshold = 180.0,
  currentPatientName,
}) => {
  const [viewMode, setViewMode] = useState<'glucose' | 'wearables'>('glucose');
  const [historyHours, setHistoryHours] = useState<number>(6);

  // Filter history based on selected hours (12 steps per hour)
  const stepCount = historyHours * 12;
  const filteredHistory = history.slice(-stepCount);

  // Format chart data combining history and 2h forecast
  const chartData: any[] = [];

  // Add historical points
  filteredHistory.forEach((r, idx) => {
    const isLatest = idx === filteredHistory.length - 1;
    const timeLabel = new Date(r.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    chartData.push({
      timestamp: r.timestamp,
      displayTime: timeLabel,
      type: 'history',
      glucose: r.glucose_mg_dl,
      heartRate: r.heart_rate_bpm,
      steps: r.steps,
      carbs: r.recent_carbs_g,
      forecastMedian: isLatest ? r.glucose_mg_dl : undefined,
      ciRange: isLatest ? [r.glucose_mg_dl, r.glucose_mg_dl] : undefined,
      scenarioMedian: isLatest ? r.glucose_mg_dl : undefined,
    });
  });

  // Add 2-hour future forecast points
  forecast.forEach((fp, idx) => {
    const timeLabel = new Date(fp.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const scenPoint = scenarioForecast && scenarioForecast[idx];

    chartData.push({
      timestamp: fp.timestamp,
      displayTime: timeLabel,
      type: 'forecast',
      glucose: undefined,
      heartRate: undefined,
      steps: undefined,
      forecastMedian: fp.predicted_glucose,
      ciRange: [fp.lower_ci80, fp.upper_ci80],
      scenarioMedian: scenPoint ? scenPoint.predicted_glucose : undefined,
    });
  });

  const latestHistoryPoint = filteredHistory[filteredHistory.length - 1];
  const currentTimeDisplay = latestHistoryPoint
    ? new Date(latestHistoryPoint.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Custom Clinical Hospital Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isFuture = data.type === 'forecast';

    return (
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-lg text-xs space-y-1.5 z-50">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-1 font-mono text-[11px]">
          <span className="text-blue-800 font-bold">{data.displayTime}</span>
          <span className={`px-1.5 py-0.2 rounded font-sans text-[10px] font-semibold ${
            isFuture ? 'bg-indigo-50 text-indigo-700' : 'bg-blue-50 text-blue-700'
          }`}>
            {isFuture ? '2h Forecast Window' : 'Observed Telemetry'}
          </span>
        </div>

        {!isFuture ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Glucose (CGM):</span>
              <span className={`font-mono font-bold ${
                data.glucose >= 180 ? 'text-rose-600' : data.glucose < 70 ? 'text-amber-600' : 'text-slate-900'
              }`}>
                {data.glucose} mg/dL
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Heart Rate:</span>
              <span className="font-mono text-slate-800 font-medium">{data.heartRate} BPM</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Steps (5m):</span>
              <span className="font-mono text-slate-800 font-medium">{data.steps}</span>
            </div>
            {data.carbs > 0 && (
              <div className="flex items-center justify-between gap-4 text-amber-700 font-semibold">
                <span>Carbs Ingested:</span>
                <span className="font-mono">+{data.carbs}g</span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-500">Projected Baseline:</span>
              <span className="font-mono font-bold text-teal-700">
                {data.forecastMedian?.toFixed(1)} mg/dL
              </span>
            </div>
            {data.ciRange && (
              <div className="flex items-center justify-between gap-4 text-[10px] text-slate-500">
                <span>80% Confidence Interval:</span>
                <span className="font-mono">
                  [{data.ciRange[0]?.toFixed(0)} &ndash; {data.ciRange[1]?.toFixed(0)} mg/dL]
                </span>
              </div>
            )}
            {data.scenarioMedian !== undefined && (
              <div className="flex items-center justify-between gap-4 pt-1 border-t border-slate-100">
                <span className="text-purple-700 font-semibold">What-If Counterfactual:</span>
                <span className="font-mono font-bold text-purple-700">
                  {data.scenarioMedian?.toFixed(1)} mg/dL
                </span>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="hospital-card p-5 flex flex-col justify-between">
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Continuous Glycemic Stream & 2-Hour Forecast Corridor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time trajectory for {currentPatientName} with prospective in silico horizon
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setViewMode('glucose')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                viewMode === 'glucose'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Glucose & Forecast
            </button>
            <button
              onClick={() => setViewMode('wearables')}
              className={`px-2.5 py-1 rounded-md font-semibold transition ${
                viewMode === 'wearables'
                  ? 'bg-white text-blue-700 shadow-2xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Heart Rate & Steps
            </button>
          </div>

          {/* History window selector */}
          <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setHistoryHours(3)}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                historyHours === 3 ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3h
            </button>
            <button
              onClick={() => setHistoryHours(6)}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                historyHours === 6 ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6h
            </button>
            <button
              onClick={() => setHistoryHours(12)}
              className={`px-2 py-1 rounded-md font-semibold transition ${
                historyHours === 12 ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12h
            </button>
          </div>
        </div>
      </div>

      {/* Main Recharts Area */}
      <div className="h-80 w-full my-3">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />

            <XAxis
              dataKey="displayTime"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              interval="preserveStartEnd"
              minTickGap={40}
            />

            {viewMode === 'glucose' ? (
              <YAxis
                stroke="#64748b"
                fontSize={10}
                domain={[40, 320]}
                ticks={[70, 120, 180, 240, 300]}
                unit=" mg/dL"
                tickLine={false}
              />
            ) : (
              <YAxis
                stroke="#64748b"
                fontSize={10}
                domain={[40, 180]}
                ticks={[50, 80, 110, 140, 170]}
                unit=" bpm"
                tickLine={false}
              />
            )}

            <Tooltip content={<CustomTooltip />} />

            {viewMode === 'glucose' && (
              <>
                {/* Target Glucose Range Area (70 - 180 mg/dL) */}
                <ReferenceArea
                  y1={70}
                  y2={180}
                  fill="#10b981"
                  fillOpacity={0.07}
                  stroke="#10b981"
                  strokeOpacity={0.25}
                />

                {/* Excursion High Threshold Reference Line */}
                <ReferenceLine
                  y={threshold}
                  stroke="#dc2626"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `High Excursion Threshold (${threshold} mg/dL)`,
                    fill: '#dc2626',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />

                {/* Hypoglycemia Reference Line */}
                <ReferenceLine
                  y={70}
                  stroke="#0284c7"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                  label={{
                    value: 'Hypoglycemia (70 mg/dL)',
                    fill: '#0284c7',
                    fontSize: 9,
                    position: 'insideBottomRight',
                  }}
                />

                {/* Prediction Divider Line */}
                {currentTimeDisplay && (
                  <ReferenceLine
                    x={currentTimeDisplay}
                    stroke="#475569"
                    strokeDasharray="2 2"
                    strokeWidth={1.5}
                    label={{
                      value: 'Now (t)',
                      fill: '#334155',
                      fontSize: 10,
                      position: 'insideTopLeft',
                    }}
                  />
                )}

                {/* Observed Historical CGM Curve */}
                <Line
                  type="monotone"
                  dataKey="glucose"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 2, fill: '#0284c7', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                  isAnimationActive={false}
                  name="Observed CGM"
                />

                {/* 2-Hour Projected Median Curve */}
                <Line
                  type="monotone"
                  dataKey="forecastMedian"
                  stroke="#0d9488"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0d9488' }}
                  isAnimationActive={false}
                  name="Baseline Projected"
                />

                {/* Counterfactual What-If Curve */}
                {scenarioForecast && (
                  <Line
                    type="monotone"
                    dataKey="scenarioMedian"
                    stroke="#7c3aed"
                    strokeDasharray="4 4"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: '#7c3aed' }}
                    isAnimationActive={false}
                    name="What-If Scenario"
                  />
                )}
              </>
            )}

            {viewMode === 'wearables' && (
              <>
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#e11d48"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name="Heart Rate (BPM)"
                />
                <Area
                  type="step"
                  dataKey="steps"
                  fill="#0284c7"
                  fillOpacity={0.15}
                  stroke="#0284c7"
                  strokeWidth={1}
                  name="Steps (5m)"
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend & Indicators */}
      <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full"></span>
            <span className="font-medium text-slate-800">Observed CGM</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-teal-600"></span>
            <span className="font-medium text-slate-800">2-Hour Forecast Corridor</span>
          </span>
          {scenarioForecast && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-purple-600"></span>
              <span className="text-purple-800 font-bold">What-If Counterfactual</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-100 border border-emerald-300 rounded-xs"></span>
            <span>Target Range (70&ndash;180)</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-teal-700 font-mono text-[10px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Sliding Window Causal Features</span>
        </div>
      </div>
    </div>
  );
};
