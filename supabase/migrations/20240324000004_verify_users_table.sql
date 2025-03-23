-- Iniciar transacción
BEGIN;

-- Limpiar objetos existentes
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.users CASCADE;

-- Crear tabla users con estructura mejorada
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    has_seen_onboarding BOOLEAN DEFAULT false NOT NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at);

-- Habilitar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Permisos básicos
GRANT ALL ON public.users TO postgres, service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Política de lectura más permisiva
CREATE POLICY "Allow public read access"
    ON public.users
    FOR SELECT
    TO public
    USING (true);

-- Política de actualización
CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id OR auth.role() = 'service_role')
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

-- Función de trigger mejorada
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    v_full_name TEXT;
    v_default_price_id TEXT := 'price_1R4KH1EoOyqILXNqxnOSjJHZ'; -- Plan Aprendiz
    v_subscription_id UUID;
BEGIN
    -- Log inicio de la función
    RAISE LOG 'handle_new_user: iniciando para usuario % con email %', new.id, new.email;
    
    BEGIN
        -- Extraer nombre de manera segura
        v_full_name := COALESCE(
            new.raw_user_meta_data->>'full_name',
            new.raw_user_meta_data->>'name',
            'Unknown User'
        );
        RAISE LOG 'handle_new_user: nombre extraído: %', v_full_name;

        -- Insertar usuario con ON CONFLICT para manejar duplicados
        INSERT INTO public.users (
            id,
            email,
            full_name,
            created_at,
            updated_at,
            has_seen_onboarding
        ) VALUES (
            new.id,
            LOWER(new.email),
            v_full_name,
            new.created_at,
            new.created_at,
            false
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            updated_at = now();

        RAISE LOG 'handle_new_user: usuario insertado/actualizado exitosamente';

        -- Insertar suscripción inicial solo si no existe
        INSERT INTO public.subscriptions (
            user_id,
            plan_type,
            stripe_price_id,
            status,
            current_period_end,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            new.id,
            'aprendiz',
            v_default_price_id,
            'active',
            new.created_at + INTERVAL '1 month',
            true,
            new.created_at,
            new.created_at
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        GET DIAGNOSTICS v_subscription_id = ROW_COUNT;
        IF v_subscription_id > 0 THEN
            RAISE LOG 'handle_new_user: nueva suscripción creada';
        ELSE
            RAISE LOG 'handle_new_user: suscripción existente encontrada';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'handle_new_user: error en proceso: % - %', SQLERRM, SQLSTATE;
        RETURN new; -- Continuar incluso si hay error
    END;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;



