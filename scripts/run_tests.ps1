# Run Backend and Frontend Automated Tests
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [1/2] Running Backend Pytest Suite..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\.."
python -m pytest backend/tests -v

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend tests failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " [2/2] Running Frontend Vitest Suite..." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path "$PSScriptRoot\..\frontend"
npm test

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nAll Backend and Frontend Tests Passed Successfully!" -ForegroundColor Green
} else {
    Write-Host "`nFrontend tests encountered failures." -ForegroundColor Red
}
