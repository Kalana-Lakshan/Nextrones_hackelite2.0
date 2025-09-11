-- Verify profile schema and fix any missing columns
-- This migration ensures all required columns exist and provides diagnostic information

-- Check current schema
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_name TEXT;
    required_columns TEXT[] := ARRAY[
        'skills', 'interests', 'experience_level', 'goals', 'bio', 
        'current_job_title', 'target_job_title', 'location',
        'time_commitment', 'preferred_learning_style', 'learning_preferences'
    ];
    existing_columns TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check which columns exist
    FOREACH col_name IN ARRAY required_columns
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = col_name) THEN
            existing_columns := array_append(existing_columns, col_name);
        ELSE
            missing_columns := array_append(missing_columns, col_name);
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Existing columns: %', array_to_string(existing_columns, ', ');
    RAISE NOTICE 'Missing columns: %', array_to_string(missing_columns, ', ');
    
    -- Add any missing columns
    IF array_length(missing_columns, 1) > 0 THEN
        FOREACH col_name IN ARRAY missing_columns
        LOOP
            CASE col_name
                WHEN 'interests' THEN
                    ALTER TABLE public.profiles ADD COLUMN interests TEXT[] DEFAULT '{}';
                WHEN 'experience_level' THEN
                    ALTER TABLE public.profiles ADD COLUMN experience_level VARCHAR(20) DEFAULT 'beginner';
                WHEN 'goals' THEN
                    ALTER TABLE public.profiles ADD COLUMN goals TEXT[] DEFAULT '{}';
                WHEN 'bio' THEN
                    ALTER TABLE public.profiles ADD COLUMN bio TEXT;
                WHEN 'current_job_title' THEN
                    ALTER TABLE public.profiles ADD COLUMN current_job_title TEXT;
                WHEN 'target_job_title' THEN
                    ALTER TABLE public.profiles ADD COLUMN target_job_title TEXT;
                WHEN 'location' THEN
                    ALTER TABLE public.profiles ADD COLUMN location TEXT;
                WHEN 'time_commitment' THEN
                    ALTER TABLE public.profiles ADD COLUMN time_commitment VARCHAR(20) DEFAULT 'moderate';
                WHEN 'preferred_learning_style' THEN
                    ALTER TABLE public.profiles ADD COLUMN preferred_learning_style VARCHAR(50) DEFAULT 'mixed';
                WHEN 'learning_preferences' THEN
                    ALTER TABLE public.profiles ADD COLUMN learning_preferences JSONB DEFAULT '{}';
            END CASE;
            RAISE NOTICE 'Added column: %', col_name;
        END LOOP;
    END IF;
END $$;

-- Update existing profiles with default values
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

-- Add constraints
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_experience_level ON public.profiles(experience_level);
CREATE INDEX IF NOT EXISTS idx_profiles_interests ON public.profiles USING GIN(interests);
CREATE INDEX IF NOT EXISTS idx_profiles_goals ON public.profiles USING GIN(goals);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_profiles_time_commitment ON public.profiles(time_commitment);
CREATE INDEX IF NOT EXISTS idx_profiles_learning_style ON public.profiles(preferred_learning_style);

-- Final verification
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    col_name TEXT;
    required_columns TEXT[] := ARRAY[
        'skills', 'interests', 'experience_level', 'goals', 'bio', 
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
        RAISE EXCEPTION 'Schema verification failed: Missing columns: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'Schema verification successful: All required columns exist';
    END IF;
END $$;

