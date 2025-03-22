-- Asegurarse de que la tabla users tiene la configuración correcta
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;

-- Crear nuevas políticas
CREATE POLICY "Enable read access for all users"
ON public.users FOR SELECT
USING (true);

CREATE POLICY "Enable insert for service role"
ON public.users FOR INSERT
TO service_role
WITH CHECK (true);

-- Asegurar que el service_role tiene los permisos necesarios
GRANT ALL ON public.users TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Asegurar que la secuencia del ID (si existe) tiene los permisos correctos
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;