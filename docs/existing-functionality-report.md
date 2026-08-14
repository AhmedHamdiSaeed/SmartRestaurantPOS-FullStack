# Existing Functionality Report

The original project is an Angular 18 dashboard with lazy-loaded orders, kitchen, product search, AI assistant, and offline-demo views. It uses SignalStore, Jest tests, mock data, and RxJS simulations for real-time behavior. It has no live backend, persistence, or authentication.

The full-stack workspace adds an API gateway, Eureka discovery, and Auth, Order, Product, Kitchen, AI, and Notification service modules. Auth issues JWTs; Order, Product, and Kitchen persist demo data in independent H2 instances. The gateway routes their APIs and direct STOMP endpoints.

The assessment found no production database, broker, Redis, migrations, container configuration, backend tests, CI pipeline, or implemented inventory/payment/restaurant domains. Details and evidence are in [Phase 1 assessment](phase-1-assessment.md).
