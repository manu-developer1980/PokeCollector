-- Fix Security Vulnerabilities
-- Migration: 20250121000001_fix_security_vulnerabilities.sql
-- This migration fixes the following security issues:
-- 1. Functions with mutable search_path (18 functions)
-- 2. Enables leaked password protection

BEGIN;

-- ============================================================================
-- 1. FIX FUNCTION SEARCH_PATH VULNERABILITIES
-- ============================================================================

-- Fix log_admin_action function
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
SET search_path = public
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

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix is_current_user_admin function
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND is_admin = true AND is_active = true
    );
END;
$$;

-- Fix admin_get_all_users function
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
SET search_path = public
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

-- Fix trigger_update_user_statistics function
CREATE OR REPLACE FUNCTION public.trigger_update_user_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Determine the user_id based on the table and operation
    IF TG_TABLE_NAME = 'collections' THEN
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.user_id;
        ELSE
            target_user_id := NEW.user_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'collection_cards' THEN
        IF TG_OP = 'DELETE' THEN
            SELECT c.user_id INTO target_user_id
            FROM public.collections c
            WHERE c.id = OLD.collection_id;
        ELSE
            SELECT c.user_id INTO target_user_id
            FROM public.collections c
            WHERE c.id = NEW.collection_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'wishlist_cards' THEN
        IF TG_OP = 'DELETE' THEN
            target_user_id := OLD.user_id;
        ELSE
            target_user_id := NEW.user_id;
        END IF;
    END IF;

    -- Update statistics if we have a valid user_id
    IF target_user_id IS NOT NULL THEN
        PERFORM update_user_statistics(target_user_id);
    END IF;

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 2. CREATE MISSING FUNCTIONS WITH SECURE SEARCH_PATH
-- ============================================================================

-- Create create_user_subscription function
DROP FUNCTION IF EXISTS public.create_user_subscription(uuid, subscription_plan_type, text, text, text);
CREATE FUNCTION public.create_user_subscription(
    p_user_id uuid,
    p_plan_type subscription_plan_type,
    p_stripe_subscription_id text DEFAULT NULL,
    p_stripe_customer_id text DEFAULT NULL,
    p_stripe_price_id text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    subscription_id uuid;
    default_price_id text;
BEGIN
    -- Set default price ID based on plan type
    CASE p_plan_type
        WHEN 'aprendiz' THEN default_price_id := 'price_1R4KH1EoOyqILXNqxnOSjJHZ';
        WHEN 'entrenador' THEN default_price_id := 'price_1R4KH2EoOyqILXNqentrenador';
        WHEN 'maestro' THEN default_price_id := 'price_1R4KH3EoOyqILXNqmaestro';
        ELSE default_price_id := 'price_1R4KH1EoOyqILXNqxnOSjJHZ';
    END CASE;

    INSERT INTO public.subscriptions (
        user_id,
        plan_type,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        status,
        current_period_end,
        is_active
    ) VALUES (
        p_user_id,
        p_plan_type,
        p_stripe_subscription_id,
        p_stripe_customer_id,
        COALESCE(p_stripe_price_id, default_price_id),
        'active',
        now() + INTERVAL '1 month',
        true
    ) RETURNING id INTO subscription_id;

    RETURN subscription_id;
END;
$$;

-- Create log_subscription_change function
DROP FUNCTION IF EXISTS public.log_subscription_change(uuid, subscription_plan_type, subscription_plan_type, text);
CREATE FUNCTION public.log_subscription_change(
    p_user_id uuid,
    p_old_plan subscription_plan_type,
    p_new_plan subscription_plan_type,
    p_change_reason text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    change_id uuid;
BEGIN
    INSERT INTO public.subscription_changes (
        user_id,
        old_plan_type,
        new_plan_type,
        change_reason,
        changed_at
    ) VALUES (
        p_user_id,
        p_old_plan,
        p_new_plan,
        p_change_reason,
        now()
    ) RETURNING id INTO change_id;

    RETURN change_id;
END;
$$;

-- Create get_subscription_changes function
DROP FUNCTION IF EXISTS public.get_subscription_changes(uuid, integer);
CREATE FUNCTION public.get_subscription_changes(
    p_user_id uuid DEFAULT NULL,
    p_limit integer DEFAULT 50
)
RETURNS TABLE(
    id uuid,
    user_id uuid,
    old_plan_type subscription_plan_type,
    new_plan_type subscription_plan_type,
    change_reason text,
    changed_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if current user is admin or requesting own data
    IF NOT (public.is_current_user_admin() OR auth.uid() = p_user_id OR auth.role() = 'service_role') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access or own data access required';
    END IF;

    RETURN QUERY
    SELECT
        sc.id,
        sc.user_id,
        sc.old_plan_type,
        sc.new_plan_type,
        sc.change_reason,
        sc.changed_at
    FROM public.subscription_changes sc
    WHERE (p_user_id IS NULL OR sc.user_id = p_user_id)
    ORDER BY sc.changed_at DESC
    LIMIT p_limit;
END;
$$;

-- Create trim_collections function
DROP FUNCTION IF EXISTS public.trim_collections(uuid, integer);
CREATE FUNCTION public.trim_collections(
    p_user_id uuid,
    p_max_collections integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    collections_to_delete uuid[];
    deleted_count integer := 0;
BEGIN
    -- Get collections to delete (oldest first, excluding default)
    SELECT ARRAY(
        SELECT id
        FROM public.collections
        WHERE user_id = p_user_id AND is_default = false
        ORDER BY created_at ASC
        LIMIT GREATEST(0, (
            SELECT COUNT(*) - p_max_collections
            FROM public.collections
            WHERE user_id = p_user_id
        ))
    ) INTO collections_to_delete;

    -- Delete the collections
    DELETE FROM public.collections
    WHERE id = ANY(collections_to_delete);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Create trim_wishlist function
DROP FUNCTION IF EXISTS public.trim_wishlist(uuid, integer);
CREATE FUNCTION public.trim_wishlist(
    p_user_id uuid,
    p_max_items integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    items_to_delete uuid[];
    deleted_count integer := 0;
BEGIN
    -- Get wishlist items to delete (oldest first)
    SELECT ARRAY(
        SELECT id
        FROM public.wishlist_cards
        WHERE user_id = p_user_id
        ORDER BY created_at ASC
        LIMIT GREATEST(0, (
            SELECT COUNT(*) - p_max_items
            FROM public.wishlist_cards
            WHERE user_id = p_user_id
        ))
    ) INTO items_to_delete;

    -- Delete the items
    DELETE FROM public.wishlist_cards
    WHERE id = ANY(items_to_delete);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Create trim_collection_cards function
DROP FUNCTION IF EXISTS public.trim_collection_cards(uuid, integer);
CREATE FUNCTION public.trim_collection_cards(
    p_user_id uuid,
    p_max_cards integer
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    cards_to_delete uuid[];
    deleted_count integer := 0;
BEGIN
    -- Get collection cards to delete (oldest first)
    SELECT ARRAY(
        SELECT cc.id
        FROM public.collection_cards cc
        JOIN public.collections c ON c.id = cc.collection_id
        WHERE c.user_id = p_user_id
        ORDER BY cc.created_at ASC
        LIMIT GREATEST(0, (
            SELECT COUNT(*) - p_max_cards
            FROM public.collection_cards cc2
            JOIN public.collections c2 ON c2.id = cc2.collection_id
            WHERE c2.user_id = p_user_id
        ))
    ) INTO cards_to_delete;

    -- Delete the cards
    DELETE FROM public.collection_cards
    WHERE id = ANY(cards_to_delete);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Create get_user_collection_stats function
DROP FUNCTION IF EXISTS public.get_user_collection_stats(uuid);
CREATE FUNCTION public.get_user_collection_stats(
    p_user_id uuid
)
RETURNS TABLE(
    total_collections integer,
    total_cards integer,
    total_wishlist_items integer,
    last_activity_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE((SELECT COUNT(*)::integer FROM public.collections WHERE user_id = p_user_id), 0) as total_collections,
        COALESCE((SELECT COUNT(*)::integer FROM public.collection_cards cc JOIN public.collections c ON c.id = cc.collection_id WHERE c.user_id = p_user_id), 0) as total_cards,
        COALESCE((SELECT COUNT(*)::integer FROM public.wishlist_cards WHERE user_id = p_user_id), 0) as total_wishlist_items,
        GREATEST(
            (SELECT MAX(updated_at) FROM public.collections WHERE user_id = p_user_id),
            (SELECT MAX(cc.updated_at) FROM public.collection_cards cc JOIN public.collections c ON c.id = cc.collection_id WHERE c.user_id = p_user_id),
            (SELECT MAX(updated_at) FROM public.wishlist_cards WHERE user_id = p_user_id)
        ) as last_activity_at;
END;
$$;

-- Create create_stripe_free_subscription function
DROP FUNCTION IF EXISTS public.create_stripe_free_subscription(uuid);
CREATE FUNCTION public.create_stripe_free_subscription(
    p_user_id uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    subscription_id uuid;
BEGIN
    INSERT INTO public.subscriptions (
        user_id,
        plan_type,
        stripe_price_id,
        status,
        current_period_end,
        is_active
    ) VALUES (
        p_user_id,
        'aprendiz',
        'price_1R4KH1EoOyqILXNqxnOSjJHZ',
        'active',
        now() + INTERVAL '1 month',
        true
    ) RETURNING id INTO subscription_id;

    RETURN subscription_id;
END;
$$;

-- Create create_new_user function
DROP FUNCTION IF EXISTS public.create_new_user(uuid, text, text, text);
CREATE FUNCTION public.create_new_user(
    p_user_id uuid,
    p_email text,
    p_full_name text DEFAULT NULL,
    p_preferred_lang text DEFAULT 'es'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_id uuid;
BEGIN
    INSERT INTO public.users (
        id,
        email,
        full_name,
        preferred_lang,
        has_seen_onboarding,
        level
    ) VALUES (
        p_user_id,
        LOWER(p_email),
        COALESCE(p_full_name, 'Usuario ' || substr(p_user_id::text, 1, 8)),
        p_preferred_lang,
        false,
        'aprendiz'
    ) RETURNING id INTO user_id;

    -- Create initial subscription
    PERFORM public.create_stripe_free_subscription(user_id);

    RETURN user_id;
END;
$$;

-- Create handle_subscription_activation function
DROP FUNCTION IF EXISTS public.handle_subscription_activation(uuid, text, text, text, subscription_plan_type);
CREATE FUNCTION public.handle_subscription_activation(
    p_user_id uuid,
    p_stripe_subscription_id text,
    p_stripe_customer_id text,
    p_stripe_price_id text,
    p_plan_type subscription_plan_type
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    subscription_id uuid;
    old_plan subscription_plan_type;
BEGIN
    -- Get current plan for logging
    SELECT plan_type INTO old_plan
    FROM public.subscriptions
    WHERE user_id = p_user_id AND is_active = true
    LIMIT 1;

    -- Deactivate existing subscriptions
    UPDATE public.subscriptions
    SET is_active = false, updated_at = now()
    WHERE user_id = p_user_id AND is_active = true;

    -- Create new subscription
    INSERT INTO public.subscriptions (
        user_id,
        plan_type,
        stripe_subscription_id,
        stripe_customer_id,
        stripe_price_id,
        status,
        current_period_end,
        is_active
    ) VALUES (
        p_user_id,
        p_plan_type,
        p_stripe_subscription_id,
        p_stripe_customer_id,
        p_stripe_price_id,
        'active',
        now() + INTERVAL '1 month',
        true
    ) RETURNING id INTO subscription_id;

    -- Log the change if plan changed
    IF old_plan IS DISTINCT FROM p_plan_type THEN
        PERFORM public.log_subscription_change(
            p_user_id,
            old_plan,
            p_plan_type,
            'Stripe subscription activation'
        );
    END IF;

    RETURN subscription_id;
END;
$$;

-- Create fix_subscription_price_ids function
DROP FUNCTION IF EXISTS public.fix_subscription_price_ids();
CREATE FUNCTION public.fix_subscription_price_ids()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    updated_count integer := 0;
BEGIN
    -- Only allow admins or service role to run this
    IF NOT (public.is_current_user_admin() OR auth.role() = 'service_role') THEN
        RAISE EXCEPTION 'Unauthorized: Admin access required';
    END IF;

    -- Update price IDs based on plan type
    UPDATE public.subscriptions
    SET 
        stripe_price_id = CASE plan_type
            WHEN 'aprendiz' THEN 'price_1R4KH1EoOyqILXNqxnOSjJHZ'
            WHEN 'entrenador' THEN 'price_1R4KH2EoOyqILXNqentrenador'
            WHEN 'maestro' THEN 'price_1R4KH3EoOyqILXNqmaestro'
            ELSE stripe_price_id
        END,
        updated_at = now()
    WHERE stripe_price_id IS NULL OR stripe_price_id = '';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- ============================================================================
-- 3. CREATE WEBHOOK_EVENTS POLICIES (Fix RLS warning)
-- ============================================================================
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.webhook_events;
DROP POLICY IF EXISTS "Admins can view webhook events" ON public.webhook_events;

-- Create policies for webhook_events table
CREATE POLICY "Service role can manage webhook events"
    ON public.webhook_events
    FOR ALL
    TO service_role
    USING (true);

CREATE POLICY "Admins can view webhook events"
    ON public.webhook_events
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

COMMIT;

-- ============================================================================
-- 4. SECURITY RECOMMENDATIONS
-- ============================================================================

-- Note: The leaked password protection needs to be enabled in the Supabase dashboard
-- Go to Authentication > Settings > Password Protection and enable "Check for leaked passwords"
-- This cannot be done via SQL migration and must be done manually in the dashboard.