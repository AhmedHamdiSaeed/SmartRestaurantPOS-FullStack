# ============================================================
# SmartRestaurantPOS - Start Backend Microservices Only
# ============================================================
# Run from the project root:  .\start-backend.ps1
# ============================================================

$baseDir = $PSScriptRoot

Write-Host ""
Write-Host "Starting SmartPOS Backend Microservices..." -ForegroundColor Cyan
Write-Host ""

# Discovery Server must start first - wait longer for Eureka to be ready
Write-Host "  [1/8] Starting Discovery Server (Eureka)..." -ForegroundColor Yellow
$svc1 = "$baseDir\backend\discovery-server"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc1'; Write-Host '▶ Eureka :8761' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 18

Write-Host "  [2/8] Starting API Gateway..." -ForegroundColor Yellow
$svc2 = "$baseDir\backend\api-gateway"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc2'; Write-Host '▶ Gateway :8080' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [3/8] Starting Auth Service..." -ForegroundColor Yellow
$svc3 = "$baseDir\backend\auth-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc3'; Write-Host '▶ Auth :8081' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [4/8] Starting Order Service..." -ForegroundColor Yellow
$svc4 = "$baseDir\backend\order-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc4'; Write-Host '▶ Order :8082' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [5/8] Starting Product Service..." -ForegroundColor Yellow
$svc5 = "$baseDir\backend\product-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc5'; Write-Host '▶ Product :8083' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [6/8] Starting Kitchen Service..." -ForegroundColor Yellow
$svc6 = "$baseDir\backend\kitchen-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc6'; Write-Host '▶ Kitchen :8084' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 4

Write-Host "  [7/8] Starting AI Service..." -ForegroundColor Yellow
$svc7 = "$baseDir\backend\ai-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc7'; Write-Host '▶ AI :8085' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
Start-Sleep -Seconds 3

Write-Host "  [8/8] Starting Notification Service..." -ForegroundColor Yellow
$svc8 = "$baseDir\backend\notification-service"
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$svc8'; Write-Host '▶ Notification :8086' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"

Write-Host ""
Write-Host "  [+] All 8 backend services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  Eureka Dashboard : http://localhost:8761" -ForegroundColor White
Write-Host "  API Gateway      : http://localhost:8080" -ForegroundColor White
Write-Host "  Auth Swagger     : http://localhost:8081/swagger-ui.html" -ForegroundColor White
Write-Host ""
