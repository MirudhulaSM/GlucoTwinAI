# Train and Evaluate GlucoTwin AI Scikit-Learn Model Pipeline
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Running Leak-Free ML Model Training & Held-Out Evaluation" -ForegroundColor Cyan
Write-Host " Evaluating on unseen patients PT-103 and PT-104" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\.."
python -m backend.app.ml.train
