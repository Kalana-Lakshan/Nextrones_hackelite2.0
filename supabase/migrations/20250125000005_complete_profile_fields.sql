-- Complete profile fields migration
-- This migration adds ALL the missing fields needed for the Settings page and AI analysis

-- Add missing columns to profiles table
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
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'location') THEN
        ALTER TABLE public.profiles ADD COLUMN location TEXT;
    END IF;
    
    -- Add time_commitment column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'time_commitment') THEN
        ALTER TABLE public.profiles ADD COLUMN time_commitment VARCHAR(20) DEFAULT 'moderate';
    END IF;
    
    -- Add preferred_learning_style column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'preferred_learning_style') THEN
        ALTER TABLE public.profiles ADD COLUMN preferred_learning_style VARCHAR(50) DEFAULT 'mixed';
    END IF;
    
    -- Add learning_preferences column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'learning_preferences') THEN
        ALTER TABLE public.profiles ADD COLUMN learning_preferences JSONB DEFAULT '{}';
    END IF;
END $$;

-- Update existing profiles with default values for new fields
UPDATE public.profiles 
SET 
    interests = COALESCE(interests, '{}'),
    experience_level = COALESCE(experience_level, 'beginner'),
    goals = COALESCE(goals, '{}'),
    time_commitment = COALESCE(time_commitment, 'moderate'),
    preferred_learning_style = COALESCE(preferred_learning_style, 'mixed'),
    learning_preferences = COALESCE(learning_preferences, '{}')
WHERE 
    interests IS NULL 
    OR experience_level IS NULL 
    OR goals IS NULL
    OR time_commitment IS NULL 
    OR preferred_learning_style IS NULL
    OR learning_preferences IS NULL;

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
    
    -- Add time_commitment constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'profiles_time_commitment_check') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_time_commitment_check 
        CHECK (time_commitment IN ('low', 'moderate', 'high'));
    END IF;
    
    -- Add preferred_learning_style constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints 
                   WHERE constraint_name = 'profiles_learning_style_check') THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_learning_style_check 
        CHECK (preferred_learning_style IN ('visual', 'auditory', 'kinesthetic', 'reading', 'mixed'));
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON public.profiles USING GIN(goals);
CREATE INDEX IF NOT EXISTS idx_profiles_time_commitment ON public.profiles(time_commitment);
CREATE INDEX IF NOT EXISTS idx_profiles_learning_style ON public.profiles(preferred_learning_style);

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
    preferred_learning_style,
    learning_preferences
  )
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name',
    '{}',
    'beginner',
    '{}',
    'moderate',
    'mixed',
    '{}'
  );
  RETURN new;
END;
$$;

-- Verify the migration worked by checking if all columns exist
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_name TEXT;
    required_columns TEXT[] := ARRAY[
        'interests', 'experience_level', 'goals', 'bio', 
        'current_job_title', 'target_job_title', 'location',
        'time_commitment', 'preferred_learning_style', 'learning_preferences'
    ];
BEGIN
    FOREACH col_name IN ARRAY required_columns
    LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'profiles' AND column_name = col_name) THEN
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE EXCEPTION 'Migration failed: Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Migration successful: All required columns exist';
    END IF;
END $$;

