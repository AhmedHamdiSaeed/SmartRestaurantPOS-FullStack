CREATE TABLE restaurants (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(64) NOT NULL UNIQUE,
  timezone VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE TABLE restaurant_branches (
  id VARCHAR(36) PRIMARY KEY,
  restaurant_id VARCHAR(36) NOT NULL REFERENCES restaurants(id),
  name VARCHAR(150) NOT NULL,
  code VARCHAR(64) NOT NULL,
  address VARCHAR(500),
  timezone VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT uq_branch_restaurant_code UNIQUE (restaurant_id, code)
);
CREATE TABLE restaurant_tables (
  id VARCHAR(36) PRIMARY KEY,
  branch_id VARCHAR(36) NOT NULL REFERENCES restaurant_branches(id),
  table_number VARCHAR(32) NOT NULL,
  floor_name VARCHAR(100),
  section_name VARCHAR(100),
  capacity INTEGER,
  status VARCHAR(32) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT uq_table_branch_number UNIQUE (branch_id, table_number)
);
