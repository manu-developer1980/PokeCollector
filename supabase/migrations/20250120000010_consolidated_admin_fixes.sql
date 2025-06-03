-- Consolidated Admin Panel Fixes
-- Migration: 20250120000010_consolidated_admin_fixes.sql
-- This migration consolidates all admin-related fixes into a single migration

-- ============================================================================
-- 1. ADMIN CHECK FUNCTIONS
-- ============================================================================

-- Create a function to check if current user is admin (avoids RLS recursion)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_current_user_admin() TO service_role;

-- ============================================================================
-- 2. ADMIN TABLES AND SCHEMA
-- ============================================================================

-- Add admin role column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Add admin-related columns for better user management
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create audit_logs table for tracking admin actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'user', 'subscription', 'collection', etc.
    entity_id TEXT,
    old_values JSONB,
    new_values JSONB,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add new columns for compatibility
DO $$
BEGIN
    -- Add action_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'audit_logs' AND column_name = 'action_type') THEN
        ALTER TABLE public.audit_logs ADD COLUMN action_type text;
    END IF;

    -- Add resource_type column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'audit_logs' AND column_name = 'resource_type') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_type text;
    END IF;

    -- Add resource_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name = 'audit_logs' AND column_name = 'resource_id') THEN
        ALTER TABLE public.audit_logs ADD COLUMN resource_id text;
    END IF;
END $$;

-- Create user_statistics table for admin dashboard
CREATE TABLE IF NOT EXISTS public.user_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_cards INTEGER DEFAULT 0,
    total_collections INTEGER DEFAULT 0,
    total_wishlist_items INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,
    registration_completed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create subscription_overrides table for admin manual overrides
CREATE TABLE IF NOT EXISTS public.subscription_overrides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    override_type TEXT NOT NULL, -- 'plan_change', 'limit_override', 'status_change'
    original_value TEXT,
    override_value TEXT,
    reason TEXT,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on admin tables
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_overrides ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. RPC FUNCTIONS FOR ADMIN OPERATIONS
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

-- RPC function for logging admin actions (handles both old and new column names)
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

  -- Insert audit log entry, populating both old and new column names for compatibility
  INSERT INTO public.audit_logs (
    admin_user_id,
    target_user_id,
    action,           -- Old column name (required)
    action_type,      -- New column name
    entity_type,      -- Old column name (if exists)
    resource_type,    -- New column name
    entity_id,        -- Old column name (if exists)
    resource_id,      -- New column name
    old_values,
    new_values,
    metadata,
    created_at
  ) VALUES (
    admin_user_id,
    target_user_id,
    action_type,      -- Populate old column with same value
    action_type,      -- New column
    resource_type,    -- Populate old column with same value
    resource_type,    -- New column
    resource_id,      -- Populate old column with same value
    resource_id,      -- New column
    old_values,
    new_values,
    metadata,
    now()
  ) RETURNING id INTO log_id;

  RETURN log_id;
