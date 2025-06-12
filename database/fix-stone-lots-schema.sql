-- Add the missing 'available' column to stone_lots table
ALTER TABLE stone_lots 
ADD COLUMN IF NOT EXISTS available BOOLEAN DEFAULT true;

-- Update existing records to be available by default
UPDATE stone_lots 
SET available = true 
WHERE available IS NULL;

-- Add an index for better query performance
CREATE INDEX IF NOT EXISTS idx_stone_lots_available 
ON stone_lots(available);

-- Verify the schema
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'stone_lots' 
ORDER BY ordinal_position;
