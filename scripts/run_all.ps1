# Launch both backend and frontend concurrently in separate PowerShell windows
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Launching GlucoTwin AI Full Stack Solution" -ForegroundColor Cyan
Write-Host " Digital Twin Challenge 2026" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$backendScript = Join-Path $PSScriptRoot "run_backend.ps1"
$frontendScript = Join-Path $PSScriptRoot "run_frontend.ps1"

Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File `"$backendScript`""
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy Bypass", "-File `"$frontendScript`""

Write-Host "Backend running at:  http://localhost:8000" -ForegroundColor Green
Write-Host "Frontend running at: http://localhost:5173" -ForegroundColor Green
Write-Host "API Documentation:   http://localhost:8000/docs" -ForegroundColor Green
