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
    email TEXT,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'aprendiz',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
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
    collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    date_added TIMESTAMPTZ DEFAULT now(),
    condition TEXT,
    notes TEXT,
    is_foil BOOLEAN DEFAULT FALSE,
    is_first_edition BOOLEAN DEFAULT FALSE
);

CREATE TABLE public.wishlist_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_user_card UNIQUE (user_id, card_id)
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
    stripe_event_id TEXT UNIQUE
);

CREATE TABLE public.subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
    previous_plan subscription_plan_type,
    new_plan subscription_plan_type,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_collections_user_id ON collections(user_id);
CREATE INDEX idx_collection_cards_collection_id ON collection_cards(collection_id);
CREATE INDEX idx_wishlist_cards_user_id ON wishlist_cards(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_processed_at ON webhook_events(processed_at);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

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
        split_part(NEW.email, '@', 1)
    );

    -- Add detailed logging
    RAISE LOG 'Attempting to create user with ID: %, Email: %, Full Name: %',
        NEW.id,
        NEW.email,
        _full_name;

    -- Start transaction
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
            LOWER(NEW.email),  -- Normalize email to lowercase
            _full_name,
            false,
            'aprendiz',
            _now,
            _now
        );

        -- Create initial subscription with required stripe_price_id
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

        RETURN NEW;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user - SQLSTATE: %, SQLERRM: %, User Data: %',
            SQLSTATE,
            SQLERRM,
            jsonb_build_object(
                'id', NEW.id,
                'email', NEW.email,
                'full_name', _full_name,
                'raw_meta', NEW.raw_user_meta_data
            );
        RETURN NULL;  -- Prevent the trigger from proceeding on error
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

-- RLS Policies
CREATE POLICY "Enable email check" ON public.users
    FOR SELECT
    USING (true);

CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for registration" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.role() = 'service_role');

CREATE POLICY "Users can manage their collections" ON public.collections
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their collection cards" ON public.collection_cards
    FOR ALL USING (
        collection_id IN (
            SELECT id FROM public.collections WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage their wishlist" ON public.wishlist_cards
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their subscriptions" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_cards TO authenticated;
GRANT ALL ON public.wishlist_cards TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_cards;

-- Ensure proper permissions for functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_data() TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_data() TO postgres;

COMMIT;

