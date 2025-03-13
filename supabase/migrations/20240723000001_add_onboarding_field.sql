-- Add has_seen_onboarding field to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_seen_onboarding BOOLEAN DEFAULT FALSE;

-- Enable realtime for users table
alter publication supabase_realtime add table users;
