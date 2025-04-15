-- Eliminar políticas existentes para la tabla users
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;

-- Asegurarnos que RLS está activado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear política para SELECT
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'service_role');

-- Crear política para UPDATE
CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Crear política para INSERT
CREATE POLICY "Users can insert own data"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Crear política para que service_role pueda hacer todo
CREATE POLICY "Service role can do everything with users"
    ON public.users
    FOR ALL
    TO service_role
    USING (true);

-- Asegurarnos que los permisos están correctamente configurados
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;
