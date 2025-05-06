-- Update the SKU ID generation function to match your desired format
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
    WHEN 'Rubies' THEN stone_suffix := 'RB';
    WHEN 'Emeralds' THEN stone_suffix := 'EM';
    WHEN 'Sapphires' THEN stone_suffix := 'SP';
    ELSE stone_suffix := 'OS'; -- Other Stone
  END CASE;
  
  -- Generate SKU ID
  NEW.sku_id := category_prefix || LPAD(next_number::TEXT, 3, '0') || gold_suffix || stone_suffix;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Make sure the trigger is set up correctly
DROP TRIGGER IF EXISTS set_sku_id ON skus;

CREATE TRIGGER set_sku_id
BEFORE INSERT ON skus
FOR EACH ROW
WHEN (NEW.sku_id IS NULL)
EXECUTE FUNCTION generate_sku_id();
