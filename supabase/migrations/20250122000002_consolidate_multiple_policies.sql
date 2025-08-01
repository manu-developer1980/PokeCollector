-- Consolidate Multiple Permissive Policies for Performance
-- Migration: 20250122000002_consolidate_multiple_policies.sql
-- This migration consolidates multiple permissive RLS policies into single policies
-- to improve query performance by reducing the number of policy evaluations.
-- See: https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

BEGIN;

-- ============================================================================
-- 1. CONSOLIDATE SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Drop existing multiple policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Create single consolidated policy
CREATE POLICY "Users and admins can view subscriptions"
    ON public.subscriptions
    FOR SELECT
    TO authenticated
    USING (
        (select auth.uid()) = user_id OR 
        (select public.is_current_user_admin()) = true
    );

-- ============================================================================
-- 2. CONSOLIDATE USER_STATISTICS TABLE POLICIES
-- ============================================================================

-- Drop existing multiple policies
DROP POLICY IF EXISTS "Admins can view all statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;

-- Create single consolidated policy
CREATE POLICY "Users and admins can view statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING (
        (select auth.uid()) = user_id OR 
        (select public.is_current_user_admin()) = true
    );

-- ============================================================================
-- 3. CONSOLIDATE USERS TABLE POLICIES
-- ============================================================================

-- Drop existing multiple SELECT policies
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Create single consolidated SELECT policy
CREATE POLICY "Users and admins can view user data"
    ON public.users
    FOR SELECT
    TO authenticated
    USING (
        (select auth.uid()) = id OR 
        (select public.is_current_user_admin()) = true
    );

-- Drop existing multiple UPDATE policies
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Create single consolidated UPDATE policy
CREATE POLICY "Users and admins can update user data"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (
        (select auth.uid()) = id OR 
        (select public.is_current_user_admin()) = true
    )
    WITH CHECK (
        (select auth.uid()) = id OR 
        (select public.is_current_user_admin()) = true
    );

-- ============================================================================
-- 4. ADD PERFORMANCE COMMENTS
-- ============================================================================

-- Add comments explaining the consolidation
COMMENT ON POLICY "Users and admins can view subscriptions" ON public.subscriptions IS 
'Consolidated RLS policy combining user and admin access to reduce policy evaluation overhead';

COMMENT ON POLICY "Users and admins can view statistics" ON public.user_statistics IS 
'Consolidated RLS policy combining user and admin access to reduce policy evaluation overhead';

COMMENT ON POLICY "Users and admins can view user data" ON public.users IS 
'Consolidated RLS policy combining user and admin access to reduce policy evaluation overhead';

COMMENT ON POLICY "Users and admins can update user data" ON public.users IS 
'Consolidated RLS policy combining user and admin access to reduce policy evaluation overhead';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- This migration consolidates multiple permissive RLS policies to improve performance:
-- 
-- SUBSCRIPTIONS TABLE:
-- - Consolidated "Admins can view all subscriptions" + "Users can view own subscription"
--   into "Users and admins can view subscriptions"
--
-- USER_STATISTICS TABLE:
-- - Consolidated "Admins can view all statistics" + "Users can view own statistics"
--   into "Users and admins can view statistics"
--
-- USERS TABLE:
-- - Consolidated "Admins can view all users" + "Users can view own data"
--   into "Users and admins can view user data"
-- - Consolidated "Admins can update all users" + "Users can update own data"
--   into "Users and admins can update user data"
--
-- Benefits:
-- - Reduces the number of policy evaluations per query
-- - Improves query performance by eliminating multiple permissive policies
-- - Maintains the same security model with better performance
-- - Uses optimized (select auth.uid()) and (select public.is_current_user_admin()) calls