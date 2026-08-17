# PowerShell script to launch Angular frontend

$baseDir = $PSScriptRoot
Set-Location "$baseDir\frontend"

Write-Host "Installing dependencies (if needed)..." -ForegroundColor Cyan
npm install

Write-Host "`nStarting Angular Frontend..." -ForegroundColor Green
npm start
