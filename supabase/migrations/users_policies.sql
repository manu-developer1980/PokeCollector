-- Recrear políticas de seguridad para la tabla users
BEGIN;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update access for users based on id" ON public.users;

-- Política de lectura
CREATE POLICY "Enable read access for all users"
    ON public.users
    FOR SELECT
    USING (true);

-- Política de inserción
CREATE POLICY "Enable insert access for authenticated users"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Política de actualización
CREATE POLICY "Enable update access for users based on id"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Otorgar permisos necesarios
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.users TO anon, authenticated;
GRANT ALL ON public.users TO service_role;

COMMIT;
