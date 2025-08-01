-- Optimize RLS Policies for Performance
-- Migration: 20250122000001_optimize_rls_policies.sql
-- This migration optimizes Row Level Security policies by replacing auth.uid() with (select auth.uid())
-- to prevent re-evaluation for each row, improving query performance at scale.
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

BEGIN;

-- ============================================================================
-- 1. OPTIMIZE USERS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own data" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own data"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = id)
    WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own data"
    ON public.users
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = id);

-- ============================================================================
-- 2. OPTIMIZE COLLECTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can update their own collections" ON public.collections;
DROP POLICY IF EXISTS "Users can delete their own collections" ON public.collections;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can create their own collections"
    ON public.collections
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own collections"
    ON public.collections
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own collections"
    ON public.collections
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own collections"
    ON public.collections
    FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 3. OPTIMIZE COLLECTION_CARDS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own collection cards" ON public.collection_cards;
DROP POLICY IF EXISTS "Users can view their own collection cards" ON public.collection_cards;
DROP POLICY IF EXISTS "Users can update their own collection cards" ON public.collection_cards;
DROP POLICY IF EXISTS "Users can delete their own collection cards" ON public.collection_cards;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can create their own collection cards"
    ON public.collection_cards
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can view their own collection cards"
    ON public.collection_cards
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can update their own collection cards"
    ON public.collection_cards
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = (select auth.uid())
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = (select auth.uid())
        )
    );

CREATE POLICY "Users can delete their own collection cards"
    ON public.collection_cards
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.collections
            WHERE id = collection_id AND user_id = (select auth.uid())
        )
    );

-- ============================================================================
-- 4. OPTIMIZE WISHLIST_CARDS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create their own wishlist cards" ON public.wishlist_cards;
DROP POLICY IF EXISTS "Users can view their own wishlist cards" ON public.wishlist_cards;
DROP POLICY IF EXISTS "Users can update their own wishlist cards" ON public.wishlist_cards;
DROP POLICY IF EXISTS "Users can delete their own wishlist cards" ON public.wishlist_cards;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can create their own wishlist cards"
    ON public.wishlist_cards
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can view their own wishlist cards"
    ON public.wishlist_cards
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own wishlist cards"
    ON public.wishlist_cards
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own wishlist cards"
    ON public.wishlist_cards
    FOR DELETE
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 5. OPTIMIZE SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own subscription"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

-- ============================================================================
-- 6. OPTIMIZE USER_STATISTICS TABLE POLICIES
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can insert own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can update own statistics" ON public.user_statistics;

-- Recreate with optimized auth.uid() calls
CREATE POLICY "Users can view own statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own statistics"
    ON public.user_statistics
    FOR INSERT
    TO authenticated
    WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own statistics"
    ON public.user_statistics
    FOR UPDATE
    TO authenticated
    USING ((select auth.uid()) = user_id)
    WITH CHECK ((select auth.uid()) = user_id);

-- ============================================================================
-- 7. OPTIMIZE SUBSCRIPTION_OVERRIDES TABLE POLICIES
-- ============================================================================

-- Note: The subscription_overrides policies use is_current_user_admin() function
-- which should already be optimized. We'll recreate them to ensure consistency.

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage subscription overrides" ON public.subscription_overrides;

-- Recreate with explicit function call optimization
CREATE POLICY "Admins can manage subscription overrides"
    ON public.subscription_overrides
    FOR ALL
    TO authenticated
    USING ((select public.is_current_user_admin()) = true);

-- ============================================================================
-- 8. ADD PERFORMANCE COMMENTS
-- ============================================================================

-- Add comments explaining the optimization
COMMENT ON POLICY "Users can view own data" ON public.users IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

COMMENT ON POLICY "Users can view own subscription" ON public.subscriptions IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

COMMENT ON POLICY "Users can view their own collections" ON public.collections IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

COMMENT ON POLICY "Users can view their own collection cards" ON public.collection_cards IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

COMMENT ON POLICY "Users can view their own wishlist cards" ON public.wishlist_cards IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

COMMENT ON POLICY "Users can view own statistics" ON public.user_statistics IS 
'Optimized RLS policy using (select auth.uid()) to prevent re-evaluation per row';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- This migration optimizes the following RLS policies for better performance:
-- 
-- USERS TABLE:
-- - Users can view own data
-- - Users can update own data  
-- - Users can insert own data
--
-- COLLECTIONS TABLE:
-- - Users can create their own collections
-- - Users can view their own collections
-- - Users can update their own collections
-- - Users can delete their own collections
--
-- COLLECTION_CARDS TABLE:
-- - Users can create their own collection cards
-- - Users can view their own collection cards
-- - Users can update their own collection cards
-- - Users can delete their own collection cards
--
-- WISHLIST_CARDS TABLE:
-- - Users can create their own wishlist cards
-- - Users can view their own wishlist cards
-- - Users can update their own wishlist cards
-- - Users can delete their own wishlist cards
--
-- SUBSCRIPTIONS TABLE:
-- - Users can view own subscription
--
-- USER_STATISTICS TABLE:
-- - Users can view own statistics
-- - Users can insert own statistics (new)
-- - Users can update own statistics (new)
--
-- SUBSCRIPTION_OVERRIDES TABLE:
-- - Admins can manage subscription overrides
--
-- All policies now use (select auth.uid()) instead of auth.uid() to prevent
-- function re-evaluation for each row, significantly improving query performance
-- at scale as recommended by Supabase documentation.