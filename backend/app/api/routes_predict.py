"""Real-Time Prediction & Explainability API Route for GlucoTwin AI.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException

from backend.app.data.generator import get_patient_ehr
from backend.app.ml.inference import predict_glucose_excursion
from backend.app.models.schemas import PredictionResult
from backend.app.simulation.engine import get_simulation_manager

router = APIRouter(prefix="/api/predict", tags=["prediction"])


@router.get("/{patient_id}", response_model=PredictionResult)
def get_prediction_for_patient(patient_id: str) -> PredictionResult:
    """Computes leak-free 2-hour high excursion risk prediction,
    explainability contributions, 2-hour forecast corridor, and data quality check.
    """
    ehr = get_patient_ehr(patient_id)
    if ehr is None:
        raise HTTPException(status_code=404, detail=f"Patient {patient_id} not found.")

    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(patient_id)
    history = twin.get_history_window(window_steps=72)

    # If stale anomaly active, simulate current time ahead of latest timestamp
    current_time_override = None
    if twin.stale_lag_minutes > 0 and history:
        try:
            latest_dt = datetime.fromisoformat(history[-1].timestamp)
            from datetime import timedelta
            current_time_override = latest_dt + timedelta(minutes=twin.stale_lag_minutes)
        except Exception:
            pass

    prediction = predict_glucose_excursion(history, ehr, current_time=current_time_override)
    return prediction
