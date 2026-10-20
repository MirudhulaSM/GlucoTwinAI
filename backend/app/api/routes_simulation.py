"""Simulation Controls API Routes for GlucoTwin AI.
Allows advancing timestamps, resetting virtual twins, and injecting sensor anomalies.
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.app.simulation.engine import get_simulation_manager

router = APIRouter(prefix="/api/simulation", tags=["simulation"])


class StepRequest(BaseModel):
    minutes: int = Field(default=5, ge=5, le=180)


class AnomalyRequest(BaseModel):
    anomaly_type: str = Field(
        ...,
        description="One of: 'stale_telemetry', 'compression_artifact', 'missing_packets', 'out_of_range'"
    )


@router.post("/{patient_id}/step")
def advance_simulation_step(patient_id: str, payload: StepRequest) -> Dict[str, Any]:
    """Advances the virtual twin clock by N minutes (e.g., 5, 15, 30 min)."""
    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    new_reading = twin.step_forward(minutes=payload.minutes)

    return {
        "status": "success",
        "patient_id": patient_id,
        "advanced_minutes": payload.minutes,
        "new_timestamp": new_reading.timestamp,
        "current_glucose": new_reading.glucose_mg_dl,
        "heart_rate": new_reading.heart_rate_bpm,
        "steps": new_reading.steps,
    }


@router.post("/{patient_id}/reset")
def reset_simulation(patient_id: str) -> Dict[str, Any]:
    """Resets the virtual twin to its initial simulation starting point and clears anomalies."""
    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    twin.reset()
    latest = twin.get_latest_reading()

    return {
        "status": "success",
        "message": f"Virtual Twin {patient_id} clock reset to initial baseline.",
        "timestamp": latest.timestamp,
        "glucose_mg_dl": latest.glucose_mg_dl,
    }


@router.post("/{patient_id}/anomaly")
def inject_sensor_anomaly(patient_id: str, payload: AnomalyRequest) -> Dict[str, Any]:
    """Injects synthetic sensor faults to evaluate data-quality triggers and model safeguards."""
    valid_anomalies = {"stale_telemetry", "compression_artifact", "missing_packets", "out_of_range"}
    if payload.anomaly_type not in valid_anomalies:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid anomaly type. Must be one of: {list(valid_anomalies)}"
        )

    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    twin.inject_anomaly(payload.anomaly_type)

    return {
        "status": "success",
        "patient_id": patient_id,
        "injected_anomaly": payload.anomaly_type,
        "active_anomalies": twin.active_anomalies,
    }


@router.post("/{patient_id}/clear-anomalies")
def clear_sensor_anomalies(patient_id: str) -> Dict[str, Any]:
    """Clears all synthetic anomalies and restores clean sensor telemetry."""
    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    twin.clear_anomalies()

    return {
        "status": "success",
        "patient_id": patient_id,
        "active_anomalies": twin.active_anomalies,
        "message": "All sensor anomalies cleared.",
    }
