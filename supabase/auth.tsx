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

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        console.error("Signup error details:", {
          message: authError.message,
          status: authError.status,
          name: authError.name,
          code: authError?.details?.code,
          isAuthError: authError?.details?.__isAuthError,
        });

        return {
          error: {
            message: authError.message,
            code: authError?.details?.code || "AUTH_ERROR",
            originalError: authError,
          },
        };
      }

      if (!authData?.user) {
        console.error("No user data received from signup");
        return {
          error: {
            message: "Error al crear el usuario",
            code: "NO_USER_DATA",
          },
        };
      }

      // Modificamos la consulta a la tabla users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .maybeSingle();

      if (userError) {
        // Si el error es porque el usuario aún no existe en la tabla, lo creamos
        if (userError.code === "PGRST116") {
          const { error: insertError } = await supabase.from("users").insert([
            {
              id: authData.user.id,
              email: email.trim().toLowerCase(),
              full_name: fullName.trim(),
            },
          ]);

          if (insertError) {
            console.error("Error creating user in database:", insertError);
            return {
              error: {
                message: "Error al crear el perfil de usuario",
                code: "USER_CREATION_FAILED",
                originalError: insertError,
              },
            };
          }
        } else {
          console.error("Error verifying user creation:", userError);
          return {
            error: {
              message: "Error al verificar la creación del usuario",
              code: "VERIFICATION_ERROR",
              originalError: userError,
            },
          };
        }
      }

      return { data: authData, error: null };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      return {
        error: {
          message:
            "Error inesperado durante el registro. Por favor, intenta nuevamente.",
          code: "UNEXPECTED_ERROR",
          originalError: error,
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
