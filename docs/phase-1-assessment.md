# SmartRestaurantPOS Phase 1 Assessment

**Assessment date:** 2026-08-14  
**Source examined:** `../SmartRestaurantPOS` (original frontend) and this `SmartRestaurantPOS-FullStack` workspace.

## Executive summary

The original application is a polished Angular 18 restaurant-operations dashboard, not a full POS implementation. It has useful UI, feature boundaries, NgRx SignalStore state, simulated real-time streams, offline queuing, and Jest tests. All business data and integrations are mocked in the browser.

This workspace preserves that frontend and adds a first-pass Spring Cloud backend: Eureka discovery, an API gateway, and seven service modules. The backend is a demonstrator rather than a production-ready platform: it uses independent in-memory H2 databases, no broker or Redis, no database migrations, and has no tests or deployment assets.

The recommended path is an incremental evolution of the existing workspace, starting with a runnable local foundation and an authenticated order/menu vertical slice. Replacing the original Angular UI wholesale would discard valuable working presentation and state-management code.

## Existing functionality

| Area | Original project | Full-stack workspace | Preserve / evolve |
| --- | --- | --- | --- |
| Frontend | Angular 18 standalone app, lazy routes, SignalStore, dark POS operations UI | Original UI copied into `frontend/`, plus API/auth scaffolding | Preserve feature structure and shared components; replace mocks feature by feature |
| Orders | Kanban-style live order board, simulated events | Order REST CRUD/status/priority APIs, H2 persistence, STOMP broadcasts | Evolve into POS/order aggregate with real lifecycle and server-side validation |
| Products | Search UI and static mock data | Product/category read APIs with H2 data loader | Preserve search UX; introduce menu/catalog model, pricing, variants, modifiers and pagination |
| Kitchen | Load monitor with simulated station changes | Kitchen station read APIs and STOMP configuration | Evolve into kitchen tickets fed through durable events |
| Auth | UI scaffolding only in original | Register, login, JWT issue, password hashing, `/me` | Retain as a prototype only; redesign token lifecycle and authorization |
| AI | Simulated streaming suggestions | Stateless suggestion endpoint | Keep only as an optional UI demo until reporting data and an audited AI boundary exist |
| Offline | Browser localStorage action queue | Offline batch endpoint stub | Preserve queue concepts; define server idempotency and conflict policy before enabling writes |

## Architecture currently present

```
Angular 18 frontend
        |
API Gateway :8080 -- Eureka discovery :8761
        |
  Auth :8081   Order :8082   Product :8083   Kitchen :8084
  AI :8085     Notification :8086
```

Each stateful service currently owns an H2 in-memory store, which is a good starting boundary but is not durable and does not satisfy production database-per-service requirements.

## Concrete findings

### Frontend

- Feature organization, standalone lazy routes, SignalStore, `OnPush` components, toast support, mock services, and several Jest specs are present.
- Routes currently expose only `orders`, `kitchen`, `search`, and `offline-demo`; no POS checkout, restaurant setup, inventory, payment, customer, reservation, delivery, report, or settings route exists.
- `provideHttpClient(withInterceptorsFromDi())` is configured, but the current route guard/interceptor are not registered through dependency injection. Existing API service files therefore do not yet make the app an authenticated backend client.
- Product/order/kitchen/AI mock implementations coexist with API clients. This makes incremental replacement feasible but requires one explicit feature flag or provider boundary to prevent mixed mock/real state.
- The original README accurately calls out its mock backend and simulated WebSocket limitations.

### Backend

- Root Maven build targets Spring Boot **2.7.18** and Java **8**, which is an outdated baseline for a new production modernization. Spring Cloud 2021.0.9 is coupled to that baseline.
- The gateway does route the existing services and verifies bearer JWT signatures, but has permissive `allowedOrigins: "*"`, no rate limiter, and a JWT secret committed in `application.yml` with a source-code default.
- Authentication provides only registration, login, and a one-day access token. It has no refresh/revocation/session records, email verification, password reset, permission model, audit trail, or token key rotation. Public registration accepts a role value, so privileged role assignment must be restricted before production use.
- Order creation trusts client-provided item names and prices, applies a hard-coded 15% tax, and sends best-effort STOMP messages whose failures are ignored. There is no table, payment, inventory, product-price lookup, outbox, broker event, or idempotency mechanism.
- Kitchen and notification services are incomplete. The notification service only exposes an offline batch stub. AI is a small suggestion endpoint rather than a separate, protected analytics capability.
- Springdoc dependencies are declared in several services, but no consistent OpenAPI metadata, gateway aggregation, or documented security scheme exists.
- No Flyway/Liquibase, PostgreSQL/SQL Server, Redis, Kafka/RabbitMQ, Docker/Compose, CI workflow, observability stack, Testcontainers, or `src/test` backend tests were found.
- The repository contains Maven wrapper configuration under `.mvn`, but no `mvnw`/`mvnw.cmd` launch script; the backend cannot be run via the expected wrapper command.

