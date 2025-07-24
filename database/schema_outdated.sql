-- Jewelry ERP Database Schema
-- This schema reflects the actual production database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create sequence for SKU ID generation
CREATE SEQUENCE IF NOT EXISTS sku_sequential_number_seq START 1;

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  name TEXT NOT NULL
);

-- Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  current_load INTEGER DEFAULT 0,
  past_job_count INTEGER DEFAULT 0,
  rating NUMERIC(3,1),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SKUs table
CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id TEXT UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  size NUMERIC,
  gold_type TEXT NOT NULL,
  stone_type TEXT NOT NULL,
  diamond_type TEXT,
  weight NUMERIC(10,2),
  image_url TEXT,
  collection VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE,
  order_type TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT,
  production_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL,
  remarks TEXT,
  action TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Order items table (junction table between orders and SKUs)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  size TEXT,
  remarks TEXT,
  individual_production_date DATE,
  individual_delivery_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT UNIQUE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  manufacturer_id UUID REFERENCES manufacturers(id),
  production_date DATE,
  due_date DATE,
  current_phase TEXT NOT NULL,
  size TEXT,
  stone_data JSONB,
  diamond_data JSONB,
  manufacturer_data JSONB,
  qc_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Job history table for audit trail
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Stone lots table for inventory management
CREATE TABLE IF NOT EXISTS stone_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_number TEXT,
  stone_type TEXT NOT NULL,
  quantity INTEGER,
  weight NUMERIC(10,2),
  status TEXT DEFAULT 'Available',
  shape TEXT,
  quality TEXT,
  type TEXT,
  location TEXT,
  stone_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Diamond lots table for inventory management
CREATE TABLE IF NOT EXISTS diamond_lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_number TEXT,
  quantity INTEGER,
  weight NUMERIC(10,2),
  status TEXT DEFAULT 'Available',
  shape VARCHAR(10),
  quality VARCHAR(10),
  size VARCHAR(10),
  price NUMERIC(10,2),
  stonegroup VARCHAR(20),
  a_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE orders ADD CONSTRAINT fk_customer 
  FOREIGN KEY (customer_id) REFERENCES customers(id);

-- Function to generate SKU IDs with comprehensive category mapping
CREATE OR REPLACE FUNCTION generate_sku_id()
RETURNS TRIGGER AS $$
DECLARE
  category_prefix TEXT;
  next_sequential_number INT;
BEGIN
  -- Check if the sku_id is already set in the NEW row (provided by the application)
  IF NEW.sku_id IS NULL THEN
    -- If sku_id is NULL, proceed with automatic generation:

    -- Define category-to-prefix mapping based on the category of the new row
    category_prefix := CASE LOWER(NEW.category) -- Convert category to lowercase for consistent matching
      WHEN 'ring' THEN 'RG'
      WHEN 'bangle' THEN 'BN'
      WHEN 'bracelet' THEN 'BR'
      WHEN 'necklace' THEN 'NK'
      WHEN 'earring' THEN 'ER'
      WHEN 'ball lock' THEN 'BL'
      WHEN 'brouch' THEN 'BO'
      WHEN 'cuff link' THEN 'CF'
      WHEN 'chain' THEN 'CH'
      WHEN 'extras' THEN 'EX'
      WHEN 'tyre' THEN 'TY'
      WHEN 'pendant' THEN 'PN'
      WHEN 'kadi' THEN 'EX'
      WHEN 'earring part' THEN 'EX'
      ELSE 'OO' -- fallback: Use 'OO' for any category not explicitly mapped
    END;

    -- Get the next sequential number from the global sequence.
    -- nextval() automatically increments the sequence and returns the new value.
    SELECT nextval('sku_sequential_number_seq') INTO next_sequential_number;

    -- Construct the new SkuID: Category Prefix + Hyphen + Sequential Number (formatted to 4 digits with leading zeros)
    NEW.sku_id := category_prefix || '-' || LPAD(next_sequential_number::TEXT, 4, '0');

    -- Optional: Log that a new ID was generated (useful for debugging)
    -- RAISE NOTICE 'Generated new SkuID: %', NEW.sku_id;

  END IF; -- End of the block that runs only if sku_id was NULL

  -- Return the NEW row. This row will either have the newly generated sku_id
  -- (if it was initially NULL) or the sku_id provided by the application.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate Order IDs
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  max_id INTEGER := 0;
BEGIN
  -- Get the maximum existing order number
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_id FROM 3) AS INTEGER)), 0)
  INTO max_id
  FROM orders
  WHERE order_id LIKE 'O-%';
  
  -- Increment the maximum ID
  NEW.order_id := 'O-' || LPAD((max_id + 1)::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate Job IDs
CREATE OR REPLACE FUNCTION generate_job_id()
RETURNS TRIGGER AS $$
DECLARE
  next_number INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM jobs;
  NEW.job_id := 'J-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get next SKU sequence value
CREATE OR REPLACE FUNCTION get_next_sku_sequence_value()
RETURNS BIGINT AS $$
BEGIN
  RETURN nextval('sku_sequential_number_seq');
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic ID generation
CREATE TRIGGER set_sku_id_trigger
BEFORE INSERT ON skus
FOR EACH ROW
EXECUTE FUNCTION generate_sku_id();

CREATE TRIGGER set_order_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_id();

CREATE TRIGGER set_job_id
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION generate_job_id();

-- Enable Row Level Security on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE stone_lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE diamond_lots ENABLE ROW LEVEL SECURITY;
