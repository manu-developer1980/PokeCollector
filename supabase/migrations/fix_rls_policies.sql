-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Enable insert for authentication only" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Crear nuevas políticas
CREATE POLICY "Enable insert for registration"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Enable email check"
    ON public.users
    FOR SELECT
    USING (true);

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Asegurar que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Otorgar permisos necesarios
GRANT ALL ON public.users TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Verificar que el trigger tiene los permisos correctos
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO anon;