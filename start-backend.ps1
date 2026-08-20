# ============================================================
# SmartRestaurantPOS — Start Backend Microservices Only
# ============================================================
# Run from the project root:  .\start-backend.ps1
# ============================================================

$baseDir = $PSScriptRoot

Write-Host ""
Write-Host "Starting SmartPOS Backend Microservices..." -ForegroundColor Cyan
Write-Host ""

# Discovery Server must start first — wait longer for Eureka to be ready
Write-Host "  [1/8] Starting Discovery Server (Eureka)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\discovery-server'; Write-Host '▶ Eureka :8761' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 18

Write-Host "  [2/8] Starting API Gateway..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\api-gateway'; Write-Host '▶ Gateway :8080' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [3/8] Starting Auth Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\auth-service'; Write-Host '▶ Auth :8081' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [4/8] Starting Order Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\order-service'; Write-Host '▶ Order :8082' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [5/8] Starting Product Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\product-service'; Write-Host '▶ Product :8083' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [6/8] Starting Kitchen Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\kitchen-service'; Write-Host '▶ Kitchen :8084' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [7/8] Starting AI Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\ai-service'; Write-Host '▶ AI :8085' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 3

Write-Host "  [8/8] Starting Notification Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\backend\notification-service'; Write-Host '▶ Notification :8086' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"

Write-Host ""
Write-Host "  ✔ All 8 backend services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  Eureka Dashboard : http://localhost:8761" -ForegroundColor White
Write-Host "  API Gateway      : http://localhost:8080" -ForegroundColor White
Write-Host "  Auth Swagger     : http://localhost:8081/swagger-ui.html" -ForegroundColor White
Write-Host ""
