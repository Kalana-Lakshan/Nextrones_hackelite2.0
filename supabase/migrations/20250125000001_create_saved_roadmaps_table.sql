-- Create saved_roadmaps table to store complete AI-generated roadmaps
CREATE TABLE IF NOT EXISTS public.saved_roadmaps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  career_goal TEXT NOT NULL,
  roadmap_items JSONB NOT NULL,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_saved_roadmaps_user_id ON public.saved_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_roadmaps_created_at ON public.saved_roadmaps(created_at);
CREATE INDEX IF NOT EXISTS idx_saved_roadmaps_career_goal ON public.saved_roadmaps(career_goal);

-- Enable Row Level Security
ALTER TABLE public.saved_roadmaps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved roadmaps" 
ON public.saved_roadmaps FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved roadmaps" 
ON public.saved_roadmaps FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved roadmaps" 
ON public.saved_roadmaps FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved roadmaps" 
ON public.saved_roadmaps FOR DELETE 
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_saved_roadmaps_updated_at 
BEFORE UPDATE ON public.saved_roadmaps 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
