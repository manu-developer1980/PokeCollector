BEGIN;

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own subscriptions
CREATE POLICY "Users can read their own subscriptions"
    ON public.subscriptions
    FOR SELECT
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
