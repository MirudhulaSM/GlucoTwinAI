"""What-If Counterfactual Lab API Route for GlucoTwin AI.
Evaluates hypothetical futures under modified activity, meal, and sleep conditions.

RESEARCH PROTOTYPE ONLY - ALL DATA IS SYNTHETIC. NOT A MEDICAL DEVICE.
"""

from fastapi import APIRouter, HTTPException

from backend.app.data.generator import get_patient_ehr
from backend.app.ml.inference import simulate_what_if_scenario
from backend.app.models.schemas import WhatIfScenarioRequest, WhatIfScenarioResponse
from backend.app.simulation.engine import get_simulation_manager

router = APIRouter(prefix="/api/whatif", tags=["what-if"])


@router.post("/simulate", response_model=WhatIfScenarioResponse)
def simulate_scenario(payload: WhatIfScenarioRequest) -> WhatIfScenarioResponse:
    """Computes comparative counterfactual predictions between baseline
    and user-specified hypothetical scenario.
    """
    ehr = get_patient_ehr(payload.patient_id)
    if ehr is None:
        raise HTTPException(status_code=404, detail=f"Patient {payload.patient_id} not found.")

    sim_mgr = get_simulation_manager()
    twin = sim_mgr.get_twin(payload.patient_id)
    history = twin.get_history_window(window_steps=72)

    response = simulate_what_if_scenario(payload, history, ehr)
    return response
