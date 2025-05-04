-- Add profile_photo column to user_profiles table
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255);
