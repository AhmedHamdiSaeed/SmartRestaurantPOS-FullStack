# PowerShell script to launch all backend microservices in separate windows

$baseDir = $PSScriptRoot

Write-Host "Starting Discovery Server (Eureka)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\discovery-server'; .\..\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 12

Write-Host "Starting API Gateway..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\api-gateway'; .\..\mvnw.cmd spring-boot:run"

Write-Host "Starting Auth Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\auth-service'; .\..\mvnw.cmd spring-boot:run"

Write-Host "Starting Order Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\order-service'; .\..\mvnw.cmd spring-boot:run"

Write-Host "Starting Product Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\product-service'; .\..\mvnw.cmd spring-boot:run"

Write-Host "Starting Kitchen Service..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$baseDir\backend\kitchen-service'; .\..\mvnw.cmd spring-boot:run"

Write-Host "`nAll Microservices launched in separate terminals!" -ForegroundColor Green
Write-Host "Eureka Dashboard: http://localhost:8761" -ForegroundColor Yellow
Write-Host "API Gateway:      http://localhost:8080" -ForegroundColor Yellow
