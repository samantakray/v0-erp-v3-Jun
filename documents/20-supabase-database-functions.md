# Supabase Database Functions

This document explains the purpose and triggering conditions for the key PostgreSQL database functions used in the Jewelry ERP application. These functions are primarily responsible for generating unique identifiers for various entities within the system.

## 1. `generate_job_id()`

This function automatically generates a unique `job_id` for new entries in the `jobs` table.

### Function Code

\`\`\`sql
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
\`\`\`

### Explanation

The `generate_job_id` function is a PostgreSQL trigger function that executes before a new row is inserted into the `jobs` table. It calculates the `job_id` by:
1.  Counting the total number of existing jobs in the `jobs` table and adding 1 to get the `next_number`.
2.  Constructing the `job_id` by concatenating the prefix `'J-'` with the `next_number`, padded with leading zeros to ensure a four-digit format (e.g., `J-0001`, `J-0002`).
3.  Assigning this newly generated ID to the `job_id` column of the new row (`NEW.job_id`).

### Triggering Condition

This function is triggered by the `set_job_id` trigger, which is defined as follows:

\`\`\`sql
CREATE TRIGGER set_job_id
BEFORE INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION generate_job_id();
\`\`\`

This means `generate_job_id()` is executed **before every new row is inserted into the `jobs` table**.

## 2. `generate_order_id()`

This function automatically generates a unique `order_id` for new entries in the `orders` table.

### Function Code

\`\`\`sql
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
\`\`\`

### Explanation

The `generate_order_id` function is a PostgreSQL trigger function that executes before a new row is inserted into the `orders` table. It generates the `order_id` by:
1.  Querying the `orders` table to find the maximum existing numeric part of `order_id`s that start with `'O-'`. `COALESCE` ensures that if no such orders exist, `max_id` defaults to `0`.
2.  Incrementing this `max_id` by 1.
3.  Constructing the new `order_id` by prepending `'O-'` to the incremented number, padded with leading zeros to a four-digit format (e.g., `O-0001`, `O-0002`).
4.  Assigning this generated ID to the `order_id` column of the new row (`NEW.order_id`).

### Triggering Condition

This function is triggered by the `set_order_id` trigger, which is defined as follows:

\`\`\`sql
CREATE TRIGGER set_order_id
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION generate_order_id();
\`\`\`

This means `generate_order_id()` is executed **before every new row is inserted into the `orders` table**.

## 3. `generate_sku_id()`

This function automatically generates a unique `sku_id` for new entries in the `skus` table, based on the SKU's category.

### Function Code

\`\`\`sql
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
\`\`\`

### Explanation

The `generate_sku_id` function is a PostgreSQL trigger function that executes before a new row is inserted into the `skus` table. It's designed to generate an `sku_id` only if one is not already provided by the application (`NEW.sku_id IS NULL`). If an `sku_id` is provided, the function does nothing and the provided ID is used.

If `NEW.sku_id` is `NULL`, the function proceeds as follows:
1.  It determines a `category_prefix` (e.g., `RG` for 'ring', `NK` for 'necklace') based on the `category` field of the new SKU. A fallback prefix `'OO'` is used for unmapped categories.
2.  It retrieves the next sequential number from the `sku_sequential_number_seq` sequence. This sequence is global and ensures unique numbers across all SKU categories.
3.  It constructs the `sku_id` by combining the `category_prefix`, a hyphen, and the `next_sequential_number` padded with leading zeros to a four-digit format (e.g., `RG-0001`, `NK-0002`).
4.  This generated ID is then assigned to the `sku_id` column of the new row (`NEW.sku_id`).

### Triggering Condition

This function is triggered by the `set_sku_id_trigger`, which is defined as follows:

\`\`\`sql
CREATE TRIGGER set_sku_id_trigger
BEFORE INSERT ON skus
FOR EACH ROW
EXECUTE FUNCTION generate_sku_id();
\`\`\`

This means `generate_sku_id()` is executed **before every new row is inserted into the `skus` table**.

## 4. `get_next_sku_sequence_value()`

This is a utility function to retrieve the next value from the SKU sequential number sequence without inserting a new SKU.

### Function Code

\`\`\`sql
CREATE OR REPLACE FUNCTION get_next_sku_sequence_value()
RETURNS BIGINT AS $$
BEGIN
  RETURN nextval('sku_sequential_number_seq');
END;
$$ LANGUAGE plpgsql;
\`\`\`

### Explanation

The `get_next_sku_sequence_value` function is a simple PostgreSQL function that returns the next value from the `sku_sequential_number_seq` sequence. Unlike the trigger functions, this function does not operate on a specific table insert. It's designed to be called directly by the application when it needs to know what the *next* SKU sequential number will be, for example, to generate a client-side preview of an SKU ID before the actual database insertion. Calling `nextval()` increments the sequence, so each call will return a new, unique number.

### Triggering Condition

This function is **not** triggered by a database event (like `INSERT` or `UPDATE`). Instead, it is called explicitly by the application code. For instance, the `app/actions/sku-sequence-actions.ts` or `lib/client-id-generator.ts` might call this function to pre-generate or display the next available SKU ID to the user in the UI.
