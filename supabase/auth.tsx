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

      // Intentar el registro
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
        console.error("Detailed auth error:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
        });
        return {
          error: {
            message: authError.message || "Error durante el registro",
          },
        };
      }

      if (!authData?.user) {
        console.error("No user data received from signup");
        return {
          error: {
            message: "No se pudo crear el usuario",
          },
        };
      }

      console.log("Signup successful, user created:", authData.user.id);

      // Esperar a que el trigger complete
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Verificar que el usuario se creó correctamente en la tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError) {
        console.error("Error verifying user creation:", userError);
      } else {
        console.log("User verified in database:", userData);
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error("Unexpected error during signup:", error);
      return {
        error: {
          message: error.message || "Error inesperado durante el registro",
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
