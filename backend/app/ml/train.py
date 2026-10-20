"""Model Training and Leak-Free Evaluation Pipeline for GlucoTwin AI.
Trains a scikit-learn classifier on synthetic physiological telemetry.
Evaluates on strictly held-out patients to prevent patient-level data leakage.
Saves model artifacts and genuine metrics to disk.

RESEARCH PROTOTYPE ONLY - ALL DATA IS SYNTHETIC.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.metrics import (
    brier_score_loss,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from backend.app.config import (
    DAYS_OF_DATA_PER_PATIENT,
    MODELS_DIR,
    RANDOM_SEED,
    RESEARCH_DISCLAIMER,
)
from backend.app.data.generator import (
    PATIENT_PROFILES,
    generate_patient_telemetry,
    get_patient_ehr,
)
from backend.app.ml.features import (
    FEATURE_COLUMNS,
    FEATURE_LABELS,
    build_patient_dataset,
)


def run_training_and_evaluation() -> Dict[str, Any]:
    print("=" * 70)
    print(" GlucoTwin AI - ML Training & Held-Out Evaluation Pipeline")
    print(" Research Prototype | Digital Twin Challenge 2026")
    print("=" * 70)

    # 1. Generate multi-patient synthetic cohort
    print("\n[1/5] Generating synthetic multi-patient cohort telemetry...")
    patient_ids = [p["id"] for p in PATIENT_PROFILES]
    all_x = []
    all_y = []

    for pid in patient_ids:
        ehr = get_patient_ehr(pid)
        telemetry = generate_patient_telemetry(pid, days=DAYS_OF_DATA_PER_PATIENT)
        df_x, s_y = build_patient_dataset(telemetry, ehr, step_stride=2)
        all_x.append(df_x)
        all_y.append(s_y)
        pos_rate = s_y.mean() * 100
        print(f"  - Patient {pid} ({ehr.archetype[:35]}...): {len(df_x)} samples, {pos_rate:.1f}% excursion rate")

    full_x = pd.concat(all_x, ignore_index=True)
    full_y = pd.concat(all_y, ignore_index=True)

    print(f"\nTotal synthetic dataset: {len(full_x)} samples across {len(patient_ids)} patients.")

    # 2. Strict Group-based Train/Held-Out Test Split (by Patient ID to prevent leakage!)
    # Hold out PT-103 (Athletic T1D) and PT-104 (Shift worker T2D) to test generalization across phenotypes
    test_patient_ids = ["PT-103", "PT-104"]
    train_patient_ids = [pid for pid in patient_ids if pid not in test_patient_ids]

    train_mask = full_x["patient_id"].isin(train_patient_ids)
    test_mask = full_x["patient_id"].isin(test_patient_ids)

    x_train = full_x.loc[train_mask, FEATURE_COLUMNS]
    y_train = full_y.loc[train_mask]
    x_test = full_x.loc[test_mask, FEATURE_COLUMNS]
    y_test = full_y.loc[test_mask]

    print(f"\n[2/5] Patient-Grouped Held-Out Split:")
    print(f"  - Train Cohort ({len(train_patient_ids)} patients): {len(x_train)} samples")
    print(f"  - Test Cohort ({len(test_patient_ids)} patients: {test_patient_ids}): {len(x_test)} samples")
    print(f"  - Train positive class balance: {y_train.mean()*100:.2f}%")
    print(f"  - Test positive class balance: {y_test.mean()*100:.2f}%")

    # 3. Fit Model Pipeline
    print("\n[3/5] Fitting Scikit-Learn Pipeline (StandardScaler + GradientBoostingClassifier)...")
    clf = GradientBoostingClassifier(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        random_state=RANDOM_SEED,
    )
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("classifier", clf),
    ])

    pipeline.fit(x_train, y_train)
    print("  Pipeline fitted successfully.")

    # 4. Rigorous Evaluation on Unseen Held-Out Test Patients
    print("\n[4/5] Evaluating on Unseen Held-Out Test Patients...")
    y_pred_proba = pipeline.predict_proba(x_test)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    # ROC-AUC with safeguard
    if len(np.unique(y_test)) > 1:
        roc_auc = float(roc_auc_score(y_test, y_pred_proba))
    else:
        roc_auc = 0.5

    precision = float(precision_score(y_test, y_pred, zero_division=0))
    recall = float(recall_score(y_test, y_pred, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, zero_division=0))
    brier = float(brier_score_loss(y_test, y_pred_proba))
    cm = confusion_matrix(y_test, y_pred).tolist()

    # Feature importances
    importances = clf.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_dict = {
        FEATURE_COLUMNS[i]: round(float(importances[i]), 4)
        for i in sorted_idx
    }

    metrics = {
        "model_name": "StandardScaler + GradientBoostingClassifier",
        "split_method": "Patient-Grouped Held-Out (Zero Patient Overlap)",
        "train_patient_ids": train_patient_ids,
        "test_patient_ids": test_patient_ids,
        "train_sample_count": int(len(x_train)),
        "test_sample_count": int(len(x_test)),
        "class_balance": {
            "train_positive_rate": round(float(y_train.mean()), 4),
            "test_positive_rate": round(float(y_test.mean()), 4),
        },
        "roc_auc": round(roc_auc, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "brier_score": round(brier, 4),
        "confusion_matrix": cm,
        "feature_importances": feature_importance_dict,
        "trained_at": datetime.now().isoformat(),
        "disclaimer": RESEARCH_DISCLAIMER,
    }

    print("\n--- Held-Out Test Evaluation Results ---")
    print(f"  ROC-AUC Score:      {metrics['roc_auc']:.4f}")
    print(f"  Precision (>=0.5):  {metrics['precision']:.4f}")
    print(f"  Recall (>=0.5):     {metrics['recall']:.4f}")
    print(f"  F1 Score:           {metrics['f1_score']:.4f}")
    print(f"  Brier Calibration:  {metrics['brier_score']:.4f}")
    print(f"  Confusion Matrix:   TN={cm[0][0]}, FP={cm[0][1]}, FN={cm[1][0]}, TP={cm[1][1]}")
    print("\nTop 5 Predictive Features:")
    for feat, imp in list(feature_importance_dict.items())[:5]:
        print(f"  - {FEATURE_LABELS.get(feat, feat)}: {imp:.4f}")

    # 5. Save Artifacts
    print("\n[5/5] Saving model and metadata artifacts...")
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    model_path = MODELS_DIR / "glucotwin_model.joblib"
    metrics_path = MODELS_DIR / "metrics.json"
    metadata_path = MODELS_DIR / "pipeline_metadata.json"

    joblib.dump(pipeline, model_path)

    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    with open(metadata_path, "w") as f:
        json.dump(
            {
                "feature_columns": FEATURE_COLUMNS,
                "feature_labels": FEATURE_LABELS,
                "target": "Max glucose in next 120 minutes >= 180.0 mg/dL",
                "sample_interval_minutes": 5,
                "horizon_minutes": 120,
                "model_type": "GradientBoostingClassifier",
                "disclaimer": RESEARCH_DISCLAIMER,
            },
            f,
            indent=2,
        )

    print(f"  Model saved to: {model_path}")
    print(f"  Metrics saved to: {metrics_path}")
    print(f"  Metadata saved to: {metadata_path}")
    print("Pipeline training completed successfully!\n")
    return metrics


if __name__ == "__main__":
    run_training_and_evaluation()
