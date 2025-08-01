-- Fix Duplicate Policies After Consolidation
-- Migration: 20250122000003_fix_duplicate_policies.sql
-- This migration removes duplicate policies that remained after the consolidation
-- to ensure only one policy exists per table/action combination.

BEGIN;

-- ============================================================================
-- 1. FIX SUBSCRIPTIONS TABLE DUPLICATE POLICIES
-- ============================================================================

-- Remove the old individual policy that wasn't properly dropped
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

-- Ensure only the consolidated policy exists
-- (The consolidated policy "Users and admins can view subscriptions" should already exist)

-- ============================================================================
-- 2. FIX USER_STATISTICS TABLE DUPLICATE POLICIES
-- ============================================================================

-- Remove the old individual policy that wasn't properly dropped
DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;

-- Ensure only the consolidated policy exists
-- (The consolidated policy "Users and admins can view statistics" should already exist)

-- ============================================================================
-- 3. FIX USERS TABLE DUPLICATE POLICIES
-- ============================================================================

-- Remove the old individual SELECT policy that wasn't properly dropped
DROP POLICY IF EXISTS "Users can view own data" ON public.users;

-- Remove the old individual UPDATE policy that wasn't properly dropped
DROP POLICY IF EXISTS "Users can update own data" ON public.users;

-- Ensure only the consolidated policies exist
-- (The consolidated policies "Users and admins can view user data" and 
--  "Users and admins can update user data" should already exist)

-- ============================================================================
-- 4. VERIFY POLICY CLEANUP
-- ============================================================================

-- Add comments to document the cleanup
COMMENT ON POLICY "Users and admins can view subscriptions" ON public.subscriptions IS 
'Consolidated RLS policy - duplicate individual policies removed for performance';

COMMENT ON POLICY "Users and admins can view statistics" ON public.user_statistics IS 
'Consolidated RLS policy - duplicate individual policies removed for performance';

COMMENT ON POLICY "Users and admins can view user data" ON public.users IS 
'Consolidated RLS policy - duplicate individual policies removed for performance';

COMMENT ON POLICY "Users and admins can update user data" ON public.users IS 
'Consolidated RLS policy - duplicate individual policies removed for performance';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';

COMMIT;

-- ============================================================================
-- MIGRATION SUMMARY
-- ============================================================================
-- This migration fixes duplicate policies that remained after consolidation:
-- 
-- REMOVED DUPLICATE POLICIES:
-- - "Users can view own subscription" from public.subscriptions
-- - "Users can view own statistics" from public.user_statistics  
-- - "Users can view own data" from public.users
-- - "Users can update own data" from public.users
--
-- REMAINING CONSOLIDATED POLICIES:
-- - "Users and admins can view subscriptions" on public.subscriptions
-- - "Users and admins can view statistics" on public.user_statistics
-- - "Users and admins can view user data" on public.users
-- - "Users and admins can update user data" on public.users
--
-- This ensures optimal performance with no duplicate policy evaluations.