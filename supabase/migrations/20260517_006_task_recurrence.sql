-- Add recurrence columns to public.tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS recurrence_interval TEXT DEFAULT 'none' CHECK (recurrence_interval IN ('none', 'weekly', 'monthly', 'quarterly', 'annually')),
ADD COLUMN IF NOT EXISTS recurrence_last_created_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS recurrence_parent_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Create an index to optimize recurrence scheduling lookups
CREATE INDEX IF NOT EXISTS tasks_recurrence_interval_idx ON public.tasks (recurrence_interval);
