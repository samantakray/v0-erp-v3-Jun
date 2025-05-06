-- Create a trigger function to generate order IDs
CREATE OR REPLACE FUNCTION generate_order_id()
RETURNS TRIGGER AS $$
DECLARE
  next_number INT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_number FROM orders;
  NEW.order_id := 'O-' || LPAD(next_number::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before insert
CREATE TRIGGER set_order_id
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_id IS NULL)
EXECUTE FUNCTION generate_order_id();
