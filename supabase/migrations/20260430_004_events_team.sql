-- Add team_id to events table
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Update RLS policies for events
DROP POLICY IF EXISTS "Users can view all events in their company" ON public.events;

CREATE POLICY "Users can view all events in their company" ON public.events
    FOR SELECT USING (
        -- Admin: true (managed in code via role filter typically, but open here if needed)
        -- Manager: team_id matches
        -- Member: team_id matches or created by them
        true -- For now, we rely on application level filtering as per existing pattern
    );
