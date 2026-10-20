"""Unit tests for synthetic patient generator.
"""

from datetime import datetime
from backend.app.data.generator import (
    PATIENT_PROFILES,
    generate_patient_telemetry,
    get_patient_ehr,
)


def test_patient_ehr_profiles():
    for profile in PATIENT_PROFILES[:4]:
        ehr = get_patient_ehr(profile["id"])
        assert ehr.id == profile["id"]
        assert ehr.is_synthetic is True
        assert ehr.hba1c > 5.0
        assert ehr.age > 18
        assert len(ehr.baseline_therapy) > 0


def test_telemetry_generation():
    patient_id = "PT-101"
    telemetry = generate_patient_telemetry(patient_id, days=2)
    
    # 2 days * 288 points/day = 576 points
    assert len(telemetry) == 576
    
    # Check physiological bounds
    for r in telemetry:
        assert 35.0 <= r.glucose_mg_dl <= 420.0
        assert 45.0 <= r.heart_rate_bpm <= 200.0
        assert r.steps >= 0
        assert r.is_synthetic is True
        assert r.sleep_state in {"awake", "light", "deep", "rem"}


def test_reproducibility():
    # Calling with same seed should produce identical trajectories
    t1 = generate_patient_telemetry("PT-102", days=1, seed_offset=42)
    t2 = generate_patient_telemetry("PT-102", days=1, seed_offset=42)
    assert len(t1) == len(t2)
    assert t1[0].glucose_mg_dl == t2[0].glucose_mg_dl
    assert t1[100].glucose_mg_dl == t2[100].glucose_mg_dl
