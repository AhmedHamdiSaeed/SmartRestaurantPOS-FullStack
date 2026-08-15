CREATE TABLE kitchen_stations (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150),
  type VARCHAR(64),
  current_load INTEGER,
  max_capacity INTEGER,
  active_orders INTEGER,
  avg_prep_time DOUBLE PRECISION,
  status VARCHAR(32),
  last_updated TIMESTAMP WITHOUT TIME ZONE
);
