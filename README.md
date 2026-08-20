# SmartRestaurantPOS — Full-Stack Microservices

An enterprise-grade **Smart Restaurant Point of Sale (POS)** system built with **Spring Boot 3.3 Microservices** (Java 17) and an **Angular 18** standalone frontend.

---

## 🏛️ Architecture Overview

```
SmartRestaurantPOS-FullStack/
├── backend/
│   ├── discovery-server/     ← Netflix Eureka Registry       :8761
│   ├── api-gateway/          ← Spring Cloud Gateway + JWT    :8080
│   ├── auth-service/         ← Users, Roles, BCrypt + JWT    :8081
│   ├── order-service/        ← Order Workflow + WebSocket    :8082
│   ├── product-service/      ← Catalog + Scored Search       :8083
│   ├── kitchen-service/      ← Station Monitor (live load)   :8084
│   ├── ai-service/           ← SSE Suggestion Engine         :8085
│   └── notification-service/ ← Offline Sync & Batch Replay  :8086
│
└── frontend/                 ← Angular 18, dark POS UI       :4200
```

---

## 🚀 Quick Start — One Command

### ▶️ Start Everything (Backend + Frontend)

```powershell
# From the project root — PowerShell
.\start-all.ps1
```

This launches all 8 backend microservices in separate terminals, waits for Eureka to be ready, then starts the Angular dev server.

---

### ▶️ Start Backend Only

```powershell
.\start-backend.ps1
```

### ▶️ Start Frontend Only

```powershell
.\start-frontend.ps1
```

---

## 🛠️ Manual Start (service by service)

> Start services **in order**. Discovery Server must come first.

```powershell
# 1 — Eureka Registry  (wait ~15s before next)
cd backend\discovery-server
..\mvnw.cmd spring-boot:run

# 2 — API Gateway
cd backend\api-gateway
..\mvnw.cmd spring-boot:run

# 3 — Auth Service
cd backend\auth-service
..\mvnw.cmd spring-boot:run

# 4 — Order Service
cd backend\order-service
..\mvnw.cmd spring-boot:run

# 5 — Product Service
cd backend\product-service
..\mvnw.cmd spring-boot:run

# 6 — Kitchen Service
cd backend\kitchen-service
..\mvnw.cmd spring-boot:run

# 7 — AI Service
cd backend\ai-service
..\mvnw.cmd spring-boot:run

# 8 — Notification Service
cd backend\notification-service
..\mvnw.cmd spring-boot:run

# Frontend
cd frontend
npm install
npm start
```

---

## 🌐 Service URLs

| Service | URL | Notes |
|---|---|---|
| **Frontend App** | http://localhost:4200 | Angular 18 POS UI |
| **Eureka Dashboard** | http://localhost:8761 | Shows all registered services |
| **API Gateway** | http://localhost:8080 | All API calls go through here |
| **Auth API** | http://localhost:8080/api/v1/auth/login | POST login |
| **Orders API** | http://localhost:8080/api/v1/orders | GET / POST orders |
| **Products API** | http://localhost:8080/api/v1/products | GET product catalog |
| **Kitchen API** | http://localhost:8080/api/v1/kitchen/load | GET live kitchen load |
| **AI Suggestions** | http://localhost:8080/api/v1/ai/suggest | SSE endpoint |
| **Auth Swagger** | http://localhost:8081/swagger-ui.html | Auth service docs |
| **Order Swagger** | http://localhost:8082/swagger-ui.html | Order service docs |
| **Product Swagger** | http://localhost:8083/swagger-ui.html | Product service docs |
| **Auth H2 Console** | http://localhost:8081/h2-console | DB: `authdb`, user: `sa` |
| **Order H2 Console** | http://localhost:8082/h2-console | DB: `orderdb`, user: `sa` |

> **Note:** `http://localhost:8080` (gateway root) shows a 404 Whitelabel page — this is **normal**. The gateway only routes `/api/v1/...` paths, not the root `/`.

---

## 🔑 Demo Credentials

| Username | Password | Role | Branch |
|---|---|---|---|
| `admin` | `admin123` | Manager | Riyadh Main |
| `cashier1` | `pass123` | Cashier | Riyadh Main |
| `kitchen1` | `pass123` | Kitchen | Riyadh Main |
| `support1` | `pass123` | Support | Riyadh Main |
| `manager1` | `pass123` | Manager | Jeddah Branch |

---

## 🔧 Prerequisites

| Tool | Version | Notes |
|---|---|---|
| **Java** | 17+ | JDK required |
| **Node.js** | 18+ | For Angular frontend |
| **npm** | 9+ | Bundled with Node.js |
| **Maven** | Not needed | Auto-downloaded by `mvnw.cmd` |

---

## 🧪 Run Frontend Tests

```powershell
cd frontend
npm test -- --passWithNoTests
```

---

## 📦 Tech Stack

### Backend
- **Spring Boot 3.3.2** + **Spring Cloud 2023.0.3**
- **Netflix Eureka** — Service Discovery
- **Spring Cloud Gateway** — API Gateway with JWT filter
- **Spring Data JPA + H2** — Embedded in-memory database (no install needed)
- **JJWT 0.11.5** — JWT signing & validation
- **SpringDoc OpenAPI 2.6** — Swagger UI per service
- **Lombok** — Boilerplate reduction

### Frontend
- **Angular 18** — Standalone components, Signals, `@if`/`@for` control flow
- **RxJS 7.8** — Reactive streams, SSE, WebSocket
- **Angular Router** — Lazy-loaded feature modules
- **Jest 30 + jest-preset-angular** — Unit testing

---

## 💼 Architecture Highlights

- **Database-per-Service**: Each microservice owns its H2 in-memory DB — no shared state.
- **JWT at the Gateway**: JWT validation happens once in the gateway filter; downstream services trust forwarded `X-User-Id`, `X-User-Role` headers.
- **Real-time**: WebSocket (STOMP) for live order board updates; SSE for AI suggestion streaming.
- **Offline-first Frontend**: `OfflineQueueService` queues actions during network loss and replays on reconnect.
