-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Comments Policies
CREATE POLICY "Users can view comments on tasks they can access" ON public.task_comments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_comments.task_id
        )
    );

CREATE POLICY "Users can create comments on tasks they can access" ON public.task_comments
    FOR INSERT WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_comments.task_id
        )
    );

CREATE POLICY "Users can update their own comments" ON public.task_comments
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own comments" ON public.task_comments
    FOR DELETE USING (auth.uid() = created_by);


-- Create time_entries table
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    minutes INTEGER NOT NULL CHECK (minutes > 0),
    description TEXT,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for time tracking
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Time tracking Policies
CREATE POLICY "Users can view time entries on tasks they can access" ON public.time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = time_entries.task_id
        )
    );

CREATE POLICY "Users can log time on tasks they can access" ON public.time_entries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = time_entries.task_id
        )
    );

CREATE POLICY "Users can delete their own time entries" ON public.time_entries
    FOR DELETE USING (auth.uid() = user_id);


-- Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for attachments
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

-- Attachments Policies
CREATE POLICY "Users can view attachments on tasks they can access" ON public.task_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_attachments.task_id
        )
    );

CREATE POLICY "Users can upload attachments on tasks they can access" ON public.task_attachments
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by AND
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_attachments.task_id
        )
    );

CREATE POLICY "Users can delete their own attachments" ON public.task_attachments
    FOR DELETE USING (auth.uid() = uploaded_by);


-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System/Admins can create notifications for users" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications (mark read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" ON public.notifications
    FOR DELETE USING (auth.uid() = user_id);
