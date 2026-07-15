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
