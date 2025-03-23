import { useState, useEffect } from "react";
import { useAuth } from "../../supabase/auth";
import { supabase } from "../../supabase/supabase";

interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  updated_at: string;
  has_seen_onboarding: boolean;
}

interface UseUserReturn {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
}

export function useUser(): UseUserReturn {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!authUser?.id) {
      throw new Error("No authenticated user");
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", authUser.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setUser(data);
    } catch (error) {
      console.error("Error updating user:", error);
      setError(
        error instanceof Error ? error : new Error("Error updating user")
      );
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    if (!authUser?.id) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userData = await fetchUser(authUser.id);
      setUser(userData);
    } catch (error) {
      console.error("Error in refetch:", error);
      setError(
        error instanceof Error ? error : new Error("Failed to fetch user")
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [authUser?.id]);

  return {
    user,
    isLoading,
    error,
    refetch,
    updateUser,
  };
}
