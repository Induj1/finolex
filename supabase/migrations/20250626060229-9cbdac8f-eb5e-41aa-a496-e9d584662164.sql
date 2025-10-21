
-- Create enum types for product status and security flags
CREATE TYPE product_status AS ENUM ('genuine', 'counterfeit', 'unverified');
CREATE TYPE security_flag AS ENUM ('low_risk', 'medium_risk', 'high_risk');

-- Products master table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(255) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE,
    product_name VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    manufacturing_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    distribution_locations TEXT[], -- Array of cities/regions where this product should be available
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scan logs table for tracking all verification attempts
CREATE TABLE public.scan_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barcode VARCHAR(255) NOT NULL,
    qr_code VARCHAR(255),
    scan_location VARCHAR(100), -- City-level location
    device_fingerprint VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    status product_status NOT NULL,
    security_flag security_flag DEFAULT 'low_risk',
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suspicious activity tracking
CREATE TABLE public.suspicious_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_fingerprint VARCHAR(255),
    ip_address INET,
    activity_type VARCHAR(50) NOT NULL, -- 'rate_limit_exceeded', 'location_mismatch', etc.
    details JSONB,
    severity VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin users table for analytics access
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Products table: Allow read access to everyone (for verification)
CREATE POLICY "Anyone can read products for verification"
    ON public.products FOR SELECT
    USING (true);

-- Scan logs: Allow insert for everyone, read for admins only
CREATE POLICY "Anyone can insert scan logs"
    ON public.scan_logs FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read scan logs"
    ON public.scan_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Suspicious activities: Allow insert for system, read for admins
CREATE POLICY "System can insert suspicious activities"
    ON public.suspicious_activities FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read suspicious activities"
    ON public.suspicious_activities FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Admin users: Only admins can read
CREATE POLICY "Admins can read admin users"
    ON public.admin_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_products_barcode ON public.products(barcode);
CREATE INDEX idx_products_qr_code ON public.products(qr_code);
CREATE INDEX idx_scan_logs_created_at ON public.scan_logs(created_at);
CREATE INDEX idx_scan_logs_ip_address ON public.scan_logs(ip_address);
CREATE INDEX idx_scan_logs_device_fingerprint ON public.scan_logs(device_fingerprint);
CREATE INDEX idx_suspicious_activities_created_at ON public.suspicious_activities(created_at);

-- Insert sample products for testing
INSERT INTO public.products (barcode, qr_code, product_name, batch_number, manufacturing_date, expiry_date, distribution_locations) VALUES
('123456789012', 'FNX-PIPE-001', 'Finolex PVC Pipe 4 inch', 'BATCH-2024-001', '2024-01-15', '2026-01-15', ARRAY['Mumbai', 'Delhi', 'Bangalore', 'Chennai']),
('123456789013', 'FNX-WIRE-002', 'Finolex House Wire 2.5mm', 'BATCH-2024-002', '2024-02-10', '2026-02-10', ARRAY['Mumbai', 'Pune', 'Hyderabad']),
('123456789014', 'FNX-CABLE-003', 'Finolex Armoured Cable', 'BATCH-2024-003', '2024-03-05', '2026-03-05', ARRAY['Delhi', 'Kolkata', 'Ahmedabad']);
