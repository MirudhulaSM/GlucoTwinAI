# GlucoTwin AI | Digital Twin Challenge 2026 Presentation

> **Presentation Deck Outline & Pitch Script**  
> *Target Audience: Clinical Investigators, Digital Twin Challenge Judges, Biomedical Informaticians, and Health Technology Reviewers.*

---

## Slide 1: Title & The Vision
- **Title:** GlucoTwin AI: Continuous In Silico Digital Twin for Prospective 2-Hour Glycemic Excursion Risk
- **Subtitle:** Fusing Electronic Health Records with Multimodal Wearable Telemetry for Counterfactual What-If Exploration
- **Team / Lead:** Lead Full-Stack & ML Engineering Team
- **Tagline:** Moving from *Reactive Glucose Monitoring* to *Prospective Counterfactual Digital Twin Simulation*.
- **Mandatory Research Disclaimer:** Research Proof-of-Concept Prototype. All clinical profiles and telemetry are synthetically generated for the Digital Twin Challenge 2026. Not a medical device.

---

## Slide 2: The Clinical Problem
- **CGM is Reactive, Not Prospective:** Modern Continuous Glucose Monitors alert patients *after* glucose is already crossing out-of-range thresholds, leaving a narrow, stressful window for intervention.
- **Multimodal Telemetry is Siloed:** Electronic Health Records (longitudinal disease history, HbA1c, baseline insulin/metformin) are detached from continuous smart watch telemetry (heart rate, physical activity steps, sleep stages).
- **The "What-If" Blindspot:** Patients and clinicians routinely ask: *"If I take a 25-minute brisk walk after lunch, or if I eat this 60g meal now, how does my prospective risk change?"* Existing tools cannot model alternative hypothetical futures in silico.

---

## Slide 3: The Solution - GlucoTwin AI Architecture
- **Multimodal State Fusion:** Combines patient static EHR vectors (HbA1c, diabetes duration, BMI) with continuous 5-minute dynamic streams (CGM, heart rate, step accumulation, sleep architecture).
- **Precise 2-Hour Excursion Horizon:** Predicts prospective crossing of documented high-glucose threshold ($\ge 180.0$ mg/dL) over the next 120 minutes ($t \to t+120\text{m}$).
- **The Core Differentiator - What-If Lab:** In silico counterfactual engine allowing clinicians to modulate activity, meal boluses, and sleep quality, producing instant side-by-side risk differentials ($\Delta$ Risk) and comparative projected corridors.

---

## Slide 4: Machine Learning Rigor & Zero Data Leakage
- **Causal Feature Engineering:** Feature vectors strictly isolate backwards-looking sliding windows (0 future lookahead, strict causal isolation).
- **Patient-Grouped Held-Out Partitioning:**
  - 12 synthetic patients generated with distinct phenotypes (Brittle T1D, Insulin-Resistant T2D, Athletic T1D, Shift Worker).
  - Model trained on 10 cohort patients (19,920 samples).
  - Evaluated on **strictly unseen held-out patients PT-103 (Athletic T1D) and PT-104 (Shift Worker T2D)** (3,984 samples).
  - Zero patient overlap ensures real-world phenotypic generalization.
- **Empirical Held-Out Validation Performance:**
  - **ROC-AUC:** `0.9529`
  - **Precision:** `0.9311`
  - **Recall:** `0.7184`
  - **F1 Score:** `0.8110`
  - **Brier Calibration Score:** `0.0475`
  - *No fabricated metrics, fully reproducible pipeline.*

---

## Slide 5: Clinician Command Center Demo
- **Live Telemetry Stream:** Interactive Recharts display of 6–12 hour continuous CGM with reference target corridor (70–180 mg/dL) and high-threshold line.
- **2-Hour Prospective Corridor:** Displays projected median path and 80% confidence interval band.
- **Risk Score Gauge:** Animated meter classifying risk into Low (<20%), Moderate (20-50%), High (50-80%), or Critical (>80%).
- **Interactive Time Machine:** Step forward +5m, +15m, +30m or toggle continuous auto-simulation to observe twin dynamics in real time.

---

## Slide 6: The What-If Counterfactual Laboratory
- **In Silico Scenario Modeling:**
  - **Activity:** Sedentary vs Light Walk (20m) vs Brisk Cardio (30m) vs HIIT (45m).
  - **Nutrition:** Fasting (0g) vs Snack (20g) vs Standard Meal (50g) vs High-Carb (85g).
  - **Circadian / Sleep:** Restorative 8h sleep vs Sleep Debt (4h, Cortisol rise) vs Shift Disruption.
- **Clear Comparative Metrics:**
  - Baseline Risk (e.g. 74%) vs Scenario Risk (e.g. 46%).
  - **Absolute Risk Difference ($\Delta$ Risk):** `-28% Absolute Risk Reduction`.
  - Counterfactual trajectory overlay plotted directly onto the CGM chart.
- **Safety Boundary:** Strict disclosure that counterfactuals are model-based statistical associations, not causal treatment effects. Explicit prohibition against medication adjustments.

---

## Slide 7: Explainability & Safety Guardrails
- **Supported Feature Attributions:** Transparent tree-based gradient importances decomposing the top factors elevating or mitigating excursion risk.
- **Data Quality & Anomaly Engine:**
  - Detects stale telemetry (>15 min lag), sensor dropouts, out-of-range sensor spikes, and pressure compression artifacts during sleep.
  - Automatically attenuates model confidence score when telemetry degrades.
  - Interactive fault injection controls allow clinicians to test system safety triggers.

---

## Slide 8: Technical Implementation Stack
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend:** Python 3.13, FastAPI, pandas, NumPy, scikit-learn, joblib.
- **Testing:** 15 automated pytest integration/unit tests + 5 Vitest frontend component tests.
- **Deployment & Scripting:** Standalone PowerShell automation (`run_all.ps1`, `run_backend.ps1`, `run_frontend.ps1`, `train_model.ps1`, `run_tests.ps1`).

---

## Slide 9: Summary & Future Roadmap
- **Key Takeaways:**
  1. Proven digital twin architecture uniting EHR and time-series telemetry.
  2. Rigorous leak-free machine learning with out-of-patient generalization.
  3. Actionable in silico What-If experimentation with transparent explainability.
- **Future Translation Steps:**
  - Ingestion of real IRB-approved Dexcom/Abbott anonymized research datasets.
  - Neural ordinary differential equations (Neural ODEs) for continuous physiological modeling.
  - Closed-loop integration with automated insulin delivery simulators.
- **Closing Statement:** GlucoTwin AI demonstrates how patient digital twins can empower clinicians and patients with prospective foresight and safe in silico experimentation.
