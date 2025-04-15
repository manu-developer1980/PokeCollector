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
