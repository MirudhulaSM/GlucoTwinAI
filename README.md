# GlucoTwin AI

**A Healthcare Digital Twin Proof of Concept for the Digital Twin Challenge 2026**  
*Fusing longitudinal Electronic Health Records (EHR) with high-frequency wearable telemetry (CGM, heart rate, steps, sleep) for 2-hour glycemic excursion forecasting and in silico counterfactual What-If experimentation.*

---

> [!IMPORTANT]
> **RESEARCH PROTOTYPE DISCLAIMER (NOT A MEDICAL DEVICE):**  
> GlucoTwin AI is an experimental proof-of-concept research prototype developed for the Digital Twin Challenge 2026. All included patient records, EHR demographics, CGM traces, and wearable biometrics are **100% synthetically generated** and clearly labeled. This system is **NOT** FDA-cleared, CE-marked, or clinically validated, and is **NOT** intended for clinical diagnosis, real-world treatment planning, or medication/insulin dosage adjustments. What-If scenarios reflect model-based statistical associations, not causal treatment effects or medical advice.

---

## Key Highlights

- **Predictive Target Definition:** Predicts whether blood glucose crosses a documented high-glucose threshold ($\ge 180.0$ mg/dL) within the prospective **2 hours (120 minutes)** using 5-minute sampling intervals.
- **Strict Causal Feature Engineering:** Zero future data leakage. Feature representations strictly isolate backwards-looking sliding windows (velocities $dG/dt$, acceleration $d^2G/dt^2$, 2-hour moments $\mu, \sigma, \min, \max$, TIR 70–180 mg/dL, wearable step/HR integrals, and circadian encodings).
- **Out-of-Patient Held-Out Validation:** Evaluated on strictly unseen held-out patients (`PT-103` Athletic T1D and `PT-104` Shift Worker T2D, 3,984 test samples) with zero patient overlap:
  - **ROC-AUC:** `0.9529`
  - **Precision:** `0.9311`
  - **Recall:** `0.7184`
  - **F1 Score:** `0.8110`
  - **Brier Calibration Score:** `0.0475`
  - **Confusion Matrix:** TN=3,251, FP=37, FN=196, TP=500.
  - *No fabricated metrics, fully reproducible pipeline.*
- **Differentiating Feature — The What-If Lab:** In silico counterfactual engine enabling clinicians to adjust hypothetical physical activity, carbohydrate meal intake, and sleep debt/stress within physiological bounds. Calculates the **Absolute Risk Difference ($\Delta$ Risk)** and projects comparative counterfactual corridors.
- **Data Quality & Sensor Safety Gate:** Real-time monitoring for stale telemetry lag (>15m), missing Bluetooth packets, physiological out-of-range sensor spikes (<40 or >400 mg/dL), and nocturnal pressure-induced sensor attenuation (compression artifacts). Automatically attenuates model confidence when telemetry is degraded.
- **Transparent Explainability:** Displays supported tree-based gradient feature attributions (positive/negative waterfall weights) with clinically meaningful narratives.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts |
| **Backend API** | Python 3.13, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | scikit-learn (`StandardScaler` + `GradientBoostingClassifier`), pandas, NumPy, joblib |
| **Automated Testing**| pytest (Backend integration & unit tests), Vitest (Frontend component tests) |
| **Scripting** | Windows PowerShell automation (`.ps1` scripts) |

---

## Quickstart & Launch Guide (Windows PowerShell)

### 1. Prerequisites
Ensure you have **Python 3.11+** and **Node.js v20+** installed.

### 2. Install Dependencies
```powershell
# In repository root:
python -m pip install -r backend/requirements.txt

# In frontend directory:
Set-Location -Path frontend
npm install
Set-Location -Path ..
```

### 3. Model Training & Artifact Generation
To retrain the scikit-learn model and generate held-out evaluation artifacts:
```powershell
.\scripts\train_model.ps1
# Or directly:
python -m backend.app.ml.train
```
Fitted model artifacts are saved to `backend/artifacts/models/`:
- `glucotwin_model.joblib`: Fitted pipeline
- `metrics.json`: Held-out empirical performance metrics
- `pipeline_metadata.json`: Feature definitions and targets

### 4. Run Both Servers
```powershell
# One-click launch in separate PowerShell windows:
.\scripts\run_all.ps1
```
Or launch individually:
```powershell
# Terminal 1 - Backend FastAPI Server:
.\scripts\run_backend.ps1

# Terminal 2 - Frontend Vite Dev Server:
.\scripts\run_frontend.ps1
```

