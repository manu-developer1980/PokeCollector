BEGIN;

-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_updated_at() CASCADE;

-- Create users table without foreign key constraint initially
CREATE TABLE public.users (
    id UUID PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Grant necessary permissions
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO anon;

-- Enable RLS but with a permissive policy for testing
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations during testing"
    ON public.users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create a more detailed trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
    _now TIMESTAMPTZ;
BEGIN
    -- Detailed logging at start
    RAISE LOG 'handle_new_user starting - ID: %, Email: %, Meta: %',
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data;

    -- Get current timestamp
    _now := now();

    -- Extract full_name with detailed logging
    BEGIN
        _full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        );
        RAISE LOG 'Extracted full_name: %', _full_name;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error extracting full_name: % %', SQLSTATE, SQLERRM;
        _full_name := '';
    END;

    -- Attempt insert with detailed logging
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            full_name,
            has_seen_onboarding,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            NEW.email,
            _full_name,
            false,
            _now,
            _now
        );
        RAISE LOG 'Successfully inserted new user with ID: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error inserting user - SQLSTATE: %, SQLERRM: %, Details: %',
            SQLSTATE,
            SQLERRM,
            NEW;
        -- Don't raise exception, let auth continue
    END;

    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable realtime
ALTER publication supabase_realtime ADD TABLE public.users;

COMMIT;  -- End transaction





