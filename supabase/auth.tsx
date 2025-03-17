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
      // Log pre-signup
      console.log("Iniciando signup con:", { email, fullName });

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

      // Log detallado de la respuesta
      console.log("Respuesta completa de signup:", JSON.stringify(authData, null, 2));

      if (authError) {
        console.error("Error detallado de signup:", authError);
        return { error: authError };
      }

      if (!authData.user) {
        console.error("No se recibieron datos de usuario");
        return { error: new Error("No user data returned") };
      }

      // Verificar si se envió el email de confirmación
      if (authData.user.confirmation_sent_at) {
        console.log("Email de confirmación enviado en:", authData.user.confirmation_sent_at);
      } else {
        console.warn("No se detectó envío de email de confirmación");
      }

      // Crear el perfil en users con más logging
      try {
        const { error: profileError } = await supabase
          .from("users")
          .insert([
            {
              id: authData.user.id,
              email: authData.user.email,
              full_name: fullName,
              has_seen_onboarding: false,
            },
          ])
          .single();

        if (profileError) {
          console.error("Error al crear perfil:", profileError);
          return { error: profileError };
        }

        console.log("Perfil de usuario creado exitosamente");
      } catch (profileError) {
        console.error("Error inesperado al crear perfil:", profileError);
        return { error: profileError };
      }

      return { data: authData, error: null };
    } catch (error) {
      console.error("Error inesperado durante todo el proceso:", error);
      return {
        error: {
          message: "Error inesperado durante el registro",
        },
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
        return { error };
      }

      // Verificar si el email está confirmado
      if (!data.user?.email_confirmed_at) {
        return {
          error: {
            message: "EMAIL_NOT_CONFIRMED",
          },
        };
      }

      return { data, error: null };
    } catch (error) {
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

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
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
