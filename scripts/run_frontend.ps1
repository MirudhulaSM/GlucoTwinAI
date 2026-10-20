# Run GlucoTwin AI React + Vite Frontend Dev Server
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Starting GlucoTwin AI Vite Frontend on port 5173..." -ForegroundColor Cyan
Write-Host " React 19 + TypeScript + Tailwind CSS + Recharts" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\frontend"
npm run dev
