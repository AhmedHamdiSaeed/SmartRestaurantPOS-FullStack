CREATE TABLE IF NOT EXISTS payment_intents (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL,
    tenant_id VARCHAR(36),
    amount DOUBLE PRECISION NOT NULL,
    tip_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    method VARCHAR(20) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'SAR',
    reference_number VARCHAR(50) UNIQUE NOT NULL,
    external_transaction_id VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_allocations (
    id VARCHAR(36) PRIMARY KEY,
    intent_id VARCHAR(36) NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    method VARCHAR(20) NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    external_transaction_id VARCHAR(255),
    notes TEXT,
    processed_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS refunds (
    id VARCHAR(36) PRIMARY KEY,
    intent_id VARCHAR(36) NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
    amount DOUBLE PRECISION NOT NULL,
    reason TEXT,
    processed_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payment_intents_order_id ON payment_intents(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_tenant_id ON payment_intents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payment_intents_reference ON payment_intents(reference_number);
