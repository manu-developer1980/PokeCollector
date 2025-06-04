-- Migration Validation Script
-- Run this script to validate that all migrations have been applied correctly
-- Works with both the consolidated migration (20250120000020) and the individual migrations

-- Check if all required tables exist
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    required_tables TEXT[] := ARRAY[
        'users', 'collections', 'collection_cards', 'wishlist_cards',
        'subscriptions', 'webhook_events', 'subscription_changes',
        'audit_logs', 'user_statistics', 'subscription_overrides'
    ];
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE 'All required tables exist ✓';
    END IF;
END $$;

-- Check if all required functions exist
DO $$
DECLARE
    missing_functions TEXT[] := ARRAY[]::TEXT[];
    function_name TEXT;
    required_functions TEXT[] := ARRAY[
        'handle_new_user', 'delete_user_data', 'update_updated_at_column',
        'is_current_user_admin', 'admin_get_all_users', 'log_admin_action',
        'update_user_statistics', 'trigger_update_user_statistics'
    ];
BEGIN
    FOREACH function_name IN ARRAY required_functions
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' AND routine_name = function_name
        ) THEN
            missing_functions := array_append(missing_functions, function_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE EXCEPTION 'Missing functions: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE 'All required functions exist ✓';
    END IF;
END $$;

-- Check if all required indexes exist
DO $$
DECLARE
    missing_indexes TEXT[] := ARRAY[]::TEXT[];
    index_name TEXT;
    required_indexes TEXT[] := ARRAY[
        'idx_users_email', 'idx_subscriptions_user_id', 'idx_collection_cards_collection_id',
        'idx_wishlist_cards_user_id', 'idx_users_is_admin', 'idx_audit_logs_created_at'
    ];
BEGIN
    FOREACH index_name IN ARRAY required_indexes
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' AND indexname = index_name
        ) THEN
            missing_indexes := array_append(missing_indexes, index_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE EXCEPTION 'Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE 'All required indexes exist ✓';
    END IF;
END $$;

-- Check RLS is enabled on all required tables
DO $$
DECLARE
    tables_without_rls TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    rls_tables TEXT[] := ARRAY[
        'users', 'collections', 'collection_cards', 'wishlist_cards',
        'subscriptions', 'audit_logs', 'user_statistics', 'subscription_overrides'
    ];
BEGIN
    FOREACH table_name IN ARRAY rls_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = table_name 
            AND rowsecurity = true
        ) THEN
            tables_without_rls := array_append(tables_without_rls, table_name);
        END IF;
    END LOOP;
    
    IF array_length(tables_without_rls, 1) > 0 THEN
        RAISE EXCEPTION 'Tables without RLS: %', array_to_string(tables_without_rls, ', ');
    ELSE
        RAISE NOTICE 'RLS enabled on all required tables ✓';
    END IF;
END $$;

-- Test key functions
DO $$
BEGIN
    -- Test admin check function
    PERFORM public.is_current_user_admin();
    RAISE NOTICE 'Admin check function works ✓';
    
    -- Test statistics function (with a dummy UUID)
    PERFORM public.update_user_statistics('00000000-0000-0000-0000-000000000000'::UUID);
    RAISE NOTICE 'Statistics update function works ✓';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Function test failed: %', SQLERRM;
END $$;

-- Summary
SELECT 
    'Migration validation completed successfully! All components are in place.' as status,
    now() as validated_at;
