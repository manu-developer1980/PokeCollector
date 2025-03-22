BEGIN;

-- First, ensure RLS is enabled
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for users to own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable insert for users" ON subscriptions;
DROP POLICY IF EXISTS "Enable update for users on own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Enable full access for service role" ON subscriptions;

-- Create a single, simple read policy for authenticated users
CREATE POLICY "Allow users to read own subscriptions"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Create a policy for service role
CREATE POLICY "Allow service role full access"
    ON subscriptions
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Ensure proper grants
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT ON subscriptions TO authenticated;

COMMIT;
