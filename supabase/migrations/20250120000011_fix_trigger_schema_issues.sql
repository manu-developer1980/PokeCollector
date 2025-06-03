-- Fix trigger schema issues and RLS policies
-- This migration fixes the database triggers that are causing "record has no field" errors
-- and resolves RLS policy violations on user_statistics table

-- ============================================================================
-- 1. DROP EXISTING PROBLEMATIC TRIGGERS AND POLICIES
-- ============================================================================

-- Drop existing triggers that are causing issues
DROP TRIGGER IF EXISTS trigger_collections_stats ON public.collections;
DROP TRIGGER IF EXISTS trigger_collection_cards_stats ON public.collection_cards;
DROP TRIGGER IF EXISTS trigger_wishlist_cards_stats ON public.wishlist_cards;

-- Drop the problematic function
DROP FUNCTION IF EXISTS trigger_update_user_statistics();

-- Drop existing problematic RLS policies on user_statistics table
DROP POLICY IF EXISTS "Users can view own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can update own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Users can insert own statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Admins can view all statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "Service role can manage statistics" ON public.user_statistics;
DROP POLICY IF EXISTS "System can manage user statistics" ON public.user_statistics;

-- ============================================================================
-- 2. CREATE PROPER RLS POLICIES FOR USER_STATISTICS
-- ============================================================================

-- Policy for users to view their own statistics
CREATE POLICY "Users can view own statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy for users to insert their own statistics (for initial creation)
CREATE POLICY "Users can insert own statistics"
    ON public.user_statistics
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own statistics
CREATE POLICY "Users can update own statistics"
    ON public.user_statistics
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy for admins to view all statistics
CREATE POLICY "Admins can view all statistics"
    ON public.user_statistics
    FOR SELECT
    TO authenticated
    USING (public.is_current_user_admin() = true);

-- Policy for service role to manage all statistics (needed for triggers)
CREATE POLICY "Service role can manage statistics"
    ON public.user_statistics
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- 3. CREATE FIXED UPDATE_USER_STATISTICS FUNCTION
-- ============================================================================

-- Update the function to use SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION update_user_statistics(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    card_count INTEGER;
    collection_count INTEGER;
    wishlist_count INTEGER;
BEGIN
    -- Get counts for the user
    SELECT COUNT(*) INTO collection_count
    FROM collections
    WHERE user_id = target_user_id;

    SELECT COUNT(*) INTO card_count
    FROM collection_cards cc
    JOIN collections c ON c.id = cc.collection_id
    WHERE c.user_id = target_user_id;

    SELECT COUNT(*) INTO wishlist_count
    FROM wishlist_cards
    WHERE user_id = target_user_id;

    -- Insert or update the statistics
    INSERT INTO user_statistics (
        user_id,
        total_cards,
        total_collections,
        total_wishlist_items,
        last_activity_at,
        updated_at
    ) VALUES (
        target_user_id,
        card_count,
        collection_count,
        wishlist_count,
        now(),
        now()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        total_cards = EXCLUDED.total_cards,
        total_collections = EXCLUDED.total_collections,
        total_wishlist_items = EXCLUDED.total_wishlist_items,
        last_activity_at = EXCLUDED.last_activity_at,
        updated_at = EXCLUDED.updated_at;
END;
$$;

-- ============================================================================
-- 4. CREATE FIXED TRIGGER FUNCTION
-- ============================================================================

-- Create a new trigger function that properly handles the schema
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
                -- Get user_id from the collections table
                SELECT c.user_id INTO target_user_id 
                FROM collections c 
                WHERE c.id = NEW.collection_id;
        END CASE;
        
        -- Update statistics for the target user
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
                -- Get user_id from the collections table
                SELECT c.user_id INTO target_user_id 
                FROM collections c 
                WHERE c.id = OLD.collection_id;
        END CASE;
        
        -- Update statistics for the target user
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
                -- Get user_id from the collections table
                SELECT c.user_id INTO target_user_id 
                FROM collections c 
                WHERE c.id = NEW.collection_id;
        END CASE;
        
        -- Update statistics for the target user
        IF target_user_id IS NOT NULL THEN
            PERFORM update_user_statistics(target_user_id);
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. RECREATE TRIGGERS WITH PROPER CONFIGURATION
-- ============================================================================

-- Create triggers for automatic statistics updates
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
-- 6. GRANT PERMISSIONS
-- ============================================================================

-- Grant execute permissions on the trigger function
GRANT EXECUTE ON FUNCTION trigger_update_user_statistics() TO authenticated;
GRANT EXECUTE ON FUNCTION trigger_update_user_statistics() TO service_role;

-- Grant execute permissions on the update function
GRANT EXECUTE ON FUNCTION update_user_statistics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_statistics(UUID) TO service_role;

-- ============================================================================
-- 7. ENSURE RLS IS ENABLED AND REFRESH STATISTICS
-- ============================================================================

-- Make sure RLS is enabled on user_statistics
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- Update statistics for all existing users to ensure consistency
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM public.users LOOP
        PERFORM update_user_statistics(user_record.id);
    END LOOP;
END $$;

-- Add comments
COMMENT ON FUNCTION trigger_update_user_statistics() IS 'Fixed trigger function that properly handles schema differences between tables';
COMMENT ON FUNCTION update_user_statistics(UUID) IS 'Updates user statistics with SECURITY DEFINER to bypass RLS';

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';
