BEGIN;

-- First, drop all existing policies for the users table
DROP POLICY IF EXISTS "Enable email check" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

-- Create new, simplified policies
CREATE POLICY "Enable insert for registration"
    ON public.users
    FOR INSERT
    WITH CHECK (
        auth.uid() = id 
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.users TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;

COMMIT;