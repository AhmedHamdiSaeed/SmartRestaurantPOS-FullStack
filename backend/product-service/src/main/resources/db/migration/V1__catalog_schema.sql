CREATE TABLE products (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(200),
  name_ar VARCHAR(200),
  sku VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(64),
  price DOUBLE PRECISION,
  description VARCHAR(500),
  image_url VARCHAR(1000),
  allergens VARCHAR(1000),
  calories INTEGER,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  preparation_time INTEGER,
  tags VARCHAR(1000),
  rating DOUBLE PRECISION,
  sales_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_products_category_available ON products(category, is_available);
CREATE INDEX idx_products_name ON products(name);
