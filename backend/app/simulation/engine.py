"""Simulation State Machine & Virtual Twin Engine for GlucoTwin AI.
Maintains in-memory temporal state for virtual patient twins.
Supports interactive time advancement, replay, anomaly injection, and What-If resets.

RESEARCH PROTOTYPE ONLY - ALL DATA IS SYNTHETIC.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional
import numpy as np

from backend.app.config import (
    DAYS_OF_DATA_PER_PATIENT,
    HISTORY_WINDOW_STEPS,
    RANDOM_SEED,
    SAMPLE_INTERVAL_MINUTES,
)
from backend.app.data.generator import (
    PATIENT_PROFILES,
    generate_patient_telemetry,
    get_patient_ehr,
)
from backend.app.models.schemas import PatientEHR, SensorReading


class VirtualPatientTwin:
    """Represents an active virtual twin instance."""

    def __init__(self, patient_id: str):
        self.patient_id = patient_id
        self.ehr: PatientEHR = get_patient_ehr(patient_id)
        # Generate full baseline telemetry trajectory (14 days = 4032 points)
        self.full_telemetry: List[SensorReading] = generate_patient_telemetry(
            patient_id, days=DAYS_OF_DATA_PER_PATIENT
        )
        # Start at day 3, 10:30 AM (step index 288 * 2 + 126 = 702) so we have abundant historical baseline
        self.initial_step_index: int = 702
        self.current_step_index: int = self.initial_step_index
        # Anomaly simulation overrides
        self.active_anomalies: List[str] = []
        self.stale_lag_minutes: int = 0
        self.synthetic_dropouts_count: int = 0

    def reset(self):
        """Resets the simulation clock and clears injected anomalies."""
        self.current_step_index = self.initial_step_index
        self.active_anomalies = []
        self.stale_lag_minutes = 0
        self.synthetic_dropouts_count = 0

    def step_forward(self, minutes: int = 5) -> SensorReading:
        """Advances the virtual twin clock by given minutes (multiples of 5)."""
        steps = max(1, minutes // SAMPLE_INTERVAL_MINUTES)
        max_steps = len(self.full_telemetry) - 25  # Leave room for horizon
        self.current_step_index = min(max_steps, self.current_step_index + steps)
        return self.get_latest_reading()

    def get_latest_reading(self) -> SensorReading:
        """Returns the current reading with any active anomaly overrides applied."""
        base_reading = self.full_telemetry[self.current_step_index]
        
        # Apply anomaly overrides if injected
        override_g = base_reading.glucose_mg_dl
        flag = base_reading.sensor_quality_flag
        ts = base_reading.timestamp

        if "compression_artifact" in self.active_anomalies:
            override_g = max(41.0, override_g - 65.0)
            flag = "COMPRESSION_ARTIFACT"

        if "out_of_range" in self.active_anomalies:
            override_g = 412.0
            flag = "OUT_OF_RANGE"

        if self.stale_lag_minutes > 0:
            flag = "STALE"

        return SensorReading(
            timestamp=ts,
            glucose_mg_dl=round(override_g, 1),
            heart_rate_bpm=base_reading.heart_rate_bpm,
            steps=base_reading.steps,
            sleep_state=base_reading.sleep_state,
            recent_carbs_g=base_reading.recent_carbs_g,
            active_insulin_units=base_reading.active_insulin_units,
            sensor_quality_flag=flag,
            is_synthetic=True,
        )

    def get_history_window(self, window_steps: int = HISTORY_WINDOW_STEPS) -> List[SensorReading]:
        """Returns the rolling historical slice up to current time (e.g. 72 steps = 6 hours)."""
        start_idx = max(0, self.current_step_index - window_steps + 1)
        slice_readings = self.full_telemetry[start_idx : self.current_step_index]
        
        # Add the current modified reading at the end
        history = list(slice_readings) + [self.get_latest_reading()]

        # If synthetic dropout anomaly injected, drop readings
        if self.synthetic_dropouts_count > 0 and len(history) > self.synthetic_dropouts_count:
            # Remove readings to simulate intermittent Bluetooth / RF dropout
            history = history[: -self.synthetic_dropouts_count] + [history[-1]]

        return history

    def inject_anomaly(self, anomaly_type: str):
        """Allows clinicians / evaluators to test safety triggers."""
        if anomaly_type == "stale_telemetry":
            self.stale_lag_minutes = 25
            if "stale_telemetry" not in self.active_anomalies:
                self.active_anomalies.append("stale_telemetry")
        elif anomaly_type == "compression_artifact":
            if "compression_artifact" not in self.active_anomalies:
                self.active_anomalies.append("compression_artifact")
        elif anomaly_type == "missing_packets":
            self.synthetic_dropouts_count = 8
            if "missing_packets" not in self.active_anomalies:
                self.active_anomalies.append("missing_packets")
        elif anomaly_type == "out_of_range":
            if "out_of_range" not in self.active_anomalies:
                self.active_anomalies.append("out_of_range")

    def clear_anomalies(self):
        """Clears all injected anomalies."""
        self.active_anomalies = []
        self.stale_lag_minutes = 0
        self.synthetic_dropouts_count = 0


class SimulationManager:
    """Singleton registry of virtual patient twin instances."""

    def __init__(self):
        self.twins: Dict[str, VirtualPatientTwin] = {}
        for p in PATIENT_PROFILES[:4]:  # Load initial 4 interactive clinical archetypes
            self.twins[p["id"]] = VirtualPatientTwin(p["id"])

    def get_twin(self, patient_id: str) -> VirtualPatientTwin:
        if patient_id not in self.twins:
            self.twins[patient_id] = VirtualPatientTwin(patient_id)
        return self.twins[patient_id]

    def reset_all(self):
        for twin in self.twins.values():
            twin.reset()


_SIMULATION_MANAGER = None


def get_simulation_manager() -> SimulationManager:
    global _SIMULATION_MANAGER
    if _SIMULATION_MANAGER is None:
        _SIMULATION_MANAGER = SimulationManager()
    return _SIMULATION_MANAGER
