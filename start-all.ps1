# ============================================================
# SmartRestaurantPOS — Start ALL (Backend + Frontend)
# ============================================================
# Run from the project root:  .\start-all.ps1
# ============================================================

$baseDir = $PSScriptRoot

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  SmartRestaurantPOS Full-Stack Launcher    " -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# ---- BACKEND ----
$services = @(
    @{ Name = "Discovery Server (Eureka)"; Dir = "discovery-server"; Delay = 18 },
    @{ Name = "API Gateway";               Dir = "api-gateway";       Delay = 3  },
    @{ Name = "Auth Service";              Dir = "auth-service";      Delay = 3  },
    @{ Name = "Order Service";             Dir = "order-service";     Delay = 3  },
    @{ Name = "Product Service";           Dir = "product-service";   Delay = 3  },
    @{ Name = "Kitchen Service";           Dir = "kitchen-service";   Delay = 3  },
    @{ Name = "AI Service";                Dir = "ai-service";        Delay = 3  },
    @{ Name = "Notification Service";      Dir = "notification-service"; Delay = 2 }
)

foreach ($svc in $services) {
    $svcDir = "$baseDir\backend\$($svc.Dir)"
    Write-Host "  Starting $($svc.Name)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command",
        "Set-Location '$svcDir'; Write-Host '▶ $($svc.Name)' -ForegroundColor Green; ..\mvnw.cmd spring-boot:run"
    Start-Sleep -Seconds $svc.Delay
}

Write-Host ""
Write-Host "  ✔ All backend services launched!" -ForegroundColor Green
Write-Host ""
Write-Host "  Waiting 10s for services to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# ---- FRONTEND ----
Write-Host "  Starting Angular Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command",
    "Set-Location '$baseDir\frontend'; Write-Host '▶ Angular Frontend' -ForegroundColor Green; npm start"

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  All services started!                    " -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend App  :  http://localhost:4200   " -ForegroundColor White
Write-Host "  Eureka        :  http://localhost:8761   " -ForegroundColor White
Write-Host "  API Gateway   :  http://localhost:8080   " -ForegroundColor White
Write-Host ""
Write-Host "  NOTE: Gateway root (8080/) shows 404 — this is normal." -ForegroundColor DarkGray
Write-Host "  Use http://localhost:4200 to open the app." -ForegroundColor DarkGray
Write-Host ""
