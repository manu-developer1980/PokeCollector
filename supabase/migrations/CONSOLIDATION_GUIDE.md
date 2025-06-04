# Migration Consolidation Guide

## Overview

The PokéCollector database migrations have been consolidated from three separate files into a single, optimized migration file for better maintainability and cleaner new installations.

## Migration Files

### ✅ New Consolidated Migration

- **`20250120000020_consolidated_complete_schema.sql`** (1,026 lines)
  - Complete database schema with all features
  - Optimized for performance and maintainability
  - Single source of truth for new installations

### 📁 Previous Migrations (Removed)

The following migrations have been consolidated and removed:

- `20240602000001_consolidated_schema_final.sql` (466 lines) - Core schema
- `20250120000010_consolidated_admin_fixes.sql` (613 lines) - Admin features
- `20250120000011_fix_trigger_schema_issues.sql` (249 lines) - Trigger fixes

## Installation

**For all installations (new and existing):**

```bash
# Apply the consolidated migration
supabase db reset
# This will automatically apply 20250120000020_consolidated_complete_schema.sql
```

**Note**: Since the old migrations have been removed, all installations now use the consolidated migration. This ensures consistency and eliminates potential conflicts between migration versions.

## What's Included in the Consolidated Migration

### 🗄️ **Complete Database Schema**

- All core tables (users, collections, collection_cards, wishlist_cards, subscriptions)
- Admin tables (audit_logs, user_statistics, subscription_overrides)
- Supporting tables (webhook_events, subscription_changes)

### 🔧 **Optimized Functions**

- `handle_new_user()` - User registration without auto-collection creation
- `delete_user_data()` - Complete user data cleanup
- `is_current_user_admin()` - Admin check with RLS optimization
- `update_user_statistics()` - Statistics calculation with proper security
- `admin_get_all_users()` - Paginated admin user listing
- `log_admin_action()` - Audit logging for admin actions

### 🔒 **Security Features**

- Complete Row Level Security (RLS) policies
- Admin access controls
- Proper function security contexts
- Non-recursive policy design

### ⚡ **Performance Optimizations**

- Strategic indexes for all query patterns
- Optimized trigger functions
- Efficient statistics calculation
- Admin dashboard performance enhancements

### 🔄 **Automatic Features**

- User statistics tracking via triggers
- Updated_at column maintenance
- Realtime subscriptions for relevant tables
- Audit logging infrastructure

## Key Improvements Over Previous Migrations

### 1. **Eliminated Redundancy**

- Single function definitions (no duplicates)
- Consolidated trigger logic
- Streamlined RLS policies

### 2. **Enhanced Performance**

- Better index strategy
- Optimized query patterns
- Reduced function call overhead

### 3. **Improved Maintainability**

- Single source of truth
- Clear documentation
- Consistent naming conventions

### 4. **Better Security**

- Non-recursive RLS policies
- Proper SECURITY DEFINER usage
- Enhanced admin controls

## Configuration Notes

### Environment Variables Required

```env
# Stripe configuration (update the hardcoded price ID)
STRIPE_DEFAULT_PRICE_ID=price_1R4KH1EoOyqILXNqxnOSjJHZ
```

### Important Behaviors

- **No Automatic Collection Creation**: Users must manually create collections
- **Admin Access**: First admin must be set manually in the database
- **Statistics**: Automatically calculated and cached for performance

## Validation

After applying the migration, run the validation script:

```bash
psql -f supabase/migrations/validate_migrations.sql
```

## Backup Strategy

Before applying the migration in production:

1. **Create a full database backup**
2. **Test the migration in a staging environment**
3. **Validate all functionality works as expected**
4. **Keep the backup until you're confident the migration is stable**

## Support

For issues with the consolidated migration:

1. Check the validation script output
2. Review the OPTIMIZATION_REPORT.md
3. Ensure all environment variables are set correctly

---

**Note**: This consolidation is designed to be a drop-in replacement that provides the exact same functionality as the previous three migrations combined, but with better performance and maintainability.
