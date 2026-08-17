-- Inventory Service initial schema

CREATE TABLE IF NOT EXISTS suppliers (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    address TEXT,
    rating DOUBLE PRECISION DEFAULT 5.0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    sku VARCHAR(100),
    unit VARCHAR(30) NOT NULL,
    current_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
    minimum_stock DOUBLE PRECISION NOT NULL DEFAULT 0,
    cost_per_unit DOUBLE PRECISION NOT NULL DEFAULT 0,
    supplier_id VARCHAR(36) REFERENCES suppliers(id),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS recipes (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    product_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recipe_items (
    id VARCHAR(36) PRIMARY KEY,
    recipe_id VARCHAR(36) NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(36) NOT NULL REFERENCES ingredients(id),
    quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    ingredient_id VARCHAR(36) NOT NULL REFERENCES ingredients(id),
    type VARCHAR(30) NOT NULL,
    quantity DOUBLE PRECISION NOT NULL,
    quantity_before DOUBLE PRECISION NOT NULL,
    quantity_after DOUBLE PRECISION NOT NULL,
    reference_id VARCHAR(100),
    reference_type VARCHAR(50),
    notes TEXT,
    performed_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_orders (
    id VARCHAR(36) PRIMARY KEY,
    tenant_id VARCHAR(36),
    supplier_id VARCHAR(36) REFERENCES suppliers(id),
    supplier_name VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    notes TEXT,
    ordered_at TIMESTAMP,
    received_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_order_items (
    id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    ingredient_id VARCHAR(36) REFERENCES ingredients(id),
    ingredient_name VARCHAR(255),
    quantity DOUBLE PRECISION NOT NULL DEFAULT 0,
    unit_cost DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_cost DOUBLE PRECISION NOT NULL DEFAULT 0
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ingredients_tenant ON ingredients(tenant_id);
CREATE INDEX IF NOT EXISTS idx_ingredients_sku ON ingredients(sku);
CREATE INDEX IF NOT EXISTS idx_recipes_tenant ON recipes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_recipes_product ON recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_tenant ON stock_movements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_ingredient ON stock_movements(ingredient_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_tenant ON purchase_orders(tenant_id);
