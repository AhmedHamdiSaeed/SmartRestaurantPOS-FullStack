CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  order_number VARCHAR(64) NOT NULL UNIQUE,
  channel VARCHAR(32),
  status VARCHAR(32),
  priority VARCHAR(32),
  customer_name VARCHAR(200),
  customer_phone VARCHAR(64),
  customer_address VARCHAR(500),
  loyalty_points INTEGER DEFAULT 0,
  table_number INTEGER,
  delivery_address VARCHAR(500),
  subtotal DOUBLE PRECISION,
  tax DOUBLE PRECISION,
  total DOUBLE PRECISION,
  is_delayed BOOLEAN NOT NULL DEFAULT FALSE,
  delay_reason VARCHAR(500),
  notes VARCHAR(2000),
  estimated_ready_time TIMESTAMP WITHOUT TIME ZONE,
  actual_ready_time TIMESTAMP WITHOUT TIME ZONE,
  created_at TIMESTAMP WITHOUT TIME ZONE,
  updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE TABLE order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  name VARCHAR(200),
  quantity INTEGER,
  price DOUBLE PRECISION,
  notes VARCHAR(1000),
  allergens VARCHAR(1000),
  category VARCHAR(100)
);
CREATE INDEX idx_order_status_created ON orders(status, created_at DESC);
CREATE INDEX idx_order_items_order ON order_items(order_id);