### Git and build state

- Full-stack repository history contains one initialization commit (`9975960`). No existing working-tree changes were reported.
- Original repository has two commits; its only uncommitted item is `yarn.lock` (left untouched).
- Full-stack frontend test command cannot run because `frontend/node_modules` is absent (`jest` is not found).
- Backend test command cannot run via `mvnw.cmd` because that script is absent. No backend tests exist to execute.
- The original Angular production build began successfully; the original Jest process did not complete in the available non-interactive session and was stopped rather than altering test configuration.

## Gaps by target capability

| Capability | Status | Next action |
| --- | --- | --- |
| Restaurant, branch, floor, table | Missing | Add restaurant service and database migrations before table-aware orders |
| Catalog/menu, variants, modifiers, recipes | Basic read-only products | Replace enum-like catalog with managed entities and API contracts |
| POS checkout and order lifecycle | Partial order board/API | Implement a vertical slice: draft order, catalog-priced lines, tax policy, table assignment, payment intent |
| Payments | Missing | Create payment service and provider abstraction after the order contract is stable |
| Kitchen real time | Partial, direct STOMP only | Publish durable order events using transactional outbox and broker; kitchen consumes idempotently |
| Inventory and suppliers | Missing | Add inventory service with recipes/stock movements subscribed to paid/confirmed order events |
| Auth/security | Prototype | Upgrade baseline; add refresh tokens, RBAC/permissions, credential flows, audit logging, secret management |
| Reporting/AI | Demo only | Build reporting read models first; expose AI read-only analysis with explicit confirmation for mutations |
| Reliability/operations | Missing | Add Compose, health/metrics/traces, structured logs, CI and test pyramids |

## Recommended target boundaries

1. **Identity service** — users, roles, permissions, refresh sessions and audit identity data.
2. **Restaurant service** — tenants, restaurants, branches, floors, sections, tables and business settings.
3. **Catalog service** — categories, products, variants, modifiers, taxes, discounts and menu availability.
4. **Order service** — order aggregate, table/delivery references, pricing snapshot and lifecycle; it does not own payments or stock.
5. **Payment service** — payment intents, allocations, refunds and provider adapters.
6. **Kitchen service** — kitchen tickets/stations and delivery of kitchen status events.
7. **Inventory service** — ingredients, recipes, suppliers, stock and movements.
8. **Notification and reporting services** — event consumers/read models; no synchronous ownership of operational workflows.

Use PostgreSQL databases per stateful service. Publish integration events through a transactional outbox to Kafka (or RabbitMQ if operations prefers it), and use Redis only for targeted caching/rate limiting. STOMP/WebSocket delivery should be a projection of durable events, never the source of truth.

## Migration plan

### Phase 2 — runnable, secure foundation

1. Upgrade to a supported Java/Spring Boot/Spring Cloud compatibility set and restore Maven wrapper scripts.
2. Add Docker Compose for PostgreSQL, Redis, Kafka, services, and frontend; add environment-specific configuration with no committed secret values.
3. Establish shared API error format, correlation IDs, actuator health endpoints, OpenAPI conventions, and CI build/test/lint jobs.
4. Add Flyway, Testcontainers, and minimal unit/integration tests before expanding domains.
5. Harden gateway CORS, authentication, rate limiting and service-to-service trust.

### Phase 3 — restaurant and catalog

1. Introduce restaurant-service and catalog-service PostgreSQL schemas/migrations.
2. Implement branch/table configuration and catalog CRUD with role authorization.
3. Wire the existing product-search screen to the catalog API behind a controlled adapter; retain mock data only for development/demo mode.

### Phase 4 — POS, orders and payments

1. Add a dedicated POS route with keyboard/touch workflows, draft/held orders, modifiers and server-computed totals.
2. Refactor order service to persist pricing snapshots, validate lifecycle transitions, and emit outbox events.
3. Add payment service with cash/card/wallet/split allocations and a provider-port interface.

### Phase 5 onward

1. Deliver kitchen ticket projection and event-driven WebSocket updates.
2. Deliver inventory/recipe deduction, then customers/reservations/delivery.
3. Add reporting projections, notifications and only then read-only AI assistance.
4. Harden observability, backups, performance, security tests and deployment automation continuously.

## Decisions to make before Phase 2 implementation

- Confirm PostgreSQL and Kafka as the local-development defaults (recommended), versus SQL Server/RabbitMQ.
- Confirm the deployment target (single Compose host first, then Kubernetes or managed containers) because it changes gateway/config/discovery choices.
- Confirm multi-tenancy scope: independent restaurants versus a single restaurant with branches. The proposed service contracts should carry tenant and branch context either way.

## Files deliberately left unchanged

No application source was changed during Phase 1. This assessment is the sole Phase 1 artifact.
