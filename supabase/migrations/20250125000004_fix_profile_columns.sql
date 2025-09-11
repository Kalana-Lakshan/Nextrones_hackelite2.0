-- Fix profile columns - add only essential fields for AI analysis
-- This migration ensures the profiles table has the required fields

-- First, check if the columns exist and add them if they don't
DO $$ 
BEGIN
    -- Add interests column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'interests') THEN
        ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add experience_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'experience_level') THEN
        ALTER TABLE public.profiles ADD COLUMN experience_level VARCHAR(20) DEFAULT 'beginner';
    END IF;
    
    -- Add goals column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'goals') THEN
        ALTER TABLE public.profiles ADD COLUMN goals TEXT[] DEFAULT '{}';
    END IF;
    
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio TEXT;
    END IF;
    
    -- Add current_job_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'current_job_title') THEN
        ALTER TABLE public.profiles ADD COLUMN current_job_title TEXT;
    END IF;
    
    -- Add target_job_title column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'target_job_title') THEN
        ALTER TABLE public.profiles ADD COLUMN target_job_title TEXT;
    END IF;
END $$;

-- Update existing profiles with default values for new fields
UPDATE public.profiles 
SET 
    interests = COALESCE(interests, '{}'),
    experience_level = COALESCE(experience_level, 'beginner'),
    goals = COALESCE(goals, '{}')
WHERE 
    interests IS NULL 
    OR experience_level IS NULL 
    OR goals IS NULL;

-- Add constraints if they don't exist
DO $$
BEGIN
    -- Add experience_level constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'profiles_experience_level_check') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_experience_level_check 
        CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON public.profiles USING GIN(goals);

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
    goals
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    '{}',
    'beginner',
    '{}'
  );
  RETURN new;
END;
$$;

