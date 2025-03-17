-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY,
    user_id text GENERATED ALWAYS AS (id::text) STORED UNIQUE,
    email text,
    name text,
    full_name text,
    avatar_url text,
    has_seen_onboarding boolean DEFAULT false,
    subscription_status text DEFAULT 'inactive',
    credits integer DEFAULT 0,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    deleted_at timestamptz DEFAULT NULL
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    polar_id text,
    polar_price_id text,
    status text DEFAULT 'inactive',
    plan_type text DEFAULT 'free',
    current_period_end timestamptz,
    cancel_at_period_end boolean DEFAULT false,
    canceled_at timestamptz,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    description text,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    is_default boolean DEFAULT false
);

-- Create collection_cards table
CREATE TABLE IF NOT EXISTS public.collection_cards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id uuid REFERENCES collections(id) ON DELETE CASCADE,
    card_id text NOT NULL,
    quantity integer DEFAULT 1,
    date_added timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    condition text,
    notes text,
    is_foil boolean DEFAULT false,
    is_first_edition boolean DEFAULT false
);

-- Create wishlist_cards table
CREATE TABLE IF NOT EXISTS public.wishlist_cards (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    card_id text NOT NULL,
    date_added timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes text,
    priority smallint DEFAULT 1,
    CONSTRAINT unique_user_card UNIQUE (user_id, card_id)
);

-- Create functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION handle_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        UPDATE public.users
        SET deleted_at = timezone('utc'::text, now())
        WHERE id = OLD.id;
        RETURN NULL;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_user_subscription(
    user_id_param UUID,
    plan_type_param TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO subscriptions (
        user_id,
        status,
        plan_type,
        current_period_end,
        cancel_at_period_end
    ) VALUES (
        user_id_param,
        CASE WHEN plan_type_param = 'free' THEN 'active' ELSE 'pending' END,
        plan_type_param,
        NULL,
        false
    );
END;
$$;

-- Create triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
    BEFORE UPDATE ON collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER soft_delete_users
    BEFORE DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_soft_delete();

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_cards ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Enable insert for registration"
    ON users FOR INSERT
    WITH CHECK (
        auth.role() = 'anon' OR 
        auth.role() = 'authenticated' OR 
        auth.role() = 'service_role' OR 
        auth.uid() = id
    );

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (
        auth.uid() = id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (
        auth.uid() = id OR 
        auth.role() = 'service_role'
    );

-- Create policies for subscriptions
CREATE POLICY "Enable subscription creation during signup"
    ON subscriptions
    FOR INSERT
    WITH CHECK (
        auth.role() = 'service_role'
        OR (auth.role() = 'authenticated' AND auth.uid() = user_id)
        OR auth.role() = 'anon'
    );

CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    )
    WITH CHECK (
        auth.uid() = user_id OR 
        auth.role() = 'service_role'
    );

-- Create policies for collections and cards
CREATE POLICY "Users can view their own collections"
    ON collections FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own collections"
    ON collections FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own collections"
    ON collections FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own collections"
    ON collections FOR DELETE
    USING (auth.uid() = user_id);

-- Collection cards policies
CREATE POLICY "Users can view their own collection cards"
    ON collection_cards FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own collection cards"
    ON collection_cards FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own collection cards"
    ON collection_cards FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete their own collection cards"
    ON collection_cards FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM collections
        WHERE collections.id = collection_cards.collection_id
        AND collections.user_id = auth.uid()
    ));

-- Wishlist cards policies
CREATE POLICY "Users can view their own wishlist cards"
    ON wishlist_cards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist cards"
    ON wishlist_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wishlist cards"
    ON wishlist_cards FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist cards"
    ON wishlist_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;
GRANT ALL ON subscriptions TO service_role;
GRANT SELECT, INSERT, UPDATE ON subscriptions TO authenticated;
GRANT INSERT ON subscriptions TO anon;
GRANT EXECUTE ON FUNCTION create_user_subscription TO authenticated, anon;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.users (
    id,
    has_seen_onboarding,
    subscription_status,
    updated_at
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions (
    id,
    user_id,
    status,
    current_period_end,
    cancel_at_period_end
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_cards;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_has_seen_onboarding ON public.users(has_seen_onboarding);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON wishlist_cards(user_id);

-- Set replica identity for realtime
ALTER TABLE collection_cards REPLICA IDENTITY FULL;
ALTER TABLE collections REPLICA IDENTITY FULL;





