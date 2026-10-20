import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ARTIFACTS_DIR = BASE_DIR / "artifacts"
MODELS_DIR = ARTIFACTS_DIR / "models"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# Clinical & Physiological Parameters
EXCURSION_THRESHOLD_MG_DL: float = 180.0
HYPO_THRESHOLD_MG_DL: float = 70.0
NORMAL_MIN_MG_DL: float = 70.0
NORMAL_MAX_MG_DL: float = 180.0

# Temporal Parameters
SAMPLE_INTERVAL_MINUTES: int = 5
PREDICTION_HORIZON_MINUTES: int = 120  # 2 hours
HORIZON_STEPS: int = PREDICTION_HORIZON_MINUTES // SAMPLE_INTERVAL_MINUTES  # 24 steps
HISTORY_WINDOW_STEPS: int = 72  # 6 hours of rolling history shown on primary chart
TRAINING_PATIENT_COUNT: int = 12  # Synthetic patients for training & held-out evaluation
DAYS_OF_DATA_PER_PATIENT: int = 14  # 14 days of 5-min readings per patient

# Reproducibility
RANDOM_SEED: int = 2026

# Regulatory & Clinical Disclaimer
RESEARCH_DISCLAIMER: str = (
    "RESEARCH PROTOTYPE ONLY - NOT A MEDICAL DEVICE. "
    "All records and sensor telemetry are synthetically generated for the Digital Twin Challenge 2026. "
    "Not for clinical diagnosis, treatment planning, or medication dosage adjustment."
)
