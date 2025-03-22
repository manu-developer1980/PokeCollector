import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<{ session: any; error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (signed in, signed out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      console.log("Starting signup process for:", email);

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("email")
        .eq("email", email.trim().toLowerCase())
        .single();

      if (existingUser) {
        return {
          error: {
            message: "Este email ya está registrado. Por favor inicia sesión.",
          },
        };
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Auth error during signup:", authError);
        return { error: authError };
      }

      if (!authData?.user) {
        return {
          error: {
            message: "No se pudo crear el usuario",
          },
        };
      }

      // Wait for database trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verify user creation
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError || !userData) {
        console.error("Error verifying user in database:", userError);
        // Attempt to clean up the auth user if database insert failed
        await supabase.auth.admin.deleteUser(authData.user.id);
        return {
          error: {
            message:
              "Error al crear el perfil de usuario. Por favor, intente nuevamente.",
          },
        };
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error("Unexpected error during signup:", error);
      return {
        error: {
          message: "Error inesperado durante el registro",
        },
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Intentar iniciar sesión directamente
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error("Error en signIn:", error);

        // Manejar diferentes tipos de errores
        if (error.message.includes("Invalid login credentials")) {
          return {
            error: {
              message: "Email o contraseña incorrectos",
            },
          };
        }

        if (error.message.includes("Email not confirmed")) {
          return {
            error: {
              message: "Email not confirmed",
            },
          };
        }

        return { error };
      }

      // Verificar si tenemos datos del usuario
      if (!data.user) {
        return {
          error: {
            message: "No se pudo obtener la información del usuario",
          },
        };
      }

      // Si el usuario no ha confirmado su email
      if (!data.user.email_confirmed_at) {
        return {
          error: {
            message: "Email not confirmed",
          },
        };
      }

      return { data, error: null };
    } catch (error) {
      console.error("Error inesperado en signIn:", error);
      return {
        error: {
          message: "Error inesperado durante el inicio de sesión",
        },
      };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Error during sign out:", error);
        throw error;
      }
      // Limpiar cualquier estado local si es necesario
      setUser(null);
    } catch (error) {
      console.error("Error in signOut:", error);
      throw error;
    }
  };

  const refreshSession = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (!error && session) {
      setUser(session.user);
    }
    return { session, error };
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    refreshSession,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
