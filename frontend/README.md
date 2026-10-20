# GlucoTwin AI

**Digital Twin Challenge 2026 | Healthcare Research Prototype**

GlucoTwin AI is a proof-of-concept healthcare digital twin that combines synthetic Electronic Health Record (EHR) profiles with continuous glucose monitoring (CGM) and wearable telemetry to estimate the risk of a future glycemic excursion.

The system uses a machine-learning model to estimate whether blood glucose will reach or exceed **180 mg/dL within the next 120 minutes**. It also provides an interactive What-If Lab for exploring hypothetical changes in physical activity, carbohydrate intake, and sleep, alongside sensor-quality monitoring and model explanations.

The project demonstrates how digital twin concepts, time-series data, machine learning, and interactive simulations can be combined in a healthcare research application.

> **Research prototype disclaimer:** GlucoTwin AI uses synthetic data and has not been clinically validated. It is not a medical device and must not be used for diagnosis, treatment decisions, insulin dosing, or medication recommendations. What-If results are hypothetical model outputs, not guaranteed physiological outcomes.

---
## Team Details
 Team Name: Magicians

 Team members and roles :
 1. Keerthana P (Team leader) - Machine Learning Engineer — Responsible for synthetic dataset preparation, feature engineering, model training, evaluation, and prediction pipeline development.
 2. Mirudhula S M - Full-Stack Developer — Responsible for frontend development, backend implementation, API integration, and connecting the application components.

 ## 3. College / incubator information
 College name : R.M.K. Engineering College
 Department : Computer Science and Engineering


## 4. Problem Statement

### Healthcare Problem

Glucose levels can change in response to meals, physical activity, sleep patterns, circadian rhythms, and individual patient characteristics. Identifying the possibility of a future glucose excursion from current and historical data is a challenging time-series prediction problem.

GlucoTwin AI explores how synthetic patient records and continuous sensor data can be combined to estimate the risk of glucose reaching a specified threshold within a future time window.

### Why Early Identification Matters

Estimating the risk of an upcoming glucose excursion may help researchers investigate patterns in glucose trends and understand how activity, carbohydrate intake, and sleep-related assumptions influence model predictions.

An interactive digital twin can also provide a controlled environment for testing hypothetical scenarios without changing a real patient's treatment or physiology.

### Limitations

- The current prototype uses synthetic patient profiles and generated telemetry rather than a clinically representative real-world patient cohort.
- Model performance on synthetic test data does not establish performance on real patients.
- The model estimates a defined two-hour excursion risk; this is not necessarily a continuous future glucose forecast.
- What-If scenarios depend on programmed assumptions and learned statistical associations. They do not establish causal clinical effects.
- The system is intended for research and demonstration, not independent clinical decision-making.

---

## 5. Healthcare Use Case

GlucoTwin AI demonstrates a virtual patient monitoring and simulation workflow using synthetic healthcare data.

### 5.1 Synthetic Patient Profiles and Telemetry

The application creates synthetic patient profiles containing selected demographic and health characteristics. It combines these profiles with simulated time-series data, including:

- Continuous glucose monitoring readings at five-minute intervals.
- Heart-rate measurements.
- Physical activity and step counts.
- Sleep-related telemetry.
- Selected EHR characteristics, such as diabetes type, HbA1c, and BMI.

These data support a controlled environment for exploring patient-state changes and testing the prediction workflow.

### 5.2 Two-Hour Glucose Excursion Risk Prediction

The machine-learning model estimates whether glucose will reach or exceed **180 mg/dL during the next 120 minutes**.

The output is a model-estimated risk based on the current feature vector. It is not a guarantee that an excursion will or will not occur.

### 5.3 Interactive What-If Scenario Exploration

The What-If Lab allows users to explore hypothetical changes to selected inputs, such as:

- Physical activity.
- Carbohydrate intake.
- Sleep-related assumptions.

The application compares the baseline model estimate with the scenario estimate and displays the change in predicted risk.

