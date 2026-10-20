"""Integration tests for FastAPI endpoints.
"""

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_healthcheck():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "disclaimer" in data


def test_list_patients():
    res = client.get("/api/patients")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 4
    assert any(p["id"] == "PT-101" for p in data)


def test_get_patient_detail():
    res = client.get("/api/patients/PT-101")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "PT-101"
    assert "Elena Rostova" in data["name"]
    assert data["is_synthetic"] is True


def test_get_patient_telemetry():
    res = client.get("/api/patients/PT-101/telemetry?history_steps=36")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert "latest_reading" in data
    assert "trend_arrow" in data


def test_prediction_endpoint():
    res = client.get("/api/predict/PT-101")
    assert res.status_code == 200
    data = res.json()
    assert "excursion_risk_probability" in data
    assert "risk_level" in data
    assert "forecast_curve" in data
    assert "top_contributing_factors" in data
    assert "data_quality_report" in data
    assert data["target_threshold_mg_dl"] == 180.0


def test_whatif_endpoint():
    payload = {
        "patient_id": "PT-101",
        "activity_type": "light_walk",
        "activity_duration_minutes": 20,
        "carb_intake_g": 30.0,
        "carb_delay_minutes": 10,
        "sleep_quality_mod": "restorative_8h",
    }
    res = client.post("/api/whatif/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "baseline_risk" in data
    assert "scenario_risk" in data
    assert "absolute_risk_diff" in data
    assert "baseline_forecast" in data
    assert "scenario_forecast" in data
    assert "disclaimer" in data


def test_simulation_controls():
    # Advance 15 min
    res = client.post("/api/simulation/PT-101/step", json={"minutes": 15})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["advanced_minutes"] == 15

    # Inject anomaly
    res_anom = client.post(
        "/api/simulation/PT-101/anomaly",
        json={"anomaly_type": "compression_artifact"}
    )
    assert res_anom.status_code == 200
    assert "compression_artifact" in res_anom.json()["active_anomalies"]

    # Clear anomaly
    res_clear = client.post("/api/simulation/PT-101/clear-anomalies")
    assert res_clear.status_code == 200
    assert len(res_clear.json()["active_anomalies"]) == 0


def test_metrics_endpoint():
    res = client.get("/api/metrics")
    assert res.status_code == 200
    data = res.json()
    assert "metrics" in data
    assert "metadata" in data
    assert data["metrics"]["roc_auc"] > 0.70
