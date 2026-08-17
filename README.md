# SmartRestaurantPOS-FullStack

A enterprise-grade **Smart Restaurant Point of Sale (POS)** system built with **Spring Cloud Microservices Backend** and **Angular 18 Frontend**.

---

## 🏛️ Architecture Overview

The system is designed following the **Database-per-Service** microservices architectural pattern:

```
SmartRestaurantPOS-FullStack/
├── backend/
│   ├── discovery-server/      (Netflix Eureka Service Registry :8761)
│   ├── api-gateway/           (Spring Cloud Gateway + JWT Security :8080)
│   ├── auth-service/          (Authentication, Users & Roles :8081 - H2 authdb)
│   ├── order-service/         (Order Flow, Status Engine & WebSocket :8082 - H2 orderdb)
│   ├── product-service/       (Catalog, Multi-field Scored Search :8083 - H2 productdb)
│   ├── kitchen-service/       (Station Load Monitor & Scheduled Updates :8084 - H2 kitchendb)
│   ├── ai-service/            (Rule-based AI Assistant & SSE Streaming :8085)
│   └── notification-service/   (Offline Sync & Batch Action Replay :8086)
│
└── frontend/                  (Angular 18 App with Standalone Components & Dark UI)
```

---

## 🚀 Key Features

### Backend (Spring Boot 2.7.x / Spring Cloud 2021.0.9)
- **Eureka Service Discovery**: All 6 business microservices auto-register with Eureka on startup.
- **Spring Cloud API Gateway**: Unified entry point on port `8080` with reactive CORS filtering and central JWT signature validation.
- **JWT Security & RBAC**: Auth Service provides BCrypt password hashing and 24-hour signed JWT tokens supporting 4 roles (`CASHIER`, `MANAGER`, `KITCHEN`, `SUPPORT`).
- **Real-time Order Updates**: WebSocket (STOMP over SockJS) broadcasting new orders, status transitions, and priority escalations.
- **Kitchen Station Load Monitoring**: Scheduled background task simulating live kitchen load drift every 5 seconds across 6 stations (Grill, Fryer, Salad, Dessert, Drinks, Packaging).
- **Multi-Field Product Search**: Scored search engine weighting title matches (+10), category matches (+3), description (+2), tags (+2), and popularity (+2) with HTML highlight tags.
- **AI Recommendation Engine**: Server-Sent Events (SSE) character-by-character streaming for upsell suggestions, allergen alerts, and loyalty rewards.

### Frontend (Angular 18)
- **Standalone Component Architecture**: Modular structure using signal stores and modern Angular `@if`/`@for` control flow.
- **Premium Dark UI**: Glassmorphic styling, custom CSS tokens, smooth animations, and responsive POS layout.
- **Live Kanban Order Board**: 4 status columns (`Received`, `Preparing`, `Ready`, `Delivered`) with quick status advancement.
- **Product Catalog Search**: Debounced search bar with category filters and highlight tags.
- **Kitchen Monitor**: Live load gauge and station workload progress bars.

---

## 🛠️ How to Run

### 1. Start the Microservices Backend

Make sure Java 8+ is installed. Run the services in separate terminals:

```bash
# Terminal 1: Discovery Server (Start first!)
cd backend/discovery-server
..\mvnw.cmd spring-boot:run

# Terminal 2: API Gateway
cd backend/api-gateway
..\mvnw.cmd spring-boot:run

# Terminal 3: Auth Service
cd backend/auth-service
..\mvnw.cmd spring-boot:run

# Terminal 4: Order Service
cd backend/order-service
..\mvnw.cmd spring-boot:run

# Terminal 5: Product Service
cd backend/product-service
..\mvnw.cmd spring-boot:run

# Terminal 6: Kitchen Service
cd backend/kitchen-service
..\mvnw.cmd spring-boot:run

# Terminal 7: AI Service
cd backend/ai-service
..\mvnw.cmd spring-boot:run

# Terminal 8: Notification Service
cd backend/notification-service
..\mvnw.cmd spring-boot:run
```

- **Eureka Dashboard**: [http://localhost:8761](http://localhost:8761)
- **API Gateway**: [http://localhost:8080](http://localhost:8080)

### 2. Start the Angular Frontend

```bash
cd frontend
npm install
npm start
```

Access the frontend at [http://localhost:4200](http://localhost:4200).

---

## 🔑 Demo Credentials

| Username | Password | Role | Branch |
|----------|----------|------|--------|
| `admin` | `admin123` | Manager | Riyadh Main |
| `cashier1` | `pass123` | Cashier | Riyadh Main |
| `kitchen1` | `pass123` | Kitchen | Riyadh Main |
| `support1` | `pass123` | Support | Riyadh Main |

---

## 💼 Injaz Tech Profile Alignment
This project demonstrates expertise in:
- **Digital Transformation**: Enterprise POS modernizing restaurant operations.
- **Systems Integration**: Spring Cloud Microservices + Angular standalone frontend.
- **Emerging Tech / AI**: Rule-based AI suggestion engine with SSE streaming.
- **Scalable Architecture**: Eureka discovery, API Gateway, JWT security, and WebSocket event channels.
