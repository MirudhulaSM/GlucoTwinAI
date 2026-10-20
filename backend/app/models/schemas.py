from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PatientEHR(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    diabetes_type: str
    years_diagnosed: float
    hba1c: float
    bmi: float
    baseline_therapy: List[str]
    comorbidities: List[str]
    archetype: str
    clinical_notes: str
    target_range_mg_dl: List[float] = [70.0, 180.0]
    is_synthetic: bool = True

class SensorReading(BaseModel):
    timestamp: str
    glucose_mg_dl: float
    heart_rate_bpm: float
    steps: int
    sleep_state: str = "awake"  # awake, light, deep, rem
    recent_carbs_g: float = 0.0
    active_insulin_units: float = 0.0
    sensor_quality_flag: str = "OK"  # OK, STALE, COMPRESSION_ARTIFACT, OUT_OF_RANGE, DROPOUT
    is_synthetic: bool = True

class DataQualityReport(BaseModel):
    status: str  # Optimal, Acceptable, Degraded, Critical
    overall_score: float  # 0 to 100
    freshness_seconds: float
    is_stale: bool
    missing_count_last_2h: int
    out_of_range_count_last_2h: int
    anomalies: List[str]
    is_reliable_for_prediction: bool
    disclaimer: str

class ContributingFactor(BaseModel):
    feature_name: str
    display_name: str
    feature_value: float
    impact_score: float  # positive pushes risk UP, negative pushes risk DOWN
    direction: str  # "increases_risk" or "decreases_risk"
    clinical_context: str

class ForecastPoint(BaseModel):
    timestamp: str
    predicted_glucose: float
    lower_ci80: float
    upper_ci80: float
    excursion_probability: float

class PredictionResult(BaseModel):
    patient_id: str
    timestamp: str
    target_threshold_mg_dl: float = 180.0
    horizon_minutes: int = 120
    excursion_risk_probability: float
    risk_level: str  # "Low", "Moderate", "High", "Critical"
    confidence_score: float
    current_glucose: float
    rate_of_change_mg_dl_per_min: float
    forecast_curve: List[ForecastPoint]
    top_contributing_factors: List[ContributingFactor]
    data_quality_report: DataQualityReport
    model_version: str
    split_evaluation_auc: Optional[float] = None
    disclaimer: str

class WhatIfScenarioRequest(BaseModel):
    patient_id: str
    current_timestamp: Optional[str] = None
    activity_type: str = "sedentary"  # sedentary, light_walk, moderate_cardio, hiit_workout
    activity_duration_minutes: int = Field(default=0, ge=0, le=120)
    carb_intake_g: float = Field(default=0.0, ge=0.0, le=150.0)
    carb_delay_minutes: int = Field(default=0, ge=0, le=90)
    sleep_quality_mod: str = "normal_6h"  # restorative_8h, normal_6h, poor_4h, disrupted_shift
    hydration_status: str = "adequate"  # adequate, mild_dehydration

class WhatIfScenarioResponse(BaseModel):
    patient_id: str
    timestamp: str
    baseline_risk: float
    scenario_risk: float
    absolute_risk_diff: float
    relative_risk_diff: float
    baseline_forecast: List[ForecastPoint]
    scenario_forecast: List[ForecastPoint]
    key_physiological_drivers: List[str]
    simulation_parameters_applied: Dict[str, Any]
    disclaimer: str

class ModelEvaluationMetrics(BaseModel):
    model_name: str
    split_method: str
    test_patient_ids: List[str]
    train_sample_count: int
    test_sample_count: int
    class_balance: Dict[str, float]
    roc_auc: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: List[List[int]]
    brier_score: float
    feature_importances: Dict[str, float]
    trained_at: str
    disclaimer: str
