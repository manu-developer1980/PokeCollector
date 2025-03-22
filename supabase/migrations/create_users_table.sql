-- Crear la tabla users si no existe
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'aprendiz',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Asegurarse que RLS está activado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear índices necesarios
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);