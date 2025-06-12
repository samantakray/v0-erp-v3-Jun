-- Row Level Security Policies for Jewelry ERP
-- These policies reflect the actual production database configuration

-- Customers table policies
CREATE POLICY "Allow anonymous read access for customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert customers" ON customers
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update customers" ON customers
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete customers" ON customers
    FOR DELETE USING (auth.role() = 'service_role');

-- Users table policies
CREATE POLICY "Allow anonymous read access for users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON users
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert users" ON users
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update users" ON users
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete users" ON users
    FOR DELETE USING (auth.role() = 'service_role');

-- Manufacturers table policies
CREATE POLICY "Allow anonymous read access for manufacturers" ON manufacturers
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON manufacturers
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert manufacturers" ON manufacturers
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update manufacturers" ON manufacturers
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete manufacturers" ON manufacturers
    FOR DELETE USING (auth.role() = 'service_role');

-- SKUs table policies
CREATE POLICY "Allow anonymous read access for skus" ON skus
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON skus
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert skus" ON skus
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update skus" ON skus
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete skus" ON skus
    FOR DELETE USING (auth.role() = 'service_role');

-- Orders table policies
CREATE POLICY "Allow anonymous read access for orders" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert orders" ON orders
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update orders" ON orders
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete orders" ON orders
    FOR DELETE USING (auth.role() = 'service_role');

-- Order items table policies
CREATE POLICY "Allow anonymous read access for order_items" ON order_items
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert order_items" ON order_items
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update order_items" ON order_items
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete order_items" ON order_items
    FOR DELETE USING (auth.role() = 'service_role');

-- Jobs table policies
CREATE POLICY "Allow anonymous read access for jobs" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON jobs
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert jobs" ON jobs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update jobs" ON jobs
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete jobs" ON jobs
    FOR DELETE USING (auth.role() = 'service_role');

-- Job history table policies
CREATE POLICY "Allow anonymous read access for job_history" ON job_history
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON job_history
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert job_history" ON job_history
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update job_history" ON job_history
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete job_history" ON job_history
    FOR DELETE USING (auth.role() = 'service_role');

-- Stone lots table policies
CREATE POLICY "Allow anonymous read access for stone_lots" ON stone_lots
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON stone_lots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert stone_lots" ON stone_lots
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update stone_lots" ON stone_lots
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete stone_lots" ON stone_lots
    FOR DELETE USING (auth.role() = 'service_role');

-- Diamond lots table policies
CREATE POLICY "Allow anonymous read access for diamond_lots" ON diamond_lots
    FOR SELECT USING (true);

CREATE POLICY "Allow all for authenticated" ON diamond_lots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow service role to insert diamond_lots" ON diamond_lots
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role to update diamond_lots" ON diamond_lots
    FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role to delete diamond_lots" ON diamond_lots
    FOR DELETE USING (auth.role() = 'service_role');
