-- Asegurarnos que la tabla users tiene las políticas correctas
CREATE TABLE IF NOT EXISTS public.users (
    id uuid NOT NULL PRIMARY KEY,
    full_name text,
    has_seen_onboarding boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Eliminar políticas existentes para evitar conflictos
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.users;

-- Crear nuevas políticas
CREATE POLICY "Users can view their own data" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" 
ON public.users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Enable insert for service role" 
ON public.users FOR INSERT 
WITH CHECK (true);

-- Asegurarse que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Dar permisos necesarios
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;