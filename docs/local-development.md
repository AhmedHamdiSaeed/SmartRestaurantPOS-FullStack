# Local development foundation

## Prerequisites

- Docker Compose v2
- Java 17+ for backend development
- Node.js 20+ for frontend development

## Start infrastructure

1. Copy `.env.example` to `.env` and replace the values.
2. Run `docker compose up -d`.
3. Verify PostgreSQL (`5432`), Redis (`6379`), Kafka (`9092`), the gateway (`8080`), and frontend (`4200`) with `docker compose ps`.

The compose stack activates the `postgres` profile for Auth, Order, Catalog, and Kitchen services. Flyway applies each service's schema before Hibernate validates it. Restaurant service is PostgreSQL-only. H2 remains available only for standalone demo development without the Compose stack.

## Build applications

```powershell
cd backend
.\mvnw.cmd test

cd ..\frontend
npm ci
npm test -- --runInBand
npm run build
```

`backend/Dockerfile` accepts a module build argument, for example `docker build --build-arg MODULE=order-service -t smartpos/order-service ./backend`.
