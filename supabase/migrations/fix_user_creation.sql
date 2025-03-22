BEGIN;

-- 1. Primero creamos la función handle_new_user
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
        RAISE; -- Propagate the error
    END;

    RETURN NEW;
END;
$$;

-- 2. Luego creamos la función create_user_subscription
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan_type)
    VALUES (NEW.id, 'aprendiz');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Eliminamos los triggers existentes si existen
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_subscription ON auth.users;

-- 4. Creamos los triggers en el orden correcto
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_subscription
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_subscription();

COMMIT;