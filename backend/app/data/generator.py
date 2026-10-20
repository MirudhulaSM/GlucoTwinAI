"""Synthetic Patient and Telemetry Generator for GlucoTwin AI.
Generates realistic physiological CGM, Heart Rate, Step, and Sleep time-series.
Includes distinct clinical phenotypes:
- Brittle T1D with high glycemic variability
- T2D with insulin resistance and dawn phenomenon
- Athletic T1D with exercise-induced dynamics
- Shift-worker with irregular sleep-wake circadian stress

RESEARCH PROTOTYPE ONLY - ALL DATA IS SYNTHETIC.
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
import numpy as np

from backend.app.config import (
    EXCURSION_THRESHOLD_MG_DL,
    RANDOM_SEED,
    SAMPLE_INTERVAL_MINUTES,
)
from backend.app.models.schemas import PatientEHR, SensorReading

PATIENT_PROFILES: List[Dict] = [
    {
        "id": "PT-101",
        "name": "Elena Rostova",
        "age": 42,
        "gender": "Female",
        "diabetes_type": "Type 1 Diabetes",
        "years_diagnosed": 14.5,
        "hba1c": 8.4,
        "bmi": 23.2,
        "baseline_therapy": [
            "Continuous Subcutaneous Insulin Infusion (CSII)",
            "Dexcom G7 CGM",
            "Insulin Aspart (Rapid-Acting)",
            "Insulin Degludec (Basal)",
        ],
        "comorbidities": ["Mild Non-Proliferative Retinopathy", "Hashimoto Thyroiditis"],
        "archetype": "Brittle T1D (High Glycemic Variability)",
        "clinical_notes": (
            "Patient demonstrates notable glucose lability with frequent postprandial excursions "
            "exceeding 220 mg/dL despite carbohydrate counting. High sensitivity to acute psychological stress. "
            "Dawn phenomenon observed between 05:30 and 08:00."
        ),
        "target_range_mg_dl": [70.0, 180.0],
        "baseline_glucose": 155.0,
        "glucose_std": 38.0,
        "carb_sensitivity": 1.45,  # mg/dL rise per gram carb
        "exercise_sensitivity": 0.95,  # mg/dL drop per 1000 steps
        "dawn_magnitude": 35.0,
    },
    {
        "id": "PT-102",
        "name": "Marcus Vance",
        "age": 58,
        "gender": "Male",
        "diabetes_type": "Type 2 Diabetes",
        "years_diagnosed": 8.0,
        "hba1c": 7.6,
        "bmi": 30.4,
        "baseline_therapy": [
            "Metformin 1000mg BID",
            "Empagliflozin 25mg Daily",
            "Semaglutide 1.0mg Weekly SubQ",
            "Freestyle Libre 3 CGM",
        ],
        "comorbidities": ["Essential Hypertension", "Dyslipidemia", "Steatotic Liver Disease"],
        "archetype": "T2D (Elevated Insulin Resistance & Dawn Phenomenon)",
        "clinical_notes": (
            "Insulin-resistant phenotype with sustained postprandial plateaus rather than rapid spikes. "
            "Endogenous hepatic glucose output elevated overnight. Responds well to post-meal walking."
        ),
        "target_range_mg_dl": [70.0, 180.0],
        "baseline_glucose": 145.0,
        "glucose_std": 22.0,
        "carb_sensitivity": 0.95,
        "exercise_sensitivity": 1.35,  # exercises lower glucose very effectively
        "dawn_magnitude": 28.0,
    },
    {
        "id": "PT-103",
        "name": "Aria Chen",
        "age": 29,
        "gender": "Female",
        "diabetes_type": "Type 1 Diabetes",
        "years_diagnosed": 9.2,
        "hba1c": 6.8,
        "bmi": 21.6,
        "baseline_therapy": [
            "Automated Insulin Delivery (Tandem Control-IQ)",
            "Dexcom G6 CGM",
            "Insulin Lispro",
        ],
        "comorbidities": ["None documented"],
        "archetype": "Active Athlete T1D (Exercise-Sensitive)",
        "clinical_notes": (
            "Well-controlled athlete engaging in regular distance running and resistance training. "
            "Susceptible to exercise-induced nocturnal hypoglycemia if evening activity is strenuous, "
            "followed by rebound stress hyperglycemia if counter-regulatory response triggers."
        ),
        "target_range_mg_dl": [70.0, 180.0],
        "baseline_glucose": 118.0,
        "glucose_std": 26.0,
        "carb_sensitivity": 1.20,
        "exercise_sensitivity": 1.80,
        "dawn_magnitude": 15.0,
    },
    {
        "id": "PT-104",
        "name": "David Okafor",
        "age": 51,
        "gender": "Male",
        "diabetes_type": "Type 2 Diabetes",
        "years_diagnosed": 5.5,
        "hba1c": 8.1,
        "bmi": 28.9,
        "baseline_therapy": [
            "Metformin 850mg TID",
            "Glipizide XL 10mg Daily",
            "Continuous Glucose Sensor",
        ],
        "comorbidities": ["Obstructive Sleep Apnea (CPAP Non-adherent)", "Stage 1 Hypertension"],
        "archetype": "Shift Worker (Circadian Misalignment)",
        "clinical_notes": (
            "Works rotating night shifts 3 nights/week. Severe circadian misalignment leads to "
            "intermittent cortisol-driven glucose elevations, irregular meal schedules, and fragmented sleep "
            "inducing acute insulin resistance."
        ),
        "target_range_mg_dl": [70.0, 180.0],
        "baseline_glucose": 150.0,
        "glucose_std": 32.0,
        "carb_sensitivity": 1.15,
        "exercise_sensitivity": 0.85,
        "dawn_magnitude": 40.0,
    },
]

# Generate additional background profiles for robust training if needed
for i in range(5, 13):
    is_t1 = (i % 2 == 1)
    PATIENT_PROFILES.append({
        "id": f"PT-{100 + i}",
        "name": f"Cohort Subject {100 + i}",
        "age": 30 + (i * 3) % 40,
        "gender": "Male" if i % 2 == 0 else "Female",
        "diabetes_type": "Type 1 Diabetes" if is_t1 else "Type 2 Diabetes",
        "years_diagnosed": float(3 + (i * 2) % 15),
        "hba1c": round(6.5 + (i * 0.3) % 3.0, 1),
        "bmi": round(21.0 + (i * 1.2) % 14.0, 1),
        "baseline_therapy": ["Standard Basal-Bolus Insulin"] if is_t1 else ["Metformin 1000mg BID"],
        "comorbidities": ["Hypertension"] if i % 3 == 0 else [],
        "archetype": "Training Cohort Profile",
        "clinical_notes": "Synthetically generated clinical cohort profile for model training.",
        "target_range_mg_dl": [70.0, 180.0],
        "baseline_glucose": 125.0 + (i * 5) % 40,
        "glucose_std": 25.0 + (i * 2) % 20,
        "carb_sensitivity": 1.0 + (i * 0.05) % 0.6,
        "exercise_sensitivity": 1.0 + (i * 0.08) % 0.8,
        "dawn_magnitude": 20.0 + (i * 3) % 25,
    })


def get_patient_ehr(patient_id: str) -> PatientEHR:
    for p in PATIENT_PROFILES:
        if p["id"] == patient_id:
            return PatientEHR(
                id=p["id"],
                name=p["name"],
                age=p["age"],
                gender=p["gender"],
                diabetes_type=p["diabetes_type"],
                years_diagnosed=p["years_diagnosed"],
                hba1c=p["hba1c"],
                bmi=p["bmi"],
                baseline_therapy=p["baseline_therapy"],
                comorbidities=p["comorbidities"],
                archetype=p["archetype"],
                clinical_notes=p["clinical_notes"],
                target_range_mg_dl=p["target_range_mg_dl"],
                is_synthetic=True,
            )
    # Default fallback
    p = PATIENT_PROFILES[0]
    return PatientEHR(**{k: v for k, v in p.items() if k in PatientEHR.model_fields})


def generate_patient_telemetry(
    patient_id: str,
    days: int = 14,
    start_time: datetime = datetime(2026, 10, 1, 0, 0, 0),
    seed_offset: int = 0,
) -> List[SensorReading]:
    """Generates continuous 5-minute telemetry for a given patient.
    Physiologically grounded:
    - Meal absorption curve (log-normal / gamma-like peak at ~45-75 min)
    - Dawn phenomenon (early morning circadian rise)
    - Physical activity (heart rate increase, step bursts, glucose lowering)
    - Sleep stages and nocturnal heart rate lowering
    - Autoregressive AR(1) / Ornstein-Uhlenbeck smooth drift
    """
    profile = next((p for p in PATIENT_PROFILES if p["id"] == patient_id), PATIENT_PROFILES[0])
    p_num = int(patient_id.split("-")[-1])
    rng = np.random.default_rng(RANDOM_SEED + p_num * 100 + seed_offset)

    total_steps = days * 24 * (60 // SAMPLE_INTERVAL_MINUTES)
    readings: List[SensorReading] = []

    # State variables
    current_glucose = profile["baseline_glucose"] + rng.normal(0, 5)
    glucose_drift = 0.0

    # Meal schedule template per day: (hour, minute, avg_carbs, carb_std)
    daily_meals = [
        (8, 0, 45, 15),    # Breakfast
        (13, 0, 65, 20),   # Lunch
        (19, 30, 75, 25),  # Dinner
    ]
    # Afternoon snack with 40% probability
    # Evening snack with 30% probability

    for step_idx in range(total_steps):
        t = start_time + timedelta(minutes=step_idx * SAMPLE_INTERVAL_MINUTES)
        minute_of_day = t.hour * 60 + t.minute
        time_frac = minute_of_day / 1440.0

        # Circadian / Sleep state determination
        is_sleeping = False
        sleep_state = "awake"
        if profile["id"] == "PT-104":
            # Shift worker: night shifts on days 1, 2, 5
            day_of_week = t.weekday()
            if day_of_week in [0, 1, 4]:
                # Sleeps 09:00 - 15:30
                if 9 * 60 <= minute_of_day < 15 * 60 + 30:
                    is_sleeping = True
            else:
                if 23 * 60 <= minute_of_day or minute_of_day < 6 * 60:
                    is_sleeping = True
        else:
            if 23 * 60 <= minute_of_day or minute_of_day < 6 * 60 + 30:
                is_sleeping = True

        if is_sleeping:
            # Cycle through light, deep, rem sleep
            cycle_min = (minute_of_day % 90)
            if cycle_min < 20:
                sleep_state = "deep"
            elif cycle_min < 50:
                sleep_state = "light"
            elif cycle_min < 75:
                sleep_state = "rem"
            else:
                sleep_state = "light"

        # Baseline vitals
        if is_sleeping:
            base_hr = 56.0 + 4.0 * math.sin(time_frac * 2 * math.pi)
            hr_noise = rng.normal(0, 2.5)
            steps = 0 if rng.random() > 0.03 else rng.integers(5, 25)
        else:
            base_hr = 74.0 + 8.0 * math.sin(time_frac * 2 * math.pi)
            hr_noise = rng.normal(0, 5.0)
            # Active movement during waking hours
            is_active_bout = rng.random() < 0.12
            if is_active_bout:
                steps = rng.integers(120, 550)
                base_hr += min(50.0, steps * 0.08)
            else:
                steps = rng.integers(0, 45)

        hr = float(np.clip(base_hr + hr_noise, 48.0, 175.0))

        # Meal occurrence check
        carbs = 0.0
        for m_hour, m_min, m_carbs, m_std in daily_meals:
            if t.hour == m_hour and t.minute == m_min:
                carbs = max(10.0, rng.normal(m_carbs, m_std))
        
        # Snack checks
        if t.hour == 16 and t.minute == 0 and rng.random() < 0.35:
            carbs = max(15.0, rng.normal(25, 8))
        if t.hour == 21 and t.minute == 30 and rng.random() < 0.25:
            carbs = max(15.0, rng.normal(30, 10))

        # Dawn phenomenon impact (gradual rise between 05:00 and 08:30)
        dawn_force = 0.0
        if 5 <= t.hour < 9:
            dawn_progress = ((t.hour - 5) * 60 + t.minute) / 240.0  # 0 to 1
            dawn_force = profile["dawn_magnitude"] * math.sin(dawn_progress * math.pi) * (SAMPLE_INTERVAL_MINUTES / 60.0)

        # Meal absorption effect on glucose
        # Carbs ingested create a delayed impulse decaying with gamma shape
        if carbs > 0:
            glucose_drift += carbs * profile["carb_sensitivity"] * 0.08

        # Physical activity lowering effect
        if steps > 100:
            glucose_lowering = (steps / 1000.0) * profile["exercise_sensitivity"] * 3.5
            glucose_drift -= glucose_lowering

        # Mean reversion toward patient baseline glucose
        mean_reversion = 0.025 * (profile["baseline_glucose"] - current_glucose)
        
        # AR(1) physiological stochastic disturbance (Ornstein-Uhlenbeck)
        stochastic_shock = rng.normal(0, 1.8)
        
        # Update glucose
        delta_g = mean_reversion + glucose_drift + dawn_force + stochastic_shock
        current_glucose += delta_g
        glucose_drift *= 0.94  # gradual decay of meal absorption / exercise impulse

        # Physical boundary clamp
        current_glucose = float(np.clip(current_glucose, 45.0, 360.0))

        # Active insulin proxy
        active_insulin = max(0.0, (current_glucose - 100.0) * 0.035 + (0.5 if carbs > 0 else 0.0))

        # Sensor noise / compression artifact simulation occasionally for testing quality
        quality_flag = "OK"
        # 0.1% chance of compression artifact during deep sleep (rapid artificial drop)
        if is_sleeping and sleep_state == "deep" and rng.random() < 0.001:
            quality_flag = "COMPRESSION_ARTIFACT"
            reported_glucose = max(42.0, current_glucose - rng.uniform(35, 70))
        else:
            # Ordinary sensor precision noise (+- 1.5 mg/dL)
            sensor_noise = rng.normal(0, 1.2)
            reported_glucose = float(np.clip(current_glucose + sensor_noise, 40.0, 400.0))

        readings.append(
            SensorReading(
                timestamp=t.isoformat(),
                glucose_mg_dl=round(reported_glucose, 1),
                heart_rate_bpm=round(hr, 1),
                steps=int(steps),
                sleep_state=sleep_state,
                recent_carbs_g=round(carbs, 1),
                active_insulin_units=round(active_insulin, 2),
                sensor_quality_flag=quality_flag,
                is_synthetic=True,
            )
        )

    return readings
