-- Create tables for Jewelry ERP

-- SKUs table
CREATE TABLE IF NOT EXISTS skus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  gold_type TEXT,
  stone_type TEXT,
  diamond_type TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT UNIQUE NOT NULL,
  order_type TEXT NOT NULL,
  customer_name TEXT,
  customer_id UUID,
  production_date DATE,
  delivery_date DATE,
  status TEXT DEFAULT 'New',
  remarks TEXT,
  action TEXT DEFAULT 'View details',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table (for many-to-many relationship between orders and SKUs)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  size TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  sku_id UUID REFERENCES skus(id) ON DELETE CASCADE,
  size TEXT,
  status TEXT DEFAULT 'New',
  current_phase TEXT DEFAULT 'stone',
  production_date DATE,
  due_date DATE,
  stone_data JSONB,
  diamond_data JSONB,
  manufacturer_data JSONB,
  qc_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job history table for audit trail
CREATE TABLE IF NOT EXISTS job_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  action TEXT NOT NULL,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to auto-generate SKU IDs
CREATE OR REPLACE FUNCTION generate_sku_id()
RETURNS TRIGGER AS $$
DECLARE
  category_prefix TEXT;
  next_number INTEGER;
  gold_suffix TEXT;
  stone_suffix TEXT;
BEGIN
  -- Get category prefix
  CASE NEW.category
    WHEN 'Necklace' THEN category_prefix := 'NK';
    WHEN 'Ring' THEN category_prefix := 'RG';
    WHEN 'Earring' THEN category_prefix := 'ER';
    WHEN 'Bangle' THEN category_prefix := 'BG';
    WHEN 'Pendant' THEN category_prefix := 'PN';
    ELSE category_prefix := 'OT'; -- Other
  END CASE;
  
  -- Get next number for this category
  SELECT COALESCE(MAX(SUBSTRING(sku_id FROM LENGTH(category_prefix) + 1 FOR 3)::INTEGER), 0) + 1
  INTO next_number
  FROM skus
  WHERE sku_id LIKE category_prefix || '%';
  
  -- Get gold type suffix
  CASE NEW.gold_type
    WHEN 'Yellow Gold' THEN gold_suffix := 'YG';
    WHEN 'White Gold' THEN gold_suffix := 'WG';
    WHEN 'Rose Gold' THEN gold_suffix := 'RG';
    ELSE gold_suffix := 'OG'; -- Other Gold
  END CASE;
  
  -- Get stone type suffix
  CASE NEW.stone_type
    WHEN 'None' THEN stone_suffix := 'NO';
    WHEN 'Emerald' THEN stone_suffix := 'EM';
    WHEN 'Ruby' THEN stone_suffix := 'RB';
    WHEN 'Sapphire' THEN stone_suffix := 'SP';
    ELSE stone_suffix := 'OS'; -- Other Stone
  END CASE;
  
  -- Generate SKU ID
  NEW.sku_id := category_prefix || LPAD(next_number::TEXT, 3, '0') || gold_suffix || stone_suffix;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate SKU IDs
CREATE TRIGGER set_sku_id
BEFORE INSERT ON skus
FOR EACH ROW
WHEN (NEW.sku_id IS NULL)
EXECUTE FUNCTION generate_sku_id();

-- Function to auto-generate order IDs
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
BEGIN
  -- Get next order number
  SELECT COALESCE(MAX(SUBSTRING(order_id FROM 2)::INTEGER), 0) + 1
  INTO next_number
  FROM orders;
  
  -- Generate order ID: O[5-digit number]
  NEW.order_id := 'O' || LPAD(next_number::TEXT, 5, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate order IDs
CREATE TRIGGER set_order_id
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_id IS NULL)
EXECUTE FUNCTION generate_order_id();

-- Set up Row Level Security (RLS)
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read SKUs"
  ON skus FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read job history"
  ON job_history FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for service role (for server actions)
CREATE POLICY "Allow service role to manage SKUs"
  ON skus FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to manage orders"
  ON orders FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to manage order items"
  ON order_items FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to manage jobs"
  ON jobs FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to manage job history"
  ON job_history FOR ALL
  TO service_role
  USING (true);
