CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _now TIMESTAMPTZ := now();
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        has_seen_onboarding,
        created_at,
        updated_at,
        level
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        false,
        _now,
        _now,
        'aprendiz'
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user - SQLSTATE: %, SQLERRM: %, User Data: %',
        SQLSTATE,
        SQLERRM,
        row_to_json(NEW);
    RETURN NEW;
END;
$$;

-- Asegurar que el trigger está habilitado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();