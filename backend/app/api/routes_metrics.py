"""Model Evaluation Metrics API Route for GlucoTwin AI.
Exposes empirical performance metrics evaluated on held-out test patients.
"""

from typing import Dict, Any
from fastapi import APIRouter, HTTPException

from backend.app.ml.inference import get_loaded_model

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("")
def get_model_metrics() -> Dict[str, Any]:
    """Returns fitted scikit-learn model evaluation metrics on held-out test patients."""
    _, metrics, metadata = get_loaded_model()
    if metrics is None:
        raise HTTPException(status_code=404, detail="Model evaluation metrics not found.")

    return {
        "metrics": metrics,
        "metadata": metadata,
    }
