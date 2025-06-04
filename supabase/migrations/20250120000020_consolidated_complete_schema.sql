-- Consolidated Complete Schema for PokéCollector
-- Migration: 20250120000020_consolidated_complete_schema.sql
-- This migration consolidates all previous migrations into a single, optimized schema
-- Replaces: 20240602000001, 20250120000010, 20250120000011

BEGIN;

-- ============================================================================
-- 1. ENABLE EXTENSIONS AND SETUP
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. CLEANUP - Remove existing objects if they exist (safe for fresh installs)
-- ============================================================================

-- Drop triggers first (safe with IF EXISTS)
DO $$
BEGIN
    -- Drop triggers only if tables exist
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collections') THEN
        DROP TRIGGER IF EXISTS update_collections_updated_at ON public.collections;
        DROP TRIGGER IF EXISTS trigger_collections_stats ON public.collections;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'collection_cards') THEN
        DROP TRIGGER IF EXISTS update_collection_cards_updated_at ON public.collection_cards;
        DROP TRIGGER IF EXISTS trigger_collection_cards_stats ON public.collection_cards;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'wishlist_cards') THEN
        DROP TRIGGER IF EXISTS update_wishlist_cards_updated_at ON public.wishlist_cards;
        DROP TRIGGER IF EXISTS trigger_wishlist_cards_stats ON public.wishlist_cards;
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions') THEN
        DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON public.subscriptions;
    END IF;
END $$;

-- Drop auth trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop functions safely
DROP FUNCTION IF EXISTS public.delete_user_data(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.is_current_user_admin() CASCADE;
DROP FUNCTION IF EXISTS public.admin_get_all_users(integer, integer, text) CASCADE;
DROP FUNCTION IF EXISTS public.log_admin_action(uuid, uuid, text, text, text, jsonb, jsonb, jsonb) CASCADE;
DROP FUNCTION IF EXISTS public.update_user_statistics(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.trigger_update_user_statistics() CASCADE;

-- Drop tables safely (CASCADE will handle dependencies)
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.collection_cards CASCADE;
DROP TABLE IF EXISTS public.wishlist_cards CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.webhook_events CASCADE;
DROP TABLE IF EXISTS public.subscription_changes CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.user_statistics CASCADE;
DROP TABLE IF EXISTS public.subscription_overrides CASCADE;

-- Drop types safely
DROP TYPE IF EXISTS subscription_plan_type CASCADE;

-- ============================================================================
-- 3. CREATE TYPES
-- ============================================================================

CREATE TYPE subscription_plan_type AS ENUM ('aprendiz', 'entrenador', 'maestro');

-- ============================================================================
-- 4. CREATE CORE TABLES
-- ============================================================================

-- Users table with admin capabilities
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    has_seen_onboarding BOOLEAN DEFAULT false,
    level TEXT DEFAULT 'aprendiz',
    preferred_lang TEXT DEFAULT 'es',
    is_admin BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Collections table
CREATE TABLE public.collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Collection cards table
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

-- Wishlist cards table
CREATE TABLE public.wishlist_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    date_added TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions table
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

-- ============================================================================
-- 5. CREATE ADMIN AND AUDIT TABLES
-- ============================================================================

-- Audit logs table for admin actions
CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    action_type TEXT,
    entity_type TEXT NOT NULL,
    resource_type TEXT,
    entity_id TEXT,
    resource_id TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- User statistics table for admin dashboard
CREATE TABLE public.user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_cards INTEGER DEFAULT 0,
    total_collections INTEGER DEFAULT 0,
    total_wishlist_items INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    registration_completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Subscription overrides table for admin manual overrides
CREATE TABLE public.subscription_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    override_type TEXT NOT NULL,
    original_value TEXT,
    override_value TEXT,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- 6. CREATE SUPPORTING TABLES
-- ============================================================================

-- Webhook events table
CREATE TABLE public.webhook_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Subscription changes table
CREATE TABLE public.subscription_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    old_plan subscription_plan_type,
    new_plan subscription_plan_type,
    change_date TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- 7. CREATE PERFORMANCE INDEXES
-- ============================================================================

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup ON public.users(id) WHERE is_admin = true;
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- Collection indexes
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON public.collections(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_collection_id ON public.collection_cards(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_cards_card_id ON public.collection_cards(card_id);

-- Wishlist indexes
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_user_id ON public.wishlist_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_cards_card_id ON public.wishlist_cards(card_id);

-- Admin and audit indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- Statistics indexes
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_activity ON public.user_statistics(last_activity_at DESC);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_subscription_changes_user_id ON public.subscription_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_overrides_user_id ON public.subscription_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_overrides_is_active ON public.subscription_overrides(is_active) WHERE is_active = true;

-- ============================================================================
-- 8. CREATE UTILITY FUNCTIONS
-- ============================================================================

-- Function to update updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if current user is admin (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    false
  );
$$;

-- Function to update user statistics with proper security context
CREATE OR REPLACE FUNCTION public.update_user_statistics(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_statistics (
        user_id,
        total_cards,
        total_collections,
        total_wishlist_items,
        last_activity_at,
        updated_at
    )
    SELECT
        target_user_id,
        COALESCE((
            SELECT COUNT(*)
            FROM public.collection_cards cc
            JOIN public.collections c ON cc.collection_id = c.id
            WHERE c.user_id = target_user_id
        ), 0),
        COALESCE((
            SELECT COUNT(*)
            FROM public.collections
            WHERE user_id = target_user_id
        ), 0),
        COALESCE((
            SELECT COUNT(*)
            FROM public.wishlist_cards
            WHERE user_id = target_user_id
        ), 0),
        now(),
        now()
    ON CONFLICT (user_id)
    DO UPDATE SET
        total_cards = EXCLUDED.total_cards,
        total_collections = EXCLUDED.total_collections,
        total_wishlist_items = EXCLUDED.total_wishlist_items,
        last_activity_at = EXCLUDED.last_activity_at,
        updated_at = now();
END;
$$;

-- Trigger function to update user statistics automatically
CREATE OR REPLACE FUNCTION trigger_update_user_statistics()
RETURNS TRIGGER AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine the user_id based on the table and operation
    IF TG_OP = 'INSERT' THEN
        CASE TG_TABLE_NAME
            WHEN 'collections' THEN
                target_user_id := NEW.user_id;
            WHEN 'wishlist_cards' THEN
                target_user_id := NEW.user_id;
            WHEN 'collection_cards' THEN
                SELECT c.user_id INTO target_user_id
                FROM collections c
                WHERE c.id = NEW.collection_id;
        END CASE;

        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_statistics(target_user_id);
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        CASE TG_TABLE_NAME
            WHEN 'collections' THEN
                target_user_id := OLD.user_id;
            WHEN 'wishlist_cards' THEN
                target_user_id := OLD.user_id;
            WHEN 'collection_cards' THEN
                SELECT c.user_id INTO target_user_id
                FROM collections c
                WHERE c.id = OLD.collection_id;
        END CASE;

        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_statistics(target_user_id);
        END IF;

        RETURN OLD;

    ELSIF TG_OP = 'UPDATE' THEN
        CASE TG_TABLE_NAME
            WHEN 'collections' THEN
                target_user_id := NEW.user_id;
            WHEN 'wishlist_cards' THEN
                target_user_id := NEW.user_id;
            WHEN 'collection_cards' THEN
                SELECT c.user_id INTO target_user_id
                FROM collections c
                WHERE c.id = NEW.collection_id;
        END CASE;

        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_statistics(target_user_id);
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 9. CREATE ADMIN FUNCTIONS
-- ============================================================================

-- RPC function for getting all users (bypasses RLS issues)
CREATE OR REPLACE FUNCTION public.admin_get_all_users(
  page_num integer DEFAULT 1,
  page_size integer DEFAULT 20,
  search_email text DEFAULT ''
)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  is_admin boolean,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz,
  last_login_at timestamptz,
  login_count integer,
  total_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  offset_val integer;
  total_users bigint;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  offset_val := (page_num - 1) * page_size;

  -- Get total count
  SELECT COUNT(*) INTO total_users
  FROM public.users u
  WHERE (search_email = '' OR u.email ILIKE '%' || search_email || '%');

  -- Return paginated results with total count
  RETURN QUERY
  SELECT
    u.id,
    u.email,
    u.full_name,
    u.is_admin,
    u.is_active,
    u.created_at,
    u.updated_at,
    u.last_login_at,
    u.login_count,
    total_users as total_count
  FROM public.users u
  WHERE (search_email = '' OR u.email ILIKE '%' || search_email || '%')
  ORDER BY u.created_at DESC
  LIMIT page_size
  OFFSET offset_val;
END;
$$;

-- RPC function for logging admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  admin_user_id uuid,
  target_user_id uuid,
  action_type text,
  resource_type text,
  resource_id text,
  old_values jsonb DEFAULT NULL,
  new_values jsonb DEFAULT NULL,
  metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  log_id uuid;
BEGIN
  -- Check if current user is admin
  IF NOT public.is_current_user_admin() AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Insert audit log entry
  INSERT INTO public.audit_logs (
    admin_user_id,
    target_user_id,
    action,
    action_type,
    entity_type,
    resource_type,
    entity_id,
    resource_id,
    old_values,
    new_values,
    metadata,
    created_at
  ) VALUES (
    admin_user_id,
    target_user_id,
    action_type,
    action_type,
    resource_type,
    resource_type,
    resource_id,
    resource_id,
    old_values,
    new_values,
    metadata,
    now()
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$;

-- Function for handling new users (without automatic collection creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    _full_name TEXT;
    _now TIMESTAMPTZ;
    _default_price_id TEXT := 'price_1R4KH1EoOyqILXNqxnOSjJHZ'; -- TODO: Move to environment variable
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

    RAISE LOG 'handle_new_user: Starting transaction for user ID: %', NEW.id;

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

        -- Initialize user statistics
        INSERT INTO public.user_statistics (user_id) VALUES (NEW.id);

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

-- Function for deleting user data
CREATE FUNCTION public.delete_user_data(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Delete collection cards first (due to foreign key constraints)
    DELETE FROM public.collection_cards
    WHERE collection_id IN (
        SELECT id FROM public.collections WHERE user_id = user_id_param
    );

    -- Delete collections
    DELETE FROM public.collections WHERE user_id = user_id_param;

    -- Delete wishlist cards
    DELETE FROM public.wishlist_cards WHERE user_id = user_id_param;

    -- Delete subscriptions
    DELETE FROM public.subscriptions WHERE user_id = user_id_param;

    -- Delete subscription changes
    DELETE FROM public.subscription_changes WHERE user_id = user_id_param;

    -- Delete user statistics
    DELETE FROM public.user_statistics WHERE user_id = user_id_param;

    -- Delete subscription overrides
    DELETE FROM public.subscription_overrides WHERE user_id = user_id_param;

    -- Delete user record
    DELETE FROM public.users WHERE id = user_id_param;

    RAISE LOG 'delete_user_data: Deleted all data for user %', user_id_param;
END;
$$;

-- ============================================================================
-- 10. CREATE TRIGGERS
-- ============================================================================

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Triggers for updating updated_at columns
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

-- Triggers for automatic statistics updates
CREATE TRIGGER trigger_collections_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

CREATE TRIGGER trigger_collection_cards_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.collection_cards
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

CREATE TRIGGER trigger_wishlist_cards_stats
    AFTER INSERT OR UPDATE OR DELETE ON public.wishlist_cards
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

-- ============================================================================
-- 11. ENABLE ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_overrides ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 12. CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users table policies
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all users"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all users"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (public.is_current_user_admin() = true)
    WITH CHECK (public.is_current_user_admin() = true);

CREATE POLICY "Users can insert own data"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can do everything with users"
    ON public.users
    FOR ALL
    TO service_role
    USING (true);

-- Collections table policies
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

CREATE POLICY "Admins can view all collections"
    ON public.collections
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

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

-- Collection cards table policies
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

CREATE POLICY "Admins can view all collection cards"
    ON public.collection_cards
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

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

-- Wishlist cards table policies
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

CREATE POLICY "Admins can view all wishlist cards"
    ON public.wishlist_cards
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

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

-- Subscriptions table policies
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true);

-- Subscription changes table policies
CREATE POLICY "Users can view their own subscription changes"
    ON public.subscription_changes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Audit logs table policies
CREATE POLICY "Admins can view all audit logs"
    ON public.audit_logs
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Admins can insert audit logs"
    ON public.audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (public.is_current_user_admin() = true);

CREATE POLICY "Service role can manage audit logs"
    ON public.audit_logs
    FOR ALL
    TO service_role
    USING (true);

-- User statistics table policies
CREATE POLICY "Users can view own statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Service role can manage statistics"
    ON public.user_statistics
    FOR ALL
    TO service_role
    USING (true);

-- Subscription overrides table policies
CREATE POLICY "Admins can view all subscription overrides"
    ON public.subscription_overrides
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Admins can manage subscription overrides"
    ON public.subscription_overrides
    FOR ALL
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Service role can manage subscription overrides"
    ON public.subscription_overrides
    FOR ALL
    TO service_role
    USING (true);

-- ============================================================================
-- 13. GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions on tables
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT ALL ON public.collections TO authenticated;
GRANT ALL ON public.collection_cards TO authenticated;
GRANT ALL ON public.wishlist_cards TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.subscription_changes TO authenticated;
GRANT SELECT ON public.user_statistics TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.subscription_overrides TO authenticated;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on functions
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.delete_user_data(UUID) TO postgres;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users(integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users(integer, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, uuid, text, text, text, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, uuid, text, text, text, jsonb, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.update_user_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_user_statistics(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION trigger_update_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_user_statistics() TO service_role;

-- ============================================================================
-- 14. ENABLE REALTIME
-- ============================================================================

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.collection_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wishlist_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscriptions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.subscription_changes;

-- ============================================================================
-- 15. INITIALIZE DATA AND COMMENTS
-- ============================================================================

-- Initialize statistics for any existing users (in case of migration from existing data)
INSERT INTO public.user_statistics (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Add table comments for documentation
COMMENT ON TABLE public.users IS 'User profiles with admin capabilities and tracking fields';
COMMENT ON TABLE public.collections IS 'User-created card collections. Collections are NOT created automatically.';
COMMENT ON TABLE public.collection_cards IS 'Individual cards within collections with metadata';
COMMENT ON TABLE public.wishlist_cards IS 'Cards that users want to acquire';
COMMENT ON TABLE public.subscriptions IS 'User subscription plans and Stripe integration';
COMMENT ON TABLE public.audit_logs IS 'Logs all administrative actions for audit purposes';
COMMENT ON TABLE public.user_statistics IS 'Cached statistics for users to improve admin dashboard performance';
COMMENT ON TABLE public.subscription_overrides IS 'Admin overrides for subscription limits and features';

-- Add function comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Handles new user creation. Creates user record and initial subscription. NO automatic collection creation.';
COMMENT ON FUNCTION public.delete_user_data(UUID) IS 'Deletes all data associated with a user, including collections, cards, wishlist and subscriptions.';
COMMENT ON FUNCTION public.is_current_user_admin() IS 'Checks if current user is admin, avoiding RLS recursion issues.';
COMMENT ON FUNCTION public.update_user_statistics(UUID) IS 'Updates user statistics with SECURITY DEFINER to bypass RLS.';
COMMENT ON FUNCTION trigger_update_user_statistics() IS 'Trigger function that automatically updates user statistics when data changes.';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;
