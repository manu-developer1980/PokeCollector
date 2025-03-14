-- Asegurarnos que la tabla users existe y tiene la estructura correcta
CREATE TABLE IF NOT EXISTS public.users (
    id uuid REFERENCES auth.users(id) PRIMARY KEY,
    full_name text,
    has_seen_onboarding boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Asegurarnos que los permisos están correctamente configurados
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para la tabla users
CREATE POLICY "Users can view their own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger para manejar created_at y updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();