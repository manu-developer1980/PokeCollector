BEGIN;

-- Drop existing objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.collection_cards CASCADE;
DROP TABLE IF EXISTS public.wishlist_cards CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.subscription_changes CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_soft_delete() CASCADE;
DROP FUNCTION IF EXISTS public.trim_collection_cards() CASCADE;
DROP FUNCTION IF EXISTS public.trim_collections() CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_data() CASCADE;
DROP TYPE IF EXISTS subscription_plan_type CASCADE;

-- Create types
CREATE TYPE subscription_plan_type AS ENUM ('aprendiz', 'entrenador', 'maestro');

-- Create tables
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'aprendiz',
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON public.collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON public.collection_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON public.wishlist_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_card_id ON public.wishlist_cards(card_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON public.subscription_changes(user_id);

-- Create functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
    _now TIMESTAMPTZ;
    _default_price_id TEXT := 'price_1R4KH1EoOyqILXNqxnOSjJHZ'; -- Default Aprendiz plan price ID
BEGIN
    _now := now();
    _full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        'Usuario ' || substr(NEW.id::text, 1, 8)
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
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            LOWER(NEW.email),
            _full_name,
            false,
            'aprendiz',
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

CREATE OR REPLACE FUNCTION public.delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id_param) THEN
        RAISE EXCEPTION 'Usuario no encontrado';
    END IF;

    DELETE FROM public.wishlist_cards WHERE user_id = user_id_param;
    DELETE FROM public.collection_cards WHERE collection_id IN (
        SELECT id FROM public.collections WHERE user_id = user_id_param
    );
    DELETE FROM public.collections WHERE user_id = user_id_param;
    DELETE FROM public.subscriptions WHERE user_id = user_id_param;
    DELETE FROM public.users WHERE id = user_id_param;
END;
$$;

-- Create triggers
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Set up RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
DROP POLICY IF EXISTS "Enable email check" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for registration" ON public.users;
DROP POLICY IF EXISTS "Users can read their own data" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.users;

CREATE POLICY "Enable insert for registration"
    ON public.users
    FOR INSERT
    WITH CHECK (
        auth.uid() = id 
        OR auth.role() = 'service_role'
        OR auth.role() = 'anon'
    );

CREATE POLICY "Users can view own profile"
    ON public.users
    FOR SELECT
    USING (
        auth.uid() = id 
        OR auth.role() = 'service_role'
    );

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- RLS Policies for other tables
CREATE POLICY "Users can view own wishlist cards" ON public.wishlist_cards
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist cards" ON public.wishlist_cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist cards" ON public.wishlist_cards
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist cards" ON public.wishlist_cards
    FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_cards TO authenticated;
GRANT ALL ON public.wishlist_cards TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
GRANT ALL ON public.subscription_changes TO service_role;
GRANT SELECT ON public.subscription_changes TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_changes;

-- Function permissions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO postgres;

-- Trigger para actualizar updated_at
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

-- Modificar la tabla collection_cards para incluir los campos faltantes
ALTER TABLE public.collection_cards 
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS set_name TEXT,
    ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMIT;

