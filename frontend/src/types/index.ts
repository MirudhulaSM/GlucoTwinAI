export interface PatientEHR {
  id: string;
  name: string;
  age: number;
  gender: string;
  diabetes_type: string;
  years_diagnosed: number;
  hba1c: number;
  bmi: number;
  baseline_therapy: string[];
  comorbidities: string[];
  archetype: string;
  clinical_notes: string;
  target_range_mg_dl: [number, number];
  is_synthetic: boolean;
}

export interface SensorReading {
  timestamp: string;
  glucose_mg_dl: number;
  heart_rate_bpm: number;
  steps: number;
  sleep_state: 'awake' | 'light' | 'deep' | 'rem';
  recent_carbs_g: number;
  active_insulin_units: number;
  sensor_quality_flag: 'OK' | 'STALE' | 'COMPRESSION_ARTIFACT' | 'OUT_OF_RANGE' | 'DROPOUT';
  is_synthetic: boolean;
}

export interface DataQualityReport {
  status: 'Optimal' | 'Acceptable' | 'Degraded' | 'Critical';
  overall_score: number;
  freshness_seconds: number;
  is_stale: boolean;
  missing_count_last_2h: number;
  out_of_range_count_last_2h: number;
  anomalies: string[];
  is_reliable_for_prediction: boolean;
  disclaimer: string;
}

export interface ContributingFactor {
  feature_name: string;
  display_name: string;
  feature_value: number;
  impact_score: number;
  direction: 'increases_risk' | 'decreases_risk';
  clinical_context: string;
}

export interface ForecastPoint {
  timestamp: string;
  predicted_glucose: number;
  lower_ci80: number;
  upper_ci80: number;
  excursion_probability: number;
}

export interface PredictionResult {
  patient_id: string;
  timestamp: string;
  target_threshold_mg_dl: number;
  horizon_minutes: number;
  excursion_risk_probability: number;
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical';
  confidence_score: number;
  current_glucose: number;
  rate_of_change_mg_dl_per_min: number;
  forecast_curve: ForecastPoint[];
  top_contributing_factors: ContributingFactor[];
  data_quality_report: DataQualityReport;
  model_version: string;
  split_evaluation_auc?: number;
  disclaimer: string;
}

export interface TelemetryResponse {
  patient_id: string;
  latest_reading: SensorReading;
  history: SensorReading[];
  trend_arrow: 'RAPIDLY_RISING' | 'RISING' | 'SLOWLY_RISING' | 'FLAT' | 'SLOWLY_FALLING' | 'FALLING' | 'RAPIDLY_FALLING';
  rate_of_change_15m: number;
  history_steps_count: number;
  active_anomalies: string[];
  is_synthetic: boolean;
}

export interface WhatIfScenarioRequest {
  patient_id: string;
  current_timestamp?: string;
  activity_type: 'sedentary' | 'light_walk' | 'moderate_cardio' | 'hiit_workout';
  activity_duration_minutes: number;
  carb_intake_g: number;
  carb_delay_minutes: number;
  sleep_quality_mod: 'restorative_8h' | 'normal_6h' | 'poor_4h' | 'disrupted_shift';
  hydration_status: 'adequate' | 'mild_dehydration';
}

export interface WhatIfScenarioResponse {
  patient_id: string;
  timestamp: string;
  baseline_risk: number;
  scenario_risk: number;
  absolute_risk_diff: number;
  relative_risk_diff: number;
  baseline_forecast: ForecastPoint[];
  scenario_forecast: ForecastPoint[];
  key_physiological_drivers: string[];
  simulation_parameters_applied: Record<string, any>;
  disclaimer: string;
}

export interface ModelMetricsResponse {
  metrics: {
    model_name: string;
    split_method: string;
    train_patient_ids: string[];
    test_patient_ids: string[];
    train_sample_count: number;
    test_sample_count: number;
    class_balance: {
      train_positive_rate: number;
      test_positive_rate: number;
    };
    roc_auc: number;
    precision: number;
    recall: number;
    f1_score: number;
    brier_score: number;
    confusion_matrix: number[][];
    feature_importances: Record<string, number>;
    trained_at: string;
    disclaimer: string;
  };
  metadata: Record<string, any>;
}
