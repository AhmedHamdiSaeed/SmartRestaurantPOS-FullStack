# Local development foundation

## Prerequisites

- Docker Compose v2
- Java 17+ for backend development
- Node.js 20+ for frontend development

## Start infrastructure

1. Copy `.env.example` to `.env` and replace the values.
2. Run `docker compose up -d`.
3. Verify PostgreSQL (`5432`), Redis (`6379`), and Kafka (`9092`) are healthy with `docker compose ps`.

The compose stack provisions separate PostgreSQL databases for the services that already have persistence models. Existing services continue to use H2 until their Flyway migrations are added in the domain phases; this prevents Hibernate schema generation from becoming an undocumented production schema.

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
