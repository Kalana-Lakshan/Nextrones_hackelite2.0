-- Create saved_chats table
CREATE TABLE IF NOT EXISTS public.saved_chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    messages JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS saved_chats_user_id_idx ON public.saved_chats(user_id);
CREATE INDEX IF NOT EXISTS saved_chats_created_at_idx ON public.saved_chats(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.saved_chats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved chats" ON public.saved_chats
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved chats" ON public.saved_chats
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved chats" ON public.saved_chats
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved chats" ON public.saved_chats
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_saved_chats_updated_at
    BEFORE UPDATE ON public.saved_chats
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


