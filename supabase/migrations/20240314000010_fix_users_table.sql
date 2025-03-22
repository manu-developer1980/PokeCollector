BEGIN;

-- Recrear la tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Asegurar que los permisos están correctamente configurados
GRANT ALL ON public.users TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Recrear las políticas RLS
CREATE POLICY "Enable insert for registration" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Recrear el trigger para nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
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
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        false,
        now(),
        now()
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recrear el trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Migrar usuarios existentes de auth.users a public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT 
    id,
    email,
    COALESCE(created_at, now()),
    COALESCE(created_at, now())
FROM auth.users
ON CONFLICT (id) DO NOTHING;

COMMIT;