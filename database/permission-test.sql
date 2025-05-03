-- Function to test permissions without modifying data
CREATE OR REPLACE FUNCTION test_permissions(table_name TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Check if the table exists
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = test_permissions.table_name
  ) THEN
    RETURN jsonb_build_object('success', false, 'message', 'Table does not exist');
  END IF;

  -- Check if we can select from the table
  BEGIN
    EXECUTE format('SELECT COUNT(*) FROM %I LIMIT 1', table_name);
    result = jsonb_build_object('read', true);
  EXCEPTION WHEN insufficient_privilege THEN
    result = jsonb_build_object('read', false, 'read_error', SQLERRM);
  END;

  -- Check if we can insert into the table (without actually inserting)
  BEGIN
    -- Start a transaction we'll roll back
    EXECUTE 'BEGIN';
    
    -- Try to get column names
    DECLARE
      column_names TEXT;
    BEGIN
      SELECT string_agg(column_name, ', ') 
      INTO column_names
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = test_permissions.table_name
      AND column_name NOT IN ('id', 'created_at', 'updated_at');
      
      -- If we have columns, try a dummy insert that we'll roll back
      IF column_names IS NOT NULL THEN
        EXECUTE format('EXPLAIN INSERT INTO %I DEFAULT VALUES', table_name);
        result = result || jsonb_build_object('write', true);
      ELSE
        result = result || jsonb_build_object('write', false, 'write_error', 'Could not determine columns');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      result = result || jsonb_build_object('write', false, 'write_error', SQLERRM);
    END;
    
    -- Roll back the transaction
    EXECUTE 'ROLLBACK';
  EXCEPTION WHEN OTHERS THEN
    -- Make sure we roll back if there was an error
    EXECUTE 'ROLLBACK';
    result = result || jsonb_build_object('write', false, 'write_error', SQLERRM);
  END;

  RETURN jsonb_build_object('success', true, 'permissions', result);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create the test_permissions function
CREATE OR REPLACE FUNCTION create_permission_test_function()
RETURNS JSONB AS $$
BEGIN
  -- The function is already created above, so we just return success
  RETURN jsonb_build_object('success', true, 'message', 'Permission test function created or already exists');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
