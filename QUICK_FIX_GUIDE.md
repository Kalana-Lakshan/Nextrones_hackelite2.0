# Quick Fix for Profile Error

## 🚨 Current Issue
The error `column profiles.interests does not exist` means the database migration hasn't been run yet.

## 🔧 Quick Fix Steps

### 1. Run Database Migration
In your Supabase dashboard, run this migration:
```sql
-- File: supabase/migrations/20250125000004_fix_profile_columns.sql
-- This will add the missing columns safely
```

### 2. Alternative: Manual Column Addition
If the migration doesn't work, manually add these columns in Supabase SQL Editor:

```sql
-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience_level VARCHAR(20) DEFAULT 'beginner',
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS current_job_title TEXT,
ADD COLUMN IF NOT EXISTS target_job_title TEXT;

-- Update existing profiles with default values
UPDATE public.profiles 
SET 
    interests = COALESCE(interests, '{}'),
    experience_level = COALESCE(experience_level, 'beginner'),
    goals = COALESCE(goals, '{}')
WHERE 
    interests IS NULL 
    OR experience_level IS NULL 
    OR goals IS NULL;
```

### 3. Test the Fix
1. Refresh your application
2. The profile error should be gone
3. You should see basic actions appear automatically

## 🎯 What This Fixes

- ✅ Adds missing `interests` column
- ✅ Adds missing `experience_level` column  
- ✅ Adds missing `goals` column
- ✅ Provides default values for existing profiles
- ✅ Creates basic actions for new users
- ✅ Handles missing columns gracefully

## 🚀 After the Fix

The system will now:
1. **Work without profile errors**
2. **Show basic actions** for new users
3. **Allow profile completion** through the UI
4. **Generate AI insights** once profile is complete

## 🔍 Verification

Check that these columns exist in your `profiles` table:
- `interests` (TEXT[])
- `experience_level` (VARCHAR)
- `goals` (TEXT[])
- `bio` (TEXT)
- `current_job_title` (TEXT)
- `target_job_title` (TEXT)

If you see these columns, the fix is complete! 🎉

