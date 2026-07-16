-- Create car_models table
CREATE TABLE IF NOT EXISTS public.car_models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specs TEXT NOT NULL
);

-- Insert seed data for car models
INSERT INTO public.car_models (id, name, specs) VALUES
    ('hilux', 'Toyota Hilux Revo', '2.8L Prerunner'),
    ('fortuner', 'Toyota Fortuner', '2.8L Diesel | 201 BHP'),
    ('corolla', 'Toyota Corolla e170', '1.8L Hybrid | 121 BHP'),
    ('land-cruiser', 'Toyota Land Cruiser', '3.3L Twin-Turbo V6'),
    ('supra', 'Toyota GR Supra', '3.0L Turbo Inline-6')
ON CONFLICT (id) DO NOTHING;

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    specs TEXT NOT NULL,
    price TEXT NOT NULL,
    frames TEXT[] NOT NULL,
    extra_details JSONB DEFAULT '{}'::jsonb
);

-- Create listing_frames table for background removal tracking
CREATE TABLE IF NOT EXISTS public.listing_frames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id TEXT NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
    frame_index SMALLINT NOT NULL,
    raw_url TEXT,
    processed_url TEXT,
    thumb_url TEXT,
    job_id TEXT,
    status TEXT DEFAULT 'queued',
    error_message TEXT,
    processing_ms INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(inventory_id, frame_index)
);

CREATE INDEX IF NOT EXISTS idx_frames_inventory ON public.listing_frames(inventory_id);
CREATE INDEX IF NOT EXISTS idx_frames_status ON public.listing_frames(status);
CREATE INDEX IF NOT EXISTS idx_frames_job ON public.listing_frames(job_id);

-- Add created_at to inventory if missing
ALTER TABLE public.inventory ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Enquiries / Sales Leads
CREATE TABLE IF NOT EXISTS public.enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_phone TEXT,
    vehicle_interest TEXT,
    vehicle_specs JSONB DEFAULT '{}'::jsonb,
    contact_date TIMESTAMPTZ DEFAULT NOW(),
    priority TEXT DEFAULT 'routine',
    lead_type TEXT DEFAULT 'sales',
    status TEXT DEFAULT 'new',
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_enquiries_type ON public.enquiries(lead_type);
CREATE INDEX IF NOT EXISTS idx_enquiries_priority ON public.enquiries(priority);

-- Certification Pipeline
CREATE TABLE IF NOT EXISTS public.certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id TEXT REFERENCES public.inventory(id) ON DELETE CASCADE,
    vehicle_name TEXT NOT NULL,
    vin TEXT,
    technician TEXT NOT NULL,
    points_checked INT DEFAULT 0,
    total_points INT DEFAULT 203,
    stage TEXT DEFAULT 'inspection',
    status TEXT DEFAULT 'in-progress',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_certifications_stage ON public.certifications(stage);
CREATE INDEX IF NOT EXISTS idx_certifications_status ON public.certifications(status);