These comparisons are exploratory simulations and should not be interpreted as validated treatment recommendations or causal predictions.

### 5.4 Sensor-Quality Monitoring and Model Explanations

The application includes sensor-quality controls for exploring conditions such as stale readings, missing data, and compression-related artifacts, subject to the implemented checks.

The explainability panel displays model feature-importance or attribution information to help users inspect which input features influence the prediction. These explanations describe model behavior and do not establish biological causation.

---

## 6. Technical Stack

### Backend

- **Python 3.13** — backend and machine-learning implementation.
- **FastAPI** — API service for patient data, predictions, simulations, What-If scenarios, and model metrics.
- **pandas** — tabular data processing.
- **NumPy** — numerical operations.
- **scikit-learn** — preprocessing, model training, prediction, and evaluation.
- **Joblib** — loading and saving the fitted model artifact, where used.

### Frontend

- **React 19** — interactive user interface.
- **TypeScript** — frontend type safety.
- **Vite** — development server and production build tooling.
- **Tailwind CSS** — interface styling.
- **Recharts** — time-series charts and data visualizations.
- **Lucide** — interface icons, where used.

The application uses a Python API backend and a React-based frontend. Confirm the package files in the repository for exact dependency versions and any additional libraries.

---

## 7. AI/ML Model Details

### Model Architecture

The prediction pipeline uses a fitted scikit-learn pipeline consisting of:

1. `StandardScaler` for feature scaling.
2. `GradientBoostingClassifier` for binary classification.

The fitted model is saved as `glucotwin_model.joblib`.

### Prediction Objective

The target is whether the maximum glucose value during the next 120 minutes reaches or exceeds 180 mg/dL.

\[
Y_t =
\begin{cases}
1, & \text{if future maximum glucose} \geq 180\text{ mg/dL}\\
0, & \text{otherwise}
\end{cases}
\]

The target uses the subsequent glucose observations, while inference is intended to use only features available at the prediction timestamp.

### Patient-Level Training and Testing

The synthetic cohort is partitioned by patient rather than randomly splitting individual time-series rows:

- **Training cohort:** 10 synthetic patients, 19,920 samples.
- **Held-out test cohort:** PT-103 and PT-104, 3,984 samples.
- **Patient overlap:** 0% between the stated training and test cohorts.

This design tests performance on two held-out synthetic patient profiles. It does not demonstrate generalization across a broad real-world clinical population.

### Evaluation Metrics

| Metric | Reported result |
|---|---:|
| ROC-AUC | 0.9529 |
| Precision | 0.9311 |
| Recall | 0.7184 |
| F1 score | 0.8110 |
| Brier score | 0.0475 |

These are the project's reported evaluation results and should be checked against the current saved metrics before submission.

### Interpretation and Limitations

The results describe model performance on the synthetic held-out test set. Repeated time-series samples from only two test patients are not equivalent to evaluation on a large independent clinical cohort.

Synthetic data generation assumptions may influence both the learned patterns and the evaluation scores. These metrics therefore must not be interpreted as evidence of clinical effectiveness or readiness for patient care.

---

## Open-Source License

This project includes a [`LICENSE`](LICENSE) file in the repository root.

**License:** Confirm the exact license name and terms from that file before publishing this section. The presence of a license file alone does not establish which license applies.


## 8. Architecture diagram
## System Architecture

The following diagram illustrates the GlucoTwin AI system architecture, including synthetic data generation, the virtual patient twin, feature engineering, machine learning, the What-If Lab, the FastAPI backend, and the React dashboard.

## System Architecture

![GlucoTwin AI System Architecture](docs/architecture.png)

[View Architecture Diagram (PDF)](docs/architecture.pdf)

**Note:** GlucoTwin AI is a research prototype using synthetic data. It is not clinically validated and is not intended for medical diagnosis or treatment decisions.


# React + TypeScript + Vite


This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
