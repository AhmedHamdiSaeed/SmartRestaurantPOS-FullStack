# Incremental Migration Plan

1. Establish the runnable foundation: supported Java/Spring versions, Maven wrapper, Compose, PostgreSQL, Kafka, Redis, migrations, secrets, tests, health/metrics, and CI.
2. Implement restaurant and catalog domains, then connect the existing product-search UI through API adapters.
3. Implement a POS/order/payment vertical slice with server-calculated prices, order state transitions, audit data, and an outbox.
4. Project order events into kitchen and WebSocket updates; then introduce inventory/recipes/suppliers.
5. Add customer, reservations, delivery, reporting, notifications, and read-only AI analytics in that order.

No existing Angular UX is to be rewritten until an equivalent backend-backed feature is verified. Full sequencing and acceptance criteria are in [Phase 1 assessment](phase-1-assessment.md).