EXCEPTION
  WHEN undefined_column THEN
    -- Fallback for tables that don't have old column names
    INSERT INTO public.audit_logs (
      admin_user_id,
      target_user_id,
      action_type,
      resource_type,
      resource_id,
      old_values,
      new_values,
      metadata,
      created_at
    ) VALUES (
      admin_user_id,
      target_user_id,
      action_type,
      resource_type,
      resource_id,
      old_values,
      new_values,
      metadata,
      now()
    ) RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.admin_get_all_users(integer, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_all_users(integer, integer, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, uuid, text, text, text, jsonb, jsonb, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(uuid, uuid, text, text, text, jsonb, jsonb, jsonb) TO service_role;

-- ============================================================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can view own data or admins can view all" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data or admins can update all" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Service role can do everything with users" ON public.users;

-- Create clean, non-recursive policies for users table
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

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription or admins can view all" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can do everything with subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

CREATE POLICY "Service role can do everything with subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true);

-- Fix audit_logs policies
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Admins can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Service role can do everything with audit logs" ON public.audit_logs;

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

CREATE POLICY "Service role can do everything with audit logs"
    ON public.audit_logs
    FOR ALL
    TO service_role
    USING (true);

-- Fix user_statistics policies
DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can view own stats or admins can view all" ON public.user_statistics;
DROP POLICY IF EXISTS "Admins can view all statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Service role can do everything with user statistics" ON public.user_statistics;

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

CREATE POLICY "Service role can do everything with user statistics"
    ON public.user_statistics
    FOR ALL
    TO service_role
    USING (true);

-- Fix subscription_overrides policies
DROP POLICY IF EXISTS "Admins can view all subscription overrides" ON public.subscription_overrides;
DROP POLICY IF EXISTS "Admins can manage subscription overrides" ON public.subscription_overrides;
DROP POLICY IF EXISTS "Service role can do everything with subscription overrides" ON public.subscription_overrides;

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

CREATE POLICY "Service role can do everything with subscription overrides"
    ON public.subscription_overrides
    FOR ALL
    TO service_role
    USING (true);

-- Fix collections policies
DROP POLICY IF EXISTS "Users can view own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can view own collections or admins can view all" ON public.collections;
DROP POLICY IF EXISTS "Admins can view all collections" ON public.collections;

CREATE POLICY "Users can view own collections"
    ON public.collections
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all collections"
    ON public.collections
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

-- Fix collection_cards policies
DROP POLICY IF EXISTS "Admins can view all collection cards" ON public.collection_cards;

CREATE POLICY "Admins can view all collection cards"
    ON public.collection_cards
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

-- Fix wishlist_cards policies
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.wishlist_cards;
DROP POLICY IF EXISTS "Users can view own wishlist or admins can view all" ON public.wishlist_cards;
DROP POLICY IF EXISTS "Admins can view all wishlist" ON public.wishlist_cards;

CREATE POLICY "Users can view own wishlist"
    ON public.wishlist_cards
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wishlist"
    ON public.wishlist_cards
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

-- ============================================================================
-- 5. PERMISSIONS AND INDEXES
-- ============================================================================

-- Ensure proper permissions on all tables
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT SELECT ON public.user_statistics TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT SELECT ON public.subscription_overrides TO authenticated;
GRANT SELECT ON public.collections TO authenticated;
GRANT SELECT ON public.collection_cards TO authenticated;
GRANT SELECT ON public.wishlist_cards TO authenticated;

-- Grant full access to service role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ============================================================================
-- 6. UTILITY FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Function to update user statistics
CREATE OR REPLACE FUNCTION update_user_statistics(target_user_id UUID)
RETURNS void AS $$
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
$$ LANGUAGE plpgsql;

-- Trigger to update user statistics when collections/cards change
CREATE OR REPLACE FUNCTION trigger_update_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_user_statistics(
            CASE
                WHEN TG_TABLE_NAME = 'collections' THEN NEW.user_id
                WHEN TG_TABLE_NAME = 'wishlist_cards' THEN NEW.user_id
                WHEN TG_TABLE_NAME = 'collection_cards' THEN (
                    SELECT c.user_id FROM collections c WHERE c.id = NEW.collection_id
                )
            END
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_user_statistics(
            CASE
                WHEN TG_TABLE_NAME = 'collections' THEN OLD.user_id
                WHEN TG_TABLE_NAME = 'wishlist_cards' THEN OLD.user_id
                WHEN TG_TABLE_NAME = 'collection_cards' THEN (
                    SELECT c.user_id FROM collections c WHERE c.id = OLD.collection_id
                )
            END
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic statistics updates
DROP TRIGGER IF EXISTS trigger_collections_stats ON public.collections;
CREATE TRIGGER trigger_collections_stats
    AFTER INSERT OR DELETE ON public.collections
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

DROP TRIGGER IF EXISTS trigger_collection_cards_stats ON public.collection_cards;
CREATE TRIGGER trigger_collection_cards_stats
    AFTER INSERT OR DELETE ON public.collection_cards
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

DROP TRIGGER IF EXISTS trigger_wishlist_cards_stats ON public.wishlist_cards;
CREATE TRIGGER trigger_wishlist_cards_stats
    AFTER INSERT OR DELETE ON public.wishlist_cards
    FOR EACH ROW EXECUTE FUNCTION trigger_update_user_statistics();

-- Grant execute permissions on utility functions
GRANT EXECUTE ON FUNCTION update_user_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_statistics(UUID) TO service_role;

-- ============================================================================
-- 7. PERFORMANCE INDEXES
-- ============================================================================

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup ON public.users(id) WHERE is_admin = true;

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_user_id ON public.audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_user_id ON public.audit_logs(target_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);

-- User management indexes
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON public.users(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- User statistics indexes
CREATE INDEX IF NOT EXISTS idx_user_statistics_user_id ON public.user_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_statistics_last_activity ON public.user_statistics(last_activity_at DESC);

-- Subscription overrides indexes
CREATE INDEX IF NOT EXISTS idx_subscription_overrides_user_id ON public.subscription_overrides(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_overrides_is_active ON public.subscription_overrides(is_active) WHERE is_active = true;

-- ============================================================================
-- 8. DATA INITIALIZATION
-- ============================================================================

-- Initialize statistics for existing users
INSERT INTO public.user_statistics (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Update statistics for all existing users
SELECT update_user_statistics(id) FROM public.users;

-- Add table comments
COMMENT ON TABLE public.audit_logs IS 'Logs all administrative actions for audit purposes';
COMMENT ON TABLE public.user_statistics IS 'Cached statistics for users to improve admin dashboard performance';
COMMENT ON TABLE public.subscription_overrides IS 'Admin overrides for subscription limits and features';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
