# Target Architecture

The SmartRestaurantPOS platform will use an Angular frontend behind a Spring Cloud gateway. State ownership is divided by business capability, with a PostgreSQL database per stateful service:

```text
Angular -> API Gateway -> Identity | Restaurant | Catalog | Order | Payment
                                      |              |
                                  Kitchen <- broker -> Inventory -> Notification / Reporting
```

Operational events are published through transactional outboxes to Kafka. Kitchen, inventory, notifications, and reporting consume events idempotently. Redis is reserved for rate limiting and bounded cache entries. WebSocket/STOMP messages are derived from durable events for authenticated browser sessions.

See [the detailed Phase 1 assessment](phase-1-assessment.md) for responsibilities, existing implementation constraints, and the migration sequence.
