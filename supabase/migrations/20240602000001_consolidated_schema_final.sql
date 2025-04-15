-- Migración consolidada final para PokéCollector
-- Esta migración reemplaza todas las migraciones anteriores y asegura que no se creen colecciones automáticamente

BEGIN;

-- Eliminar objetos existentes para asegurar una instalación limpia
-- Primero eliminamos el trigger en auth.users que es seguro que existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Eliminamos las funciones
DROP FUNCTION IF EXISTS public.delete_user_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Eliminamos las tablas (esto también eliminará los triggers asociados)
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.collection_cards CASCADE;
DROP TABLE IF EXISTS public.wishlist_cards CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.subscription_changes CASCADE;

-- Eliminamos los tipos
DROP TYPE IF EXISTS subscription_plan_type CASCADE;

-- Crear tipos
CREATE TYPE subscription_plan_type AS ENUM ('aprendiz', 'entrenador', 'maestro');

-- Crear tablas
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'aprendiz',
    preferred_lang TEXT DEFAULT 'es',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.collection_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID REFERENCES public.collections(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    condition TEXT DEFAULT 'Near Mint',
    is_foil BOOLEAN DEFAULT false,
    is_first_edition BOOLEAN DEFAULT false,
    notes TEXT,
    name TEXT,
    set_name TEXT,
    image_url TEXT,
    date_added TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.wishlist_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    date_added TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_type subscription_plan_type NOT NULL DEFAULT 'aprendiz',
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    stripe_price_id TEXT NOT NULL,
    status TEXT NOT NULL,
    current_period_end TIMESTAMPTZ NOT NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_plan subscription_plan_type,
    new_plan subscription_plan_type,
    change_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON public.collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON public.collection_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON public.wishlist_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_card_id ON public.wishlist_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON public.subscription_changes(user_id);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para manejar nuevos usuarios (sin creación automática de colecciones)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
    _now TIMESTAMPTZ;
    _default_price_id TEXT := 'price_1R4KH1EoOyqILXNqxnOSjJHZ';
    _preferred_lang TEXT;
BEGIN
    _now := now();
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        'Usuario ' || substr(NEW.id::text, 1, 8)
    );

    _preferred_lang := COALESCE(
        NEW.raw_user_meta_data->>'preferred_lang',
        'es'
    );

    -- Add detailed logging
    RAISE LOG 'handle_new_user: Starting transaction for user ID: %', NEW.id;

    -- Use transaction to ensure both inserts succeed or fail together
    BEGIN
        -- Insert user
        INSERT INTO public.users (
            id,
            email,
            full_name,
            has_seen_onboarding,
            level,
            preferred_lang,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            LOWER(NEW.email),
            _full_name,
            false,
            'aprendiz',
            _preferred_lang,
            _now,
            _now
        );

        RAISE LOG 'handle_new_user: User inserted successfully';

        -- Create initial subscription
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
            NEW.id,
            'aprendiz',
            _default_price_id,
            'active',
            _now + INTERVAL '1 month',
            true,
            _now,
            _now
        );

        RAISE LOG 'handle_new_user: Subscription created successfully';
        RAISE LOG 'handle_new_user: No automatic collection creation - collections must be created manually by the user';

        RETURN NEW;
    EXCEPTION
        WHEN unique_violation THEN
            RAISE LOG 'handle_new_user: Unique violation occurred';
            IF EXISTS (SELECT 1 FROM public.users WHERE id = NEW.id) THEN
                RETURN NEW;
            ELSE
                RAISE LOG 'handle_new_user: Unique violation details: %', SQLERRM;
                RETURN NULL;
            END IF;
        WHEN OTHERS THEN
            RAISE LOG 'handle_new_user: Error occurred - SQLSTATE: %, SQLERRM: %', SQLSTATE, SQLERRM;
            RETURN NULL;
    END;
END;
$$;

-- Función para eliminar datos de usuario
-- Usamos user_id_param como nombre del parámetro para evitar conflictos
CREATE FUNCTION public.delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Eliminar datos de colecciones
    DELETE FROM public.collection_cards
    WHERE collection_id IN (
        SELECT id FROM public.collections WHERE user_id = user_id_param
    );

    DELETE FROM public.collections WHERE user_id = user_id_param;

    -- Eliminar datos de wishlist
    DELETE FROM public.wishlist_cards WHERE user_id = user_id_param;

    -- Eliminar suscripciones
    DELETE FROM public.subscriptions WHERE user_id = user_id_param;

    -- Eliminar cambios de suscripción
    DELETE FROM public.subscription_changes WHERE user_id = user_id_param;

    -- Eliminar usuario
    DELETE FROM public.users WHERE id = user_id_param;

    RAISE LOG 'delete_user_data: Deleted all data for user %', user_id_param;
END;
$$;

-- Crear triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON public.collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_cards_updated_at
    BEFORE UPDATE ON public.collection_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_cards_updated_at
    BEFORE UPDATE ON public.wishlist_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Políticas para collections
CREATE POLICY "Users can create their own collections"
    ON public.collections
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own collections"
    ON public.collections
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON public.collections
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON public.collections
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas para collection_cards
CREATE POLICY "Users can create their own collection cards"
    ON public.collection_cards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own collection cards"
    ON public.collection_cards
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own collection cards"
    ON public.collection_cards
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own collection cards"
    ON public.collection_cards
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = auth.uid()
        )
    );

-- Políticas para wishlist_cards
CREATE POLICY "Users can create their own wishlist cards"
    ON public.wishlist_cards
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own wishlist cards"
    ON public.wishlist_cards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist cards"
    ON public.wishlist_cards
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist cards"
    ON public.wishlist_cards
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Política para que service_role pueda actualizar suscripciones (necesario para webhooks)
CREATE POLICY "Service role can update subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true);

-- Políticas para subscription_changes
CREATE POLICY "Users can view their own subscription changes"
    ON public.subscription_changes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Permisos
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_cards TO authenticated;
GRANT ALL ON public.wishlist_cards TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
GRANT SELECT ON public.subscription_changes TO authenticated;

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO postgres;

-- Habilitar realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_changes;

-- Agregar comentarios para documentación
COMMENT ON FUNCTION public.handle_new_user() IS 'Maneja la creación de nuevos usuarios. Crea un registro de usuario y una suscripción inicial. NO crea colecciones automáticamente - las colecciones deben ser creadas manualmente por el usuario.';
COMMENT ON FUNCTION public.delete_user_data(UUID) IS 'Elimina todos los datos asociados a un usuario, incluyendo colecciones, cartas, wishlist y suscripciones.';
COMMENT ON TABLE public.collections IS 'Colecciones de cartas creadas por los usuarios. Las colecciones NO se crean automáticamente.';

COMMIT;
