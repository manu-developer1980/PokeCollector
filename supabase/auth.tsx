import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { User, Session, AuthError } from "@supabase/supabase-js";
import type { User as AppUser } from "@/types";

interface AuthContextType {
  user: User | null;
  userData: AppUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, language?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);

      // Get the current language from localStorage or use browser language
      const preferredLang =
        localStorage.getItem("preferredLanguage") ||
        (navigator.language.startsWith("es") ? "es" : "en");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            preferred_lang: preferredLang,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Signup error details:", authError);
        return { error: authError };
      }

      if (!authData?.user) {
        console.error("No user data received from signup");
        return {
          error: new Error("Error al crear el usuario") as AuthError,
        };
      }

      // Check if user exists in database
      const { error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (userError && userError.code === "PGRST116") {
        // User doesn't exist, create them
        const { error: insertError } = await supabase.from("users").insert([
          {
            id: authData.user.id,
            email: email.trim().toLowerCase(),
            full_name: fullName.trim(),
            token_identifier: authData.user.id, // Use user ID as token identifier
          },
        ]);

        if (insertError) {
          console.error("Error creating user in database:", insertError);
          return {
            error: new Error("Error al crear el perfil de usuario") as AuthError,
          };
        }
      } else if (userError) {
        console.error("Error verifying user creation:", userError);
        return {
          error: new Error("Error al verificar la creación del usuario") as AuthError,
        };
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      return {
        error: new Error("Error inesperado durante el registro") as AuthError,
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Error en signIn:", error);
        return { error };
      }

      if (!data.user) {
        return {
          error: new Error("No se pudo obtener la información del usuario") as AuthError,
        };
      }

      if (!data.user.email_confirmed_at) {
        return {
          error: new Error("Email not confirmed") as AuthError,
        };
      }

      return { data, error: null };
    } catch (error: any) {
      console.error("Unexpected signIn error:", error);
      return {
        error: new Error("Error inesperado durante el inicio de sesión") as AuthError,
      };
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error signing out:", error);
        return { error };
      }
      setUser(null);
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during sign out:", err);
      const error = err instanceof Error ? err as AuthError : new Error("Unexpected error during sign out") as AuthError;
      return { error };
    }
  };

  const refreshSession = async (): Promise<{ error: AuthError | null }> => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("Error refreshing session:", error);
        return { error };
      }
      return { error: null };
    } catch (err) {
      console.error("Unexpected error during session refresh:", err);
      const error = err instanceof Error ? err as AuthError : new Error("Unexpected error during session refresh") as AuthError;
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
