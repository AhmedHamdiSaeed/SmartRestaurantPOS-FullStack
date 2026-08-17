CREATE TABLE IF NOT EXISTS kitchen_tickets (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    order_number VARCHAR(50) NOT NULL,
    tenant_id VARCHAR(36),
    table_number VARCHAR(20),
    channel VARCHAR(30),
    customer_name VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kitchen_ticket_items (
    id VARCHAR(36) PRIMARY KEY,
    ticket_id VARCHAR(36) NOT NULL REFERENCES kitchen_tickets(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    category VARCHAR(100),
    notes TEXT
);

CREATE INDEX idx_kitchen_tickets_status ON kitchen_tickets(status);
CREATE INDEX idx_kitchen_tickets_tenant ON kitchen_tickets(tenant_id);
CREATE INDEX idx_kitchen_tickets_order ON kitchen_tickets(order_id);
