BEGIN;

-- Eliminar el trigger de soft delete si existe
DROP TRIGGER IF EXISTS soft_delete_users ON public.users;

-- Eliminar la función de soft delete
DROP FUNCTION IF EXISTS handle_soft_delete();

-- Eliminar la columna deleted_at de la tabla users
ALTER TABLE public.users DROP COLUMN IF EXISTS deleted_at;

-- Actualizar la función handle_new_user para remover la lógica de soft delete
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
    -- Get current timestamp
    _now := now();

    -- Extract full_name
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    );

    -- Insert new user
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

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user - SQLSTATE: %, SQLERRM: %',
        SQLSTATE,
        SQLERRM;
    RETURN NEW;
END;
$$;

COMMIT;