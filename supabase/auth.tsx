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
      // Primero verificamos si el usuario ya existe
      const { data: existingUser } = await supabase
        .from("users")
        .select("id, email")
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
        console.error("Error durante el registro:", authError);
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error("No user data returned") };
      }

      // Log detallado del estado de verificación
      console.log("Estado de verificación:", {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at,
        confirmationSent: authData.user.confirmation_sent_at,
        identities: authData.user.identities,
        session: authData.session,
      });

      // Si el usuario necesita confirmar su email
      if (!authData.user.email_confirmed_at) {
        return {
          data: {
            ...authData,
            message: "Por favor revisa tu email para verificar tu cuenta.",
          },
          error: null,
        };
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error("Error inesperado durante el registro:", error);
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
