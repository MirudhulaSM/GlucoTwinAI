"""Patient EHR & Telemetry API Routes for GlucoTwin AI.
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException

from backend.app.data.generator import PATIENT_PROFILES, get_patient_ehr
from backend.app.models.schemas import PatientEHR, SensorReading
from backend.app.simulation.engine import get_simulation_manager

router = APIRouter(prefix="/api/patients", tags=["patients"])


@router.get("", response_model=List[PatientEHR])
def list_patients() -> List[PatientEHR]:
    """Returns available interactive patient digital twin EHR records."""
    # Return primary 4 diverse archetypes
    return [get_patient_ehr(p["id"]) for p in PATIENT_PROFILES[:4]]


@router.get("/{patient_id}", response_model=PatientEHR)
def get_patient(patient_id: str) -> PatientEHR:
    """Returns specific patient EHR profile."""
    ehr = get_patient_ehr(patient_id)
    if ehr is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")
    return ehr


@router.get("/{patient_id}/telemetry")
def get_patient_telemetry(patient_id: str, history_steps: int = 72) -> Dict[str, Any]:
    """Returns the historical telemetry window (default 6 hours = 72 steps)
    and the latest vitals snapshot for the virtual twin.
    """
    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    history = twin.get_history_window(window_steps=history_steps)
    latest = twin.get_latest_reading()

    # Calculate recent stats
    gluc_vals = [r.glucose_mg_dl for r in history]
    current_g = latest.glucose_mg_dl
    
    # Trend arrow calculation
    if len(history) >= 4:
        diff_15m = current_g - history[-4].glucose_mg_dl
        rate_15m = diff_15m / 15.0
        if rate_15m > 2.0:
            trend = "RAPIDLY_RISING"  # Double up
        elif rate_15m > 1.0:
            trend = "RISING"  # Single up
        elif rate_15m > 0.3:
            trend = "SLOWLY_RISING"  # Diagonal up
        elif rate_15m < -2.0:
            trend = "RAPIDLY_FALLING"  # Double down
        elif rate_15m < -1.0:
            trend = "FALLING"  # Single down
        elif rate_15m < -0.3:
            trend = "SLOWLY_FALLING"  # Diagonal down
        else:
            trend = "FLAT"
    else:
        trend = "FLAT"
        rate_15m = 0.0

    return {
        "patient_id": patient_id,
        "latest_reading": latest.model_dump(),
        "history": [r.model_dump() for r in history],
        "trend_arrow": trend,
        "rate_of_change_15m": round(rate_15m, 2),
        "history_steps_count": len(history),
        "active_anomalies": twin.active_anomalies,
        "is_synthetic": True,
    }
