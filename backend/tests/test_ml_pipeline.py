"""Unit tests for ML feature extraction, inference, and data quality checks.
"""

from backend.app.data.generator import generate_patient_telemetry, get_patient_ehr
from backend.app.ml.features import FEATURE_COLUMNS, extract_features_at_index
from backend.app.ml.inference import (
    evaluate_data_quality,
    get_loaded_model,
    predict_glucose_excursion,
    simulate_what_if_scenario,
)
from backend.app.models.schemas import WhatIfScenarioRequest


def test_leak_free_feature_extraction():
    ehr = get_patient_ehr("PT-101")
    telemetry = generate_patient_telemetry("PT-101", days=2)
    
    # Feature extraction at index 50 should only use data up to 50
    feat_50 = extract_features_at_index(telemetry, 50, ehr)
    assert feat_50 is not None
    for col in FEATURE_COLUMNS:
        assert col in feat_50
        assert not isinstance(feat_50[col], bool)

    # Feature extraction before index 24 must return None (requires 2h history)
    feat_10 = extract_features_at_index(telemetry, 10, ehr)
    assert feat_10 is None


def test_model_loading_and_prediction():
    model, metrics, metadata = get_loaded_model()
    assert model is not None
    assert metrics is not None
    assert "roc_auc" in metrics
    assert metrics["roc_auc"] > 0.70  # Generalizes well on held-out patients
    assert "confusion_matrix" in metrics

    ehr = get_patient_ehr("PT-101")
    telemetry = generate_patient_telemetry("PT-101", days=1)
    prediction = predict_glucose_excursion(telemetry[:60], ehr)

    assert 0.0 <= prediction.excursion_risk_probability <= 1.0
    assert prediction.risk_level in {"Low", "Moderate", "High", "Critical"}
    assert len(prediction.forecast_curve) == 24
    assert len(prediction.top_contributing_factors) > 0
    assert prediction.target_threshold_mg_dl == 180.0


def test_what_if_counterfactual():
    ehr = get_patient_ehr("PT-101")
    telemetry = generate_patient_telemetry("PT-101", days=1)
    
    # Scenario 1: High carb meal (should increase risk)
    req_carbs = WhatIfScenarioRequest(
        patient_id="PT-101",
        carb_intake_g=75.0,
        activity_type="sedentary",
        activity_duration_minutes=0,
    )
    res_carbs = simulate_what_if_scenario(req_carbs, telemetry[:60], ehr)
    assert res_carbs.scenario_risk >= res_carbs.baseline_risk
    assert res_carbs.absolute_risk_diff >= 0.0

    # Scenario 2: Moderate cardio (should mitigate / lower risk)
    req_exercise = WhatIfScenarioRequest(
        patient_id="PT-101",
        carb_intake_g=0.0,
        activity_type="moderate_cardio",
        activity_duration_minutes=30,
    )
    res_exercise = simulate_what_if_scenario(req_exercise, telemetry[:60], ehr)
    assert res_exercise.scenario_risk <= res_exercise.baseline_risk or res_exercise.scenario_risk < 0.20


def test_data_quality_anomalies():
    telemetry = generate_patient_telemetry("PT-101", days=1)
    clean_quality = evaluate_data_quality(telemetry[:30])
    assert clean_quality.status in {"Optimal", "Acceptable"}
    assert clean_quality.overall_score >= 80.0

    # Stale telemetry check
    from datetime import datetime, timedelta
    old_time = datetime.fromisoformat(telemetry[20].timestamp) + timedelta(minutes=40)
    stale_quality = evaluate_data_quality(telemetry[:20], current_time=old_time)
    assert stale_quality.is_stale is True
    assert stale_quality.status in {"Degraded", "Critical"}
