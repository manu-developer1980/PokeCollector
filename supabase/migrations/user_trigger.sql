CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _now TIMESTAMPTZ := now();
    _full_name TEXT;
BEGIN
    -- Log the start of the function and input data
    RAISE LOG 'Starting handle_new_user with data: %', jsonb_build_object(
        'id', NEW.id,
        'email', NEW.email,
        'raw_meta', NEW.raw_user_meta_data
    );

    -- Extract full_name with better error handling
    BEGIN
        _full_name := COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        );
        RAISE LOG 'Extracted full_name: %', _full_name;
    EXCEPTION WHEN OTHERS THEN
        _full_name := split_part(NEW.email, '@', 1);
        RAISE LOG 'Error extracting full_name, using fallback: %', _full_name;
    END;

    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
        RAISE LOG 'User already exists with ID: %, skipping insert', NEW.id;
        RETURN NEW;
    END IF;

    -- Attempt to insert the new user
    BEGIN
        INSERT INTO public.users (
            id,
            email,
            full_name,
            has_seen_onboarding,
            level,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            LOWER(NEW.email),  -- Normalize email to lowercase
            _full_name,
            false,
            'aprendiz',
            _now,
            _now
        );
        
        RAISE LOG 'Successfully created user with ID: %', NEW.id;
        RETURN NEW;
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE LOG 'Unique violation for user: %, continuing', NEW.id;
            RETURN NEW;
        WHEN OTHERS THEN
            RAISE LOG 'Error in handle_new_user - SQLSTATE: %, SQLERRM: %, User Data: %',
                SQLSTATE,
                SQLERRM,
                jsonb_build_object(
                    'id', NEW.id,
                    'email', NEW.email,
                    'full_name', _full_name,
                    'raw_meta', NEW.raw_user_meta_data
                );
            RETURN NULL;  -- Prevent the trigger from proceeding on error
    END;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Ensure proper permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

-- Verify the users table has the correct structure
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
        AND column_name = 'level'
    ) THEN
        ALTER TABLE public.users ADD COLUMN level TEXT DEFAULT 'aprendiz';
    END IF;
END
$$;


