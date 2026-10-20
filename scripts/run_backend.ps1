# Run GlucoTwin AI FastAPI Backend Server
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting GlucoTwin AI FastAPI Backend on port 8000..." -ForegroundColor Cyan
Write-Host " Research Prototype | Digital Twin Challenge 2026" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
