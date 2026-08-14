# Phase 2 Foundation

Phase 2 establishes a reproducible local-development and delivery baseline without changing the existing POS user flows.

## Delivered

- Java 17, Spring Boot 3.3, and Spring Cloud 2023 upgrade.
- Jakarta persistence/validation migration and Spring Security 6 DSL migration.
- Restored Maven Wrapper scripts and the official wrapper JAR, allowing `backend/mvnw.cmd test` with no locally installed Maven.
- Spring Boot Actuator health/info endpoints on every existing service.
- JWT signing secret now comes from the `JWT_SECRET` environment variable; no source-controlled default remains.
- Docker Compose infrastructure: PostgreSQL 16, Redis 7, and Kafka 3.8, including independent starter databases for Auth, Order, Catalog, and Kitchen.
- Container build recipes for frontend and individual backend modules.
- GitHub Actions CI for backend tests plus frontend clean install, tests, and build.
- A committed frontend lockfile and Angular 18-compatible Jest 29 toolchain.
- Repairs to existing frontend API/store imports and test-safe mock fallbacks. The app continues to use live API clients whenever `HttpClient` is configured, and retains the original mocks in test/demo mode.

## Verification

| Check | Result |
| --- | --- |
| `backend/mvnw.cmd test` | Passed |
| Frontend Jest | 9 suites, 178 tests passed |
| Angular production build | Passed |
| `docker compose --env-file .env.example config --quiet` | Passed |

## Intentional boundary

The existing services still use H2 at runtime. The compose stack provisions PostgreSQL now, but services will move to their own PostgreSQL databases only together with Flyway migrations in the domain phases. This avoids turning Hibernate auto-DDL into an undocumented production schema.

## Next phase

Implement the restaurant/branch/table and catalog domains with PostgreSQL + Flyway, then connect the preserved product-search frontend through the catalog API.
