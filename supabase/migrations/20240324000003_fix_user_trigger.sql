-- Primero, eliminamos el trigger y función existentes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreamos la función con mejor manejo de errores y validaciones
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    raw_full_name text;
BEGIN
    -- Extraer el nombre completo de manera segura
    raw_full_name := COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'full_name',
        'Unknown User'
    );

    -- Insertar en public.users con validaciones
    INSERT INTO public.users (
        id,
        email,
        full_name,
        created_at,
        updated_at,
        has_seen_onboarding
    ) VALUES (
        new.id,
        LOWER(new.email),
        raw_full_name,
        new.created_at,
        new.created_at,
        false
    );

    -- Log successful insertion
    RAISE LOG 'Successfully created user record for %', new.email;
    
    RETURN new;
EXCEPTION WHEN others THEN
    -- Log detailed error information
    RAISE LOG 'Error in handle_new_user for email %: %', new.email, SQLERRM;
    RAISE LOG 'Error details: %', SQLSTATE;
    
    -- Important: Return NEW to allow auth.users insertion to complete
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Asegurar los permisos correctos
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;