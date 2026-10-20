"""Feature Extraction Pipeline for GlucoTwin AI.
Extracts strictly causal, leak-free feature vectors from CGM and wearable history up to time t.
No future data is ever accessed during feature computation.
"""

import math
from typing import Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

from backend.app.config import (
    EXCURSION_THRESHOLD_MG_DL,
    HORIZON_STEPS,
    SAMPLE_INTERVAL_MINUTES,
)
from backend.app.models.schemas import PatientEHR, SensorReading

FEATURE_COLUMNS = [
    # CGM dynamics
    "glucose_current",
    "glucose_roc_15m",
    "glucose_roc_30m",
    "glucose_roc_60m",
    "glucose_acceleration",
    "glucose_mean_1h",
    "glucose_mean_2h",
    "glucose_std_2h",
    "glucose_min_2h",
    "glucose_max_2h",
    "time_in_range_2h",
    "time_above_180_2h",
    # Wearable & Activity
    "heart_rate_current",
    "heart_rate_mean_1h",
    "heart_rate_roc_30m",
    "steps_sum_30m",
    "steps_sum_1h",
    "steps_sum_2h",
    "is_sleeping",
    "sleep_stage_num",
    "carbs_sum_1h",
    "carbs_sum_2h",
    "carbs_time_since_last_min",
    "active_insulin_est",
    # EHR Baseline Context
    "patient_age",
    "is_type_1",
    "years_diagnosed",
    "hba1c",
    "bmi",
    # Circadian timing
    "sin_hour",
    "cos_hour",
]

FEATURE_LABELS = {
    "glucose_current": "Current Glucose (mg/dL)",
    "glucose_roc_15m": "15-Min Glucose Rate of Change (mg/dL/min)",
    "glucose_roc_30m": "30-Min Glucose Rate of Change (mg/dL/min)",
    "glucose_roc_60m": "60-Min Glucose Rate of Change (mg/dL/min)",
    "glucose_acceleration": "Glucose Rate Acceleration (d²G/dt²)",
    "glucose_mean_1h": "1-Hour Average Glucose (mg/dL)",
    "glucose_mean_2h": "2-Hour Average Glucose (mg/dL)",
    "glucose_std_2h": "2-Hour Glucose Variability (SD)",
    "glucose_min_2h": "2-Hour Glucose Nadir (mg/dL)",
    "glucose_max_2h": "2-Hour Glucose Peak (mg/dL)",
    "time_in_range_2h": "Recent Time in Range (70-180 mg/dL)",
    "time_above_180_2h": "Recent Time in Hyperglycemia (>180 mg/dL)",
    "heart_rate_current": "Current Heart Rate (BPM)",
    "heart_rate_mean_1h": "1-Hour Mean Heart Rate (BPM)",
    "heart_rate_roc_30m": "30-Min Heart Rate Trend (BPM/min)",
    "steps_sum_30m": "Steps in Last 30 Minutes",
    "steps_sum_1h": "Steps in Last 60 Minutes",
    "steps_sum_2h": "Steps in Last 120 Minutes",
    "is_sleeping": "Sleep State Flag",
    "sleep_stage_num": "Sleep Architecture Stage",
    "carbs_sum_1h": "Carbohydrates Ingested (Last 1h, g)",
    "carbs_sum_2h": "Carbohydrates Ingested (Last 2h, g)",
    "carbs_time_since_last_min": "Time Since Last Meal (min)",
    "active_insulin_est": "Estimated Active Insulin (Units)",
    "patient_age": "Patient Age (years)",
    "is_type_1": "Type 1 Diabetes Diagnosis Flag",
    "years_diagnosed": "Duration of Diabetes (years)",
    "hba1c": "Baseline HbA1c (%)",
    "bmi": "Body Mass Index (kg/m²)",
    "sin_hour": "Circadian Diurnal Sin Component",
    "cos_hour": "Circadian Diurnal Cos Component",
}


def extract_features_at_index(
    readings: List[SensorReading],
    idx: int,
    ehr: PatientEHR,
) -> Optional[Dict[str, float]]:
    """Extracts features strictly using readings[0 : idx + 1].
    Requires at least 24 steps (2 hours) of prior telemetry.
    Returns None if insufficient history is available.
    """
    if idx < 24:
        return None

    current = readings[idx]
    current_glucose = current.glucose_mg_dl
    
    # Slices strictly in past:
    past_2h = readings[idx - 24 : idx + 1]
    past_1h = readings[idx - 12 : idx + 1]
    past_30m = readings[idx - 6 : idx + 1]
    past_15m = readings[idx - 3 : idx + 1]

    # Rates of change (mg/dL / min)
    roc_15m = (current_glucose - past_15m[0].glucose_mg_dl) / 15.0
    roc_30m = (current_glucose - past_30m[0].glucose_mg_dl) / 30.0
    roc_60m = (current_glucose - past_1h[0].glucose_mg_dl) / 60.0

    # Acceleration: rate difference
    roc_prev_15m = (past_15m[0].glucose_mg_dl - readings[idx - 6].glucose_mg_dl) / 15.0
    glucose_accel = (roc_15m - roc_prev_15m) / 15.0

    # Summary statistics
    gluc_vals_2h = [r.glucose_mg_dl for r in past_2h]
    gluc_vals_1h = [r.glucose_mg_dl for r in past_1h]

    mean_2h = float(np.mean(gluc_vals_2h))
    std_2h = float(np.std(gluc_vals_2h))
    min_2h = float(np.min(gluc_vals_2h))
    max_2h = float(np.max(gluc_vals_2h))
    mean_1h = float(np.mean(gluc_vals_1h))

    # Time in range metrics over past 2h
    tir_2h = sum(1 for g in gluc_vals_2h if 70.0 <= g <= 180.0) / len(gluc_vals_2h)
    tar_2h = sum(1 for g in gluc_vals_2h if g > 180.0) / len(gluc_vals_2h)

    # Wearables
    hr_vals_1h = [r.heart_rate_bpm for r in past_1h]
    hr_mean_1h = float(np.mean(hr_vals_1h))
    hr_roc_30m = (current.heart_rate_bpm - past_30m[0].heart_rate_bpm) / 30.0

    steps_30m = sum(r.steps for r in past_30m)
    steps_1h = sum(r.steps for r in past_1h)
    steps_2h = sum(r.steps for r in past_2h)

    # Sleep
    sleep_map = {"awake": 0, "light": 1, "deep": 2, "rem": 3}
    is_sleep = 1.0 if current.sleep_state != "awake" else 0.0
    sleep_stage = float(sleep_map.get(current.sleep_state, 0))

    # Carbs
    carbs_1h = sum(r.recent_carbs_g for r in past_1h)
    carbs_2h = sum(r.recent_carbs_g for r in past_2h)

    # Find time since last meal within last 6 hours
    search_window = readings[max(0, idx - 72) : idx + 1]
    time_since_meal = 360.0  # default max
    for step_back, r in enumerate(reversed(search_window)):
        if r.recent_carbs_g > 5.0:
            time_since_meal = float(step_back * SAMPLE_INTERVAL_MINUTES)
            break

    # Circadian encoding
    # Parse timestamp
    try:
        dt = pd.to_datetime(current.timestamp)
        hour_fraction = dt.hour + dt.minute / 60.0
    except Exception:
        hour_fraction = 12.0

    sin_h = math.sin(2.0 * math.pi * hour_fraction / 24.0)
    cos_h = math.cos(2.0 * math.pi * hour_fraction / 24.0)

    is_t1 = 1.0 if "Type 1" in ehr.diabetes_type else 0.0

    feature_dict = {
        "glucose_current": float(current_glucose),
        "glucose_roc_15m": float(roc_15m),
        "glucose_roc_30m": float(roc_30m),
        "glucose_roc_60m": float(roc_60m),
        "glucose_acceleration": float(glucose_accel),
        "glucose_mean_1h": float(mean_1h),
        "glucose_mean_2h": float(mean_2h),
        "glucose_std_2h": float(std_2h),
        "glucose_min_2h": float(min_2h),
        "glucose_max_2h": float(max_2h),
        "time_in_range_2h": float(tir_2h),
        "time_above_180_2h": float(tar_2h),
        "heart_rate_current": float(current.heart_rate_bpm),
        "heart_rate_mean_1h": float(hr_mean_1h),
        "heart_rate_roc_30m": float(hr_roc_30m),
        "steps_sum_30m": float(steps_30m),
        "steps_sum_1h": float(steps_1h),
        "steps_sum_2h": float(steps_2h),
        "is_sleeping": is_sleep,
        "sleep_stage_num": sleep_stage,
        "carbs_sum_1h": float(carbs_1h),
        "carbs_sum_2h": float(carbs_2h),
        "carbs_time_since_last_min": float(time_since_meal),
        "active_insulin_est": float(current.active_insulin_units),
        "patient_age": float(ehr.age),
        "is_type_1": is_t1,
        "years_diagnosed": float(ehr.years_diagnosed),
        "hba1c": float(ehr.hba1c),
        "bmi": float(ehr.bmi),
        "sin_hour": float(sin_h),
        "cos_hour": float(cos_h),
    }

    return feature_dict


def build_patient_dataset(
    readings: List[SensorReading],
    ehr: PatientEHR,
    step_stride: int = 2,  # every 10 min to reduce correlation and keep fast
) -> Tuple[pd.DataFrame, pd.Series]:
    """Builds features X and target y for one patient.
    Target y = 1 if max glucose in next 2 hours >= 180.0 mg/dL, else 0.
    """
    total = len(readings)
    records = []
    targets = []

    # Valid index range: from 24 (need 2h history) to total - HORIZON_STEPS (need 2h future)
    for idx in range(24, total - HORIZON_STEPS, step_stride):
        feat = extract_features_at_index(readings, idx, ehr)
        if feat is None:
            continue

        # Target: strictly look at readings[idx + 1 : idx + 1 + HORIZON_STEPS]
        future_readings = readings[idx + 1 : idx + 1 + HORIZON_STEPS]
        future_glucoses = [r.glucose_mg_dl for r in future_readings]
        max_future = max(future_glucoses) if future_glucoses else readings[idx].glucose_mg_dl
        target = 1 if max_future >= EXCURSION_THRESHOLD_MG_DL else 0

        feat["patient_id"] = ehr.id
        feat["timestamp"] = readings[idx].timestamp
        records.append(feat)
        targets.append(target)

    df_x = pd.DataFrame(records)
    series_y = pd.Series(targets, name="target_excursion_2h")
    return df_x, series_y
