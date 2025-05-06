-- Enable Row Level Security on all tables
ALTER TABLE skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_history ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous read access
CREATE POLICY "Allow anonymous read access for skus" ON skus
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access for orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access for jobs" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access for order_items" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous read access for job_history" ON job_history
    FOR SELECT USING (true);

-- Create policies for authenticated users (or service role) to insert/update/delete
CREATE POLICY "Allow service role to insert skus" ON skus
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update skus" ON skus
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete skus" ON skus
    FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to insert orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update orders" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete orders" ON orders
    FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to insert jobs" ON jobs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update jobs" ON jobs
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete jobs" ON jobs
    FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to insert order_items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update order_items" ON order_items
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete order_items" ON order_items
    FOR DELETE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to insert job_history" ON job_history
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update job_history" ON job_history
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete job_history" ON job_history
    FOR DELETE USING (auth.role() = 'service_role');
