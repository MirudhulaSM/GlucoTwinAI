# GlucoTwin AI - Live Demonstration Walkthrough Guide

> **Digital Twin Challenge 2026**  
> *Step-by-Step Evaluator & Clinician Protocol for Assessing the Working Research Prototype.*

---

## 1. Quickstart & Launch Instructions

Open Windows PowerShell in the project root `d:\Projects\GlucoTwinAI`:

```powershell
# Option A: One-click launch of both Backend & Frontend in separate windows
.\scripts\run_all.ps1

# Option B: Run services individually
# Terminal 1 (Backend):
.\scripts\run_backend.ps1

# Terminal 2 (Frontend):
.\scripts\run_frontend.ps1
```

- **Frontend Application:** Open your browser at [http://localhost:5173/](http://localhost:5173/)
- **FastAPI Documentation & Swagger UI:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Automated Test Suite:** `.\scripts\run_tests.ps1`

---

## 2. Walkthrough Protocol

### Step 1: Clinician Command Center & Synthetic EHR Profile
1. Note the **Clinical Disclaimer Banner** at the top indicating that all data is synthetic for the Digital Twin Challenge 2026.
2. The active digital twin defaults to **PT-101 (Elena Rostova)**, a 42-year-old female with Brittle Type 1 Diabetes, HbA1c 8.4%, on Continuous Subcutaneous Insulin Infusion (CSII) and CGM.
3. Review the **Vitals Quick Bar**:
   - Current CGM Glucose (e.g., ~155 mg/dL)
   - CGM Trend Arrow & 15-minute Rate of Change (e.g., `+0.45 mg/dL/min`)
   - Resting Heart Rate & Vagal Tone status
   - Physical Activity steps in the last 5 minutes
   - Sleep / Circadian State and Active Insulin units
   - Telemetry Reliability Score (100% Optimal)

---

### Step 2: Continuous Glycemic Stream & 2-Hour Forecast Corridor
1. Inspect the main **Continuous Glycemic Stream & 2-Hour Forecast Corridor** chart:
   - Green shaded corridor: ADA target range (70–180 mg/dL).
   - Red dashed line: Documented high-glucose excursion threshold at **180 mg/dL**.
   - Blue dashed line: Hypoglycemia threshold at **70 mg/dL**.
   - Solid teal line: Observed historical CGM curve (last 6 hours).
   - Dashed teal curve: Projected 2-hour median trajectory with 80% confidence corridor.
2. Toggle the chart view to **"Heart Rate & Steps"** to inspect autonomic and physical activity dynamics.
3. Switch time windows between **3h**, **6h**, and **12h**.

---

### Step 3: Interactive Simulation Controls (Advancing Time)
1. Click the **"+15m"** button in the header:
   - Notice the simulation clock advances by 15 minutes.
   - The virtual twin updates with a new telemetry reading.
   - The 2-hour excursion prediction recalculates immediately.
2. Click the **"+30m"** button to jump forward.
3. Click the **Play button (▶)** to enable continuous autonomous playback:
   - The virtual twin advances by 5 minutes every 3.5 seconds.
   - Watch the CGM curve extend dynamically.
4. Click **Pause (⏸)** and then the **Reset (↺)** button to return to the initial simulation baseline.

---

### Step 4: The What-If Counterfactual Lab (Core Innovation)
Scroll to the **What-If Counterfactual Lab** panel at the bottom:

#### Experiment A: Mitigating Excursion Risk with Physical Activity
1. Under *Hypothetical Physical Activity*, select **"Brisk Cardio (30m)"** or adjust the duration slider to 30 minutes.
2. Keep *Hypothetical Meal* at **"Fasting / None (0g)"**.
3. Keep *Sleep & Circadian* at **"Standard Normal (6-7h)"**.
4. Click **"Recalculate In Silico Scenario"**:
   - Review the **Counterfactual Comparison Result** card.
   - Notice the **Absolute Risk Difference ($\Delta$ Risk)**: displays a substantial negative reduction (e.g. `-28% Risk Reduction`).
   - Observe the purple dashed counterfactual curve overlaid onto the CGM chart, showing the projected glucose-lowering impact of exercise.
   - Review the physiological drivers listed below the comparison.

#### Experiment B: Simulating a High-Carbohydrate Meal Challenge
1. Under *Hypothetical Meal*, select **"High Carb Meal (85g)"**.
2. Select *Hypothetical Activity* as **"Sedentary (0m)"**.
3. Under *Sleep*, select **"Sleep Deficit (4h, Cortisol)"**.
4. Click **"Recalculate In Silico Scenario"**:
   - Notice the Absolute Risk Difference shifts to positive (e.g. `+36% Risk Elevation`).
   - The purple counterfactual trajectory shows a sharp postprandial spike crossing the 180 mg/dL threshold line.
5. Click **"Reset to Baseline"** to clear the scenario overlay.

---

### Step 5: Explainability Panel (Feature Attributions)
1. Examine the **Supported Model Feature Attributions** panel.
2. Observe the directional waterfall bars:
   - Red bars: Factors elevating excursion risk (e.g., current glucose proximity to 180, rising 15-min velocity, recent meal carbs).
   - Teal bars: Factors mitigating excursion risk (e.g., recent physical activity steps, prior time-in-range adherence).
3. Confirm that each feature includes transparent clinical context directly from the fitted Gradient Boosting tree weights.

---

### Step 6: Testing Sensor Faults & Safety Safeguards
1. In the header, click the **Alert Octagon (Anomaly Testing)** button.
2. Select **"Lag / Stale Sensor (>25 min delay)"**:
   - Observe the Telemetry Quality card update immediately to **"Degraded"**.
   - Notice the Freshness indicator turns to **"STALE"**.
   - The 2-Hour Risk Score Gauge displays a warning alert: *"Confidence Attenuated: Telemetry quality is degraded or stale."*
3. Select **"Pressure Compression Drop (-65 mg/dL)"** to simulate nocturnal sensor compression.
4. Click **"Clear All Sensor Anomalies"** to restore clean telemetry.

---

### Step 7: Inspecting the Empirical Model Validation Modal
1. In the header, click the **"Held-Out Validation"** button with the award icon.
2. Review the comprehensive evaluation dialog:
   - **Zero-Leakage Methodology:** Explains that test patients `PT-103` and `PT-104` were held out with zero patient overlap.
   - **Sample Breakdown:** 19,920 train samples vs 3,984 unseen held-out test samples.
   - **Genuine Metrics:**
     - ROC-AUC: **`0.9529`**
     - Precision: **`0.9311`**
     - Recall: **`0.7184`**
     - F1 Score: **`0.8110`**
     - Brier Calibration Score: **`0.0475`**
   - **Full Confusion Matrix:** TN = 3,251, FP = 37, FN = 196, TP = 500.
   - **Top 8 Feature Importances:** Active Insulin proxy, Current Glucose, Circadian Sine component, Recent Carbs, 1-Hour Mean Glucose.
3. Close the modal.

---

### Step 8: Switching Between Patient Archetypes
1. Open the **Patient Selector** dropdown in the header.
2. Switch to **PT-102 (Marcus Vance)**: T2D with elevated insulin resistance and dawn phenomenon.
3. Switch to **PT-103 (Aria Chen)**: Athletic T1D with rapid exercise uptake.
4. Switch to **PT-104 (David Okafor)**: Shift worker with circadian disruption and erratic meal timing.
5. Notice how each virtual twin exhibits distinct baseline glucose dynamics and risk profiles.

---

## 3. Automated Test Verification

Run the complete test suite from PowerShell:

```powershell
.\scripts\run_tests.ps1
```

- **Backend Pytest Results:** 15 passed in ~5.6s (leak-free feature extraction, model inference, reproducibility, API routes).
- **Frontend Vitest Results:** 5 component tests passed in ~0.2s (disclaimer rendering, EHR card, vitals quick bar, risk gauge, what-if lab).