- **Frontend URL:** [http://localhost:5173/](http://localhost:5173/)
- **Backend API & Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Healthcheck:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## Automated Test Suite

Run the full automated test suite (backend pytest + frontend vitest):
```powershell
.\scripts\run_tests.ps1
```

### Backend Tests (`python -m pytest backend/tests -v`)
- `test_generator.py`: Verifies synthetic EHR profiles, physiological bounds, reproducibility, and synthetic labeling.
- `test_ml_pipeline.py`: Verifies zero future data leakage during feature extraction, model inference shape, What-If counterfactual response, and data quality triggers.
- `test_api.py`: Tests all FastAPI endpoints (`/api/health`, `/api/patients`, `/api/predict`, `/api/whatif/simulate`, `/api/simulation/step`, `/api/metrics`).
- **Result:** **15 passed** in ~5.6s.

### Frontend Tests (`npm test` in `frontend/`)
- `dashboard.test.tsx`: Verifies Clinical Disclaimer Banner, Patient EHR Card, Vitals Quick Bar, 2-Hour Risk Score Gauge, and What-If Lab controls and non-causal disclosures.
- **Result:** **5 passed** in ~0.2s.

---

## Interactive Feature Guide

### 1. Active Patient Archetypes
Select among four distinct virtual twins in the header:
- **PT-101 (Elena Rostova):** Brittle Type 1 Diabetes, high glycemic variability, HbA1c 8.4%, CSII insulin pump + CGM.
- **PT-102 (Marcus Vance):** Type 2 Diabetes, elevated insulin resistance, dawn phenomenon, HbA1c 7.6%, Metformin + Semaglutide.
- **PT-103 (Aria Chen):** Active Athlete Type 1 Diabetes, tight control, exercise-induced hypoglycemia/rebound risk. *(Held-out test patient)*
- **PT-104 (David Okafor):** Rotating Shift Worker Type 2 Diabetes, circadian sleep fragmentation, irregular meals. *(Held-out test patient)*

### 2. Time Machine & Simulation Controls
- Click **"+5m"**, **"+15m"**, or **"+30m"** to advance the simulation clock.
- Click **Play (▶)** to enable continuous auto-simulation (advances 5 min every 3.5s).
- Click **Reset (↺)** to return the virtual twin to its baseline starting state.

### 3. The What-If Counterfactual Lab
1. Select a hypothetical physical activity (e.g., *Brisk Cardio 30m*).
2. Select a hypothetical meal load (e.g., *High Carb Meal 85g*).
3. Select a sleep architecture modifier (e.g., *Sleep Deficit 4h*).
4. Click **"Recalculate In Silico Scenario"**:
   - Compares Baseline Risk vs Scenario Risk side-by-side.
   - Calculates **Absolute Risk Difference ($\Delta$ Risk)** (e.g., `-28% Risk Reduction` or `+36% Risk Elevation`).
   - Overlays the purple counterfactual projected trajectory directly onto the continuous CGM chart.

### 4. Sensor Quality & Safety Gate Testing
In the header, click the **Alert Octagon** to inject real-time faults:
- **Lag / Stale Sensor (>25m lag)**
- **Pressure Compression Drop (-65 mg/dL during sleep)**
- **Bluetooth Dropout (missing packets)**
- **Out-of-Range Sensor Spike (412 mg/dL)**
Observe how the Telemetry Quality Score drops and the model automatically attenuates its reported confidence score with prominent warnings.

### 5. Held-Out Validation Report Modal
Click the **"Held-Out Validation"** button in the header to view the complete scikit-learn evaluation metrics, confusion matrix, ROC-AUC score, and zero-leakage patient-split details.

---

## Backend API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Service healthcheck and research disclaimer |
| `/api/patients` | `GET` | List available virtual patient twin EHR records |
| `/api/patients/{id}` | `GET` | Full patient EHR profile and clinical history |
| `/api/patients/{id}/telemetry` | `GET` | Rolling historical telemetry window & vitals |
| `/api/predict/{id}` | `GET` | 2-hour excursion risk %, forecast curve & feature contributions |
| `/api/whatif/simulate` | `POST` | In silico counterfactual scenario evaluation ($\Delta$ Risk) |
| `/api/simulation/{id}/step` | `POST` | Advance virtual twin clock by $N$ minutes |
| `/api/simulation/{id}/reset` | `POST` | Reset virtual twin clock and clear anomalies |
| `/api/simulation/{id}/anomaly` | `POST` | Inject synthetic sensor fault for safety testing |
| `/api/simulation/{id}/clear-anomalies` | `POST` | Clear active anomalies |
| `/api/metrics` | `GET` | Model evaluation report on held-out test cohort |

---

## Documentation Deliverables

[View Architecture Diagram (PDF)](docs/architecture.pdf)

- [ARCHITECTURE.md](ARCHITECTURE.md): Detailed system architecture, data flow, Mermaid diagrams, and mathematical formulation.
- [PRESENTATION.md](PRESENTATION.md): Pitch outline and slide deck narrative for the Digital Twin Challenge 2026.
- [DEMO_WALKTHROUGH.md](DEMO_WALKTHROUGH.md): Step-by-step evaluator and clinician demonstration protocol.
- [LICENSE](LICENSE): Open-source MIT License with clinical research disclaimer.

---

## Reproducibility & Seed Integrity
All synthetic generation routines, train/test cohort splits, and model estimators utilize `RANDOM_SEED = 2026` defined in `backend/app/config.py`. All outputs are completely reproducible across environments.
