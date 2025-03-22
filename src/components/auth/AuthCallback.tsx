import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando verificación...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus("Procesando enlace de autenticación...");
        console.log("1. Iniciando proceso de autenticación");

        // 1. Intentar obtener la sesión inicial
        const { data: initialSession, error: initialError } =
          await supabase.auth.getSession();

        if (initialError) {
          console.error("Error getting initial session:", initialError);
        } else if (initialSession?.session) {
          console.log(
            "Sesión inicial encontrada:",
            initialSession.session.user.id
          );
          return handleExistingSession(initialSession.session);
        }

        // 2. Procesar tokens de la URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          setStatus("Estableciendo sesión con tokens...");
          console.log("2. Tokens encontrados en URL, tipo:", type);

          try {
            const {
              data: { session },
              error: setSessionError,
            } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (setSessionError) throw setSessionError;
            if (session) {
              console.log("Sesión establecida con tokens de URL");
              return handleExistingSession(session);
            }
          } catch (error) {
            console.error("Error setting session with tokens:", error);
          }
        }

        // 3. Intentos múltiples de obtener sesión
        setStatus("Verificando sesión...");
        console.log("3. Intentando obtener sesión");

        let attempts = 0;
        const maxAttempts = 8; // Aumentamos los intentos
        const delay = 2000; // 2 segundos entre intentos

        while (attempts < maxAttempts) {
          console.log(`Intento ${attempts + 1} de ${maxAttempts}`);

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error(`Error en intento ${attempts + 1}:`, sessionError);
          } else if (session) {
            console.log("Sesión obtenida:", session.user.id);
            return handleExistingSession(session);
          }

          attempts++;
          if (attempts < maxAttempts) {
            setStatus(`Reintentando (${attempts}/${maxAttempts})...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        // 4. Si llegamos aquí, intentar refrescar la sesión una última vez
        try {
          const {
            data: { session },
            error: refreshError,
          } = await supabase.auth.refreshSession();

          if (session) {
            console.log("Sesión obtenida después de refresh");
            return handleExistingSession(session);
          }
          if (refreshError) throw refreshError;
        } catch (error) {
          console.error("Error en refresh final:", error);
        }

        throw new Error("No se pudo establecer la sesión");
      } catch (error: any) {
        console.error("Error en el proceso de callback:", error);
        setError(error.message);
        toast({
          title: "Error de autenticación",
          description:
            "No se pudo verificar tu cuenta. Por favor, intenta iniciar sesión nuevamente.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };

    const handleExistingSession = async (session: any) => {
      try {
        setStatus("Verificando email...");

        if (!session.user.email_confirmed_at) {
          navigate("/login?message=please-verify-email", { replace: true });
          return;
        }

        setStatus("Verificando usuario...");
        const { error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("id", session.user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          throw new Error("Error al verificar usuario");
        }

        setStatus("Inicializando usuario...");
        await initializeUser(session);

        const queryParams = new URLSearchParams(window.location.search);
        const redirectTo = queryParams.get("redirect_to") || "/dashboard";

        toast({
          title: "¡Bienvenido!",
          description: "Tu cuenta ha sido verificada correctamente.",
        });

        navigate(redirectTo, { replace: true });
      } catch (error: any) {
        console.error("Error en handleExistingSession:", error);
        throw error;
      }
    };

    const initializeUser = async (session: any) => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initialize-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ user_id: session.user.id }),
          }
        );

        if (!response.ok) {
          console.error("Error en initialize-user:", await response.json());
        }
      } catch (error) {
        console.error("Error calling initialize-user:", error);
      }
    };

    handleCallback();
  }, [navigate, location, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-xl font-semibold text-red-600">
              Error de verificación
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <p className="mt-2 text-sm text-gray-500">
              Redirigiendo al inicio de sesión...
            </p>
          </>
        ) : (
          <>
            <LoadingSpinner message="Verificando cuenta..." />
            <p className="mt-2 text-gray-600">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
