-- Add missing profile fields for AI analysis
-- This migration adds the fields required by the AI analysis system

-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS current_job_title TEXT,
ADD COLUMN IF NOT EXISTS target_job_title TEXT,
ADD COLUMN IF NOT EXISTS learning_preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS time_commitment VARCHAR(20) DEFAULT 'moderate' CHECK (time_commitment IN ('low', 'moderate', 'high')),
ADD COLUMN IF NOT EXISTS preferred_learning_style VARCHAR(50) DEFAULT 'mixed' CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'mixed'));

-- Update the handle_new_user function to include default values for new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name,
    interests,
    experience_level,
    goals,
    time_commitment,
    preferred_learning_style
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    '{}',
    'beginner',
    '{}',
    'moderate',
    'mixed'
  );
  RETURN new;
END;
$$;

-- Create indexes for better performance on new fields
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON public.profiles USING GIN(goals);

-- Update existing profiles with default values for new fields
UPDATE public.profiles 
SET 
  interests = COALESCE(interests, '{}'),
  experience_level = COALESCE(experience_level, 'beginner'),
  goals = COALESCE(goals, '{}'),
  time_commitment = COALESCE(time_commitment, 'moderate'),
  preferred_learning_style = COALESCE(preferred_learning_style, 'mixed')
WHERE 
  interests IS NULL 
  OR experience_level IS NULL 
  OR goals IS NULL 
  OR time_commitment IS NULL 
  OR preferred_learning_style IS NULL;

-- Add some sample data for testing (optional)
-- This will only insert if the user doesn't already have these fields populated
INSERT INTO public.profiles (user_id, interests, experience_level, goals, bio, current_job_title, target_job_title)
SELECT 
  auth.uid(),
  ARRAY['Web Development', 'JavaScript', 'React', 'Node.js'],
  'intermediate',
  ARRAY['Become a Full Stack Developer', 'Learn Advanced React Patterns', 'Get a Senior Developer Role'],
  'Passionate developer learning new technologies',
  'Frontend Developer',
  'Senior Full Stack Developer'
WHERE 
  auth.uid() IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND interests IS NOT NULL 
    AND array_length(interests, 1) > 0
  );
