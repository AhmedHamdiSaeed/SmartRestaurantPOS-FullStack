# Phase 3 Progress

## Completed

- Added `restaurant-service`, a dedicated PostgreSQL/Flyway service owning restaurants, branches, and tables.
- Added REST endpoints for restaurant creation/listing, branch creation/listing, table creation/listing, and table-status updates.
- Added the `smartpos_restaurant` local database and gateway route.
- Added a `postgres` profile and Flyway V1 schema for the existing product/catalog service. The default profile remains H2-backed so the current demo continues to run without PostgreSQL.
- Added equivalent `postgres` profiles, PostgreSQL drivers, and Flyway V1 schemas for Auth, Order, and Kitchen services.
- Added all current core application services to Docker Compose with PostgreSQL profile/database environment values.

## Run configuration

Use `SPRING_PROFILES_ACTIVE=postgres` with service-specific database URLs (`AUTH_DB_URL`, `ORDER_DB_URL`, `CATALOG_DB_URL`, or `KITCHEN_DB_URL`) plus `POSTGRES_USER` and `POSTGRES_PASSWORD`. Restaurant service always uses PostgreSQL and accepts `RESTAURANT_DB_URL`.

## Pending

- Run the Maven build and integration checks when terminal access is available.
- Add catalog management CRUD, variants, modifiers, and branch availability before the POS checkout phase.
