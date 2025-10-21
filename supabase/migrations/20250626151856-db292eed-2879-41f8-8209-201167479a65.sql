
-- Create table for storing RSA key pairs (private key stays server-only)
CREATE TABLE public.rsa_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name VARCHAR(100) NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    private_key_hash TEXT NOT NULL, -- For reference only, actual private key stored in edge function secrets
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Create table for tracking QR code scans
CREATE TABLE public.qr_scan_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id VARCHAR(255) NOT NULL,
    product_id UUID REFERENCES public.products(id),
    first_scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    first_scan_location VARCHAR(100),
    first_scan_device_id VARCHAR(255),
    first_scan_ip INET,
    scan_count INTEGER DEFAULT 1,
    last_scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_scan_location VARCHAR(100),
    last_scan_device_id VARCHAR(255),
    last_scan_ip INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(qr_id)
);

-- Create table for all scan attempts (including reused ones)
CREATE TABLE public.qr_scan_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    qr_id VARCHAR(255) NOT NULL,
    scan_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    scan_location VARCHAR(100),
    device_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    verification_status VARCHAR(50) NOT NULL, -- 'first_use', 'reused', 'invalid', 'signature_invalid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.rsa_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scan_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for QR system
CREATE POLICY "System can manage RSA keys"
    ON public.rsa_keys FOR ALL
    USING (true);

CREATE POLICY "System can manage QR scan tracking"
    ON public.qr_scan_tracking FOR ALL
    USING (true);

CREATE POLICY "System can log scan attempts"
    ON public.qr_scan_attempts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can read scan attempts"
    ON public.qr_scan_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users 
            WHERE user_id = auth.uid()
        )
    );

-- Indexes for performance
CREATE INDEX idx_qr_scan_tracking_qr_id ON public.qr_scan_tracking(qr_id);
CREATE INDEX idx_qr_scan_attempts_qr_id ON public.qr_scan_attempts(qr_id);
CREATE INDEX idx_qr_scan_attempts_scan_time ON public.qr_scan_attempts(scan_time);

-- Add signature verification columns to products table
ALTER TABLE public.products ADD COLUMN signed_qr_data JSONB;
ALTER TABLE public.products ADD COLUMN qr_signature TEXT;
ALTER TABLE public.products ADD COLUMN qr_generated_at TIMESTAMP WITH TIME ZONE;

-- Insert initial RSA key reference (actual private key will be in edge function secrets)
INSERT INTO public.rsa_keys (key_name, public_key, private_key_hash, is_active) VALUES
('primary_signing_key', 
'-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdef...
-----END PUBLIC KEY-----', 
'sha256_hash_placeholder', 
true);
