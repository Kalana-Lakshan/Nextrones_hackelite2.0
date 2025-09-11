-- Create todo_groups table to organize todos by roadmap
CREATE TABLE IF NOT EXISTS public.todo_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    roadmap_id UUID REFERENCES public.saved_roadmaps(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add todo_group_id to todos table
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS todo_group_id UUID REFERENCES public.todo_groups(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_todo_groups_user_id ON public.todo_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_groups_roadmap_id ON public.todo_groups(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_todos_todo_group_id ON public.todos(todo_group_id);

-- Enable RLS on todo_groups table
ALTER TABLE public.todo_groups ENABLE ROW LEVEL SECURITY;

-- Todo groups policies
CREATE POLICY "Users can view their own todo groups"
ON public.todo_groups FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own todo groups"
ON public.todo_groups FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own todo groups"
ON public.todo_groups FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own todo groups"
ON public.todo_groups FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_todo_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_todo_groups_updated_at
    BEFORE UPDATE ON public.todo_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_todo_groups_updated_at();
