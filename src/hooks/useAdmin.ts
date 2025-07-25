import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  last_login_at: string | null;
  login_count: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStatistics {
  user_id: string;
  total_cards: number;
  total_collections: number;
  total_wishlist_items: number;
  last_activity_at: string | null;
  registration_completed_at: string | null;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  admin_user_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface SubscriptionOverride {
  id: string;
  user_id: string;
  admin_user_id: string | null;
  override_type: string;
  original_value: string | null;
  override_value: string | null;
  reason: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
    

        // TEMPORARY: Check if this is the known admin user
        // Replace this with your actual admin user ID
        const knownAdminEmails = [
          "manu.developer1980@gmail.com",
          "manuel.rodriguezquiros@kindredgroup.com",
        ];
        const isKnownAdmin = knownAdminEmails.includes(user.email || "");

        if (isKnownAdmin) {
    
          setIsAdmin(true);
          setError(null);
          setIsLoading(false);
          return;
        }

        // Try using the RPC function first
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "is_current_user_admin"
        );

        if (!rpcError && rpcData !== null) {
    
          setIsAdmin(rpcData);
          setError(null);
        } else {
    

          // Fallback to direct query
          const { data, error } = await supabase
            .from("users")
            .select("is_admin")
            .eq("id", user.id)
            .single();

          if (error) {
            console.error("❌ Error checking admin status:", error);
            setError(error);
            setIsAdmin(false);
          } else {
    
            setIsAdmin(data?.is_admin || false);
            setError(null);
          }
        }
      } catch (err) {
        console.error("❌ Error in checkAdminStatus:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Get all users with pagination and filtering
  const getUsers = useCallback(
    async (
      page: number = 1,
      limit: number = 20,
      search?: string,
      filters?: {
        is_admin?: boolean;
        is_active?: boolean;
        plan_type?: string;
      }
    ) => {
  

      // Let the RPC function handle the admin check instead of checking here
      // This avoids the chicken-and-egg problem with RLS policies

      try {
        // Use the new RPC function that bypasses RLS issues
        const { data, error } = await supabase.rpc("admin_get_all_users", {
          page_num: page,
          page_size: limit,
          search_email: search || "",
        });

        if (error) {
          throw error;
        }

        if (!data || data.length === 0) {
          return {
            users: [],
            total: 0,
            page,
            limit,
            totalPages: 0,
          };
        }

        // Get the total count from the first row
        const totalCount = data[0]?.total_count || 0;

        // For each user, get their subscription and statistics data
        const usersWithDetails = await Promise.all(
          data.map(async (user: any) => {
            try {
              // Get subscription data
              const { data: subscriptions } = await supabase
                .from("subscriptions")
                .select("plan_type, status, stripe_subscription_id")
                .eq("user_id", user.id)
                .limit(1);

              // Get user statistics
              const { data: userStats } = await supabase
                .from("user_statistics")
                .select(
                  "total_cards, total_collections, total_wishlist_items, last_activity_at"
                )
                .eq("user_id", user.id)
                .limit(1);

              return {
                ...user,
                subscriptions: subscriptions || [],
                user_statistics: userStats || [],
              };
            } catch (err) {
              console.error(`Error loading details for user ${user.id}:`, err);
              return {
                ...user,
                subscriptions: [],
                user_statistics: [],
              };
            }
          })
        );

        // Apply client-side filters if needed
        let filteredUsers = usersWithDetails;

        if (filters?.is_admin !== undefined) {
          filteredUsers = filteredUsers.filter(
            (user) => user.is_admin === filters.is_admin
          );
        }
        if (filters?.is_active !== undefined) {
          filteredUsers = filteredUsers.filter(
            (user) => user.is_active === filters.is_active
          );
        }
        if (filters?.plan_type) {
          filteredUsers = filteredUsers.filter((user) =>
            user.subscriptions.some(
              (sub: any) => sub.plan_type === filters.plan_type
            )
          );
        }

        return {
          users: filteredUsers,
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        };
      } catch (err) {
        console.error("Error fetching users:", err);
        throw err;
      }
    },
    [isAdmin]
  );

  // Get user details by ID
  const getUserById = useCallback(
    async (userId: string) => {
      // Let the database RLS policies handle the admin check

      try {
        const { data, error } = await supabase
          .from("users")
          .select(
            `
          *,
          subscriptions(*),
          user_statistics(*),
          collections(id, name, created_at),
          wishlist_cards(id, card_id, created_at)
        `
          )
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Error fetching user details:", err);
        throw err;
      }
    },
    [isAdmin]
  );

  // Update user
  const updateUser = useCallback(
    async (userId: string, updates: Partial<AdminUser>) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get current user data for audit log
        const { data: currentUser } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        // Update user
        const { data, error } = await supabase
          .from("users")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "update_user",
          "user",
          userId,
          currentUser,
          data
        );

        return data;
      } catch (err) {
        console.error("Error updating user:", err);
        throw err;
      }
    },
    [isAdmin, user]
  );

  // Delete user
  const deleteUser = useCallback(
    async (userId: string, reason?: string) => {
      // Let the database RLS policies handle the admin check

      try {
        // Get user data for audit log
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        // Call the delete-user function
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              user_id: userId,
              admin_user_id: user!.id,
              reason,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete user");
        }

        // Log the action
        await logAdminAction(
          user!.id,
          userId,
          "delete_user",
          "user",
          userId,
          userData,
          null,
          { reason }
        );

        return true;
      } catch (err) {
        console.error("Error deleting user:", err);
        throw err;
      }
    },
    [isAdmin, user]
  );

  // Log admin action
  const logAdminAction = useCallback(
    async (
      adminUserId: string,
      targetUserId: string | null,
      action: string,
      entityType: string,
      entityId?: string | null,
      oldValues?: any,
      newValues?: any,
      metadata?: any
    ) => {
      try {
        const { data, error } = await supabase.rpc("log_admin_action", {
          admin_user_id: adminUserId,
          target_user_id: targetUserId,
          action_type: action,
          resource_type: entityType,
          resource_id: entityId || "",
          old_values: oldValues || null,
          new_values: newValues || null,
          metadata: metadata || null,
        });

        if (error) {
          console.error("Error logging admin action:", error);
          throw error;
        }

        return data;
      } catch (err) {
        console.error("Error in logAdminAction:", err);
        throw err;
      }
    },
    []
  );

  // Get audit logs
  const getAuditLogs = useCallback(
    async (
      page: number = 1,
      limit: number = 50,
      filters?: {
        admin_user_id?: string;
        target_user_id?: string;
        action?: string;
        entity_type?: string;
        date_from?: string;
        date_to?: string;
      }
    ) => {
      // Let the database RLS policies handle the admin check

      try {
        let query = supabase
          .from("audit_logs")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply filters
        if (filters?.admin_user_id) {
          query = query.eq("admin_user_id", filters.admin_user_id);
        }
        if (filters?.target_user_id) {
          query = query.eq("target_user_id", filters.target_user_id);
        }
        if (filters?.action) {
          query = query.eq("action", filters.action);
        }
        if (filters?.entity_type) {
          query = query.eq("entity_type", filters.entity_type);
        }
        if (filters?.date_from) {
          query = query.gte("created_at", filters.date_from);
        }
        if (filters?.date_to) {
          query = query.lte("created_at", filters.date_to);
        }

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          throw error;
        }

        return {
          logs: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        };
      } catch (err) {
        console.error("Error fetching audit logs:", err);
        throw err;
      }
    },
    [isAdmin]
  );

  return {
    isAdmin,
    isLoading,
    error,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    logAdminAction,
    getAuditLogs,
  };
};
