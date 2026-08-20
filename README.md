# SmartRestaurantPOS — Full-Stack Microservices

An enterprise-grade **Smart Restaurant Point of Sale (POS)** system built with **Spring Boot 3.3 Microservices** (Java 17) and an **Angular 18** standalone frontend.

---

## 🏛️ Architecture Overview

```
SmartRestaurantPOS-FullStack/
├── backend/
│   ├── discovery-server/     ← Netflix Eureka Registry       :8761
│   ├── api-gateway/          ← Spring Cloud Gateway + JWT    :8080 (Single Entry Point & Unified Swagger UI)
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

## 🌐 Unified Service & OpenAPI Swagger URLs

> **Single Entry Point**: All API requests and interactive Swagger UI documentation are accessible through the API Gateway at port `8080`.

| Service | Single Entry Point URL | Purpose |
|---|---|---|
| **Unified Swagger UI Dashboard** | **[http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)** | **Aggregated Swagger docs for all microservices** |
| **Frontend App** | [http://localhost:4200](http://localhost:4200) | Angular 18 POS User Interface |
| **Gateway Home / Status** | [http://localhost:8080](http://localhost:8080) | Gateway Status & Health JSON |
| **Eureka Registry** | [http://localhost:8761](http://localhost:8761) | Service Registry Dashboard |
| **Auth API via Gateway** | [http://localhost:8080/api/v1/auth/login](http://localhost:8080/api/v1/auth/login) | Authentication endpoints |
| **Orders API via Gateway** | [http://localhost:8080/api/v1/orders](http://localhost:8080/api/v1/orders) | Order Workflow & STOMP |
| **Products API via Gateway** | [http://localhost:8080/api/v1/products](http://localhost:8080/api/v1/products) | Product Catalog & Search |
| **Kitchen API via Gateway** | [http://localhost:8080/api/v1/kitchen/load](http://localhost:8080/api/v1/kitchen/load) | Station Load Monitoring |
| **AI Suggestions via Gateway** | [http://localhost:8080/api/v1/ai/suggestions/ord1](http://localhost:8080/api/v1/ai/suggestions/ord1) | SSE Streamed Suggestions |

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
- **Spring Cloud Gateway** — Single Entry Point API Gateway with WebFlux & JWT filter
- **SpringDoc OpenAPI 2.6 (WebFlux UI)** — Unified aggregated Swagger UI across all microservices
- **Netflix Eureka** — Service Discovery
- **Spring Data JPA + H2** — Embedded in-memory database (no install needed)
- **JJWT 0.11.5** — JWT signing & validation
- **Lombok** — Boilerplate reduction

### Frontend
- **Angular 18** — Standalone components, Signals, `@if`/`@for` control flow
- **RxJS 7.8** — Reactive streams, SSE, WebSocket
- **Jest 30 + jest-preset-angular** — Unit testing
