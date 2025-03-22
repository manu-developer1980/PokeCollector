CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    _now timestamp with time zone := now();
    _full_name text;
BEGIN
    -- Mejorar el logging inicial
    RAISE LOG 'handle_new_user: Starting process for user ID: %, Email: %', NEW.id, NEW.email;

    -- Validar y obtener el nombre completo
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'full_name',
        'Usuario ' || substr(NEW.id::text, 1, 8)
    );

    RAISE LOG 'handle_new_user: Processed full_name: %', _full_name;

    -- Validar datos requeridos
    IF NEW.id IS NULL THEN
        RAISE LOG 'handle_new_user: Error - NULL user ID';
        RETURN NULL;
    END IF;

    IF NEW.email IS NULL THEN
        RAISE LOG 'handle_new_user: Error - NULL email';
        RETURN NULL;
    END IF;

    -- Attempt to insert the new user with better error handling
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
            LOWER(NEW.email),
            _full_name,
            false,
            'aprendiz',
            _now,
            _now
        );
        
        RAISE LOG 'handle_new_user: Successfully created user with ID: %, Email: %', NEW.id, NEW.email;
        RETURN NEW;
    EXCEPTION 
        WHEN unique_violation THEN
            RAISE LOG 'handle_new_user: Unique violation for user ID: %, Email: %', NEW.id, NEW.email;
            -- Check if the user already exists
            IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
                RAISE LOG 'handle_new_user: User already exists, returning NEW';
                RETURN NEW;
            ELSE
                RAISE LOG 'handle_new_user: Different unique violation, investigating';
                -- Log more details about the violation
                RAISE LOG 'handle_new_user: Constraint violation details: %', sqlerrm;
                RETURN NULL;
            END IF;
        WHEN OTHERS THEN
            RAISE LOG 'handle_new_user: Unexpected error - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
            RAISE LOG 'handle_new_user: User data - ID: %, Email: %, Full Name: %', 
                NEW.id, 
                NEW.email, 
                _full_name;
            RAISE LOG 'handle_new_user: Raw meta data: %', NEW.raw_user_meta_data;
            RETURN NULL;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger está correctamente configurado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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



