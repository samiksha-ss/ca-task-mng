-- 1. Alter public.tasks to support advanced recurrence fields
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS recurrence_interval_type TEXT DEFAULT 'none' CHECK (recurrence_interval_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
ADD COLUMN IF NOT EXISTS recurrence_interval_count INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS recurrence_weekdays TEXT, -- Comma-separated list of weekdays (e.g. 'MO,TH')
ADD COLUMN IF NOT EXISTS recurrence_end_type TEXT DEFAULT 'never' CHECK (recurrence_end_type IN ('never', 'date', 'count')),
ADD COLUMN IF NOT EXISTS recurrence_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recurrence_end_count INTEGER,
ADD COLUMN IF NOT EXISTS recurrence_instance_date TEXT, -- Unique date tag 'YYYY-MM-DD' representing this occurrence
ADD COLUMN IF NOT EXISTS recurrence_exception BOOLEAN DEFAULT false;

-- Create optimized index for task parent tracking
CREATE INDEX IF NOT EXISTS tasks_recurrence_parent_idx ON public.tasks (recurrence_parent_id);
CREATE INDEX IF NOT EXISTS tasks_recurrence_instance_date_idx ON public.tasks (recurrence_instance_date);

-- 2. Drop existing events table and recreate it with advanced recurrence support
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Recurrence support columns
    recurrence_interval_type TEXT DEFAULT 'none' CHECK (recurrence_interval_type IN ('none', 'daily', 'weekly', 'monthly', 'yearly')),
    recurrence_interval_count INTEGER DEFAULT 1,
    recurrence_weekdays TEXT, -- Comma-separated list of weekdays (e.g. 'MO,TH')
    recurrence_end_type TEXT DEFAULT 'never' CHECK (recurrence_end_type IN ('never', 'date', 'count')),
    recurrence_end_date TIMESTAMP WITH TIME ZONE,
    recurrence_end_count INTEGER,
    recurrence_parent_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    recurrence_instance_date TEXT, -- Date tag 'YYYY-MM-DD' representing this occurrence
    recurrence_exception BOOLEAN DEFAULT false
);

-- Enable RLS on events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Recreate RLS Policies on events
CREATE POLICY "Users can view all events in their company" ON public.events
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own events" ON public.events
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" ON public.events
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" ON public.events
    FOR DELETE USING (auth.uid() = created_by);

-- Create optimized indexes for event recurrence queries
CREATE INDEX IF NOT EXISTS events_recurrence_parent_idx ON public.events (recurrence_parent_id);
CREATE INDEX IF NOT EXISTS events_recurrence_instance_date_idx ON public.events (recurrence_instance_date);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events (start_time);
