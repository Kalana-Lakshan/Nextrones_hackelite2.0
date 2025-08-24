-- Add missing columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN graduation_year text,
ADD COLUMN module_descriptor_uploaded boolean DEFAULT false,
ADD COLUMN onboarding_completed boolean DEFAULT false;