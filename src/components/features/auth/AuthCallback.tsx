import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../../supabase/supabase";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Iniciando verificación...");
  const { t } = useTranslation();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus("Procesando enlace de autenticación...");

        // 1. Verificar si hay tokens en la URL
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken) {
          setStatus("Estableciendo sesión con tokens...");

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
              return handleExistingSession(session);
            }
          } catch (error) {
            console.error("Error setting session with tokens:", error);
          }
        }

        // 2. Intentar obtener la sesión actual
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
        } else if (session) {
          return handleExistingSession(session);
        }

        // 3. Intentos múltiples de obtener sesión
        setStatus("Verificando sesión...");
        let attempts = 0;
        const maxAttempts = 5;
        const delay = 1500;

        while (attempts < maxAttempts) {
          const {
            data: { session: retrySession },
            error: retryError,
          } = await supabase.auth.getSession();

          if (retryError) {
            console.error(`Error en intento ${attempts + 1}:`, retryError);
          } else if (retrySession) {
            return handleExistingSession(retrySession);
          }

          attempts++;
          if (attempts < maxAttempts) {
            setStatus(`Reintentando (${attempts}/${maxAttempts})...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        // 4. Último intento con exchange
        try {
          const queryParams = new URLSearchParams(window.location.search);
          const code = queryParams.get("code");

          if (code) {
            const {
              data: { session: exchangeSession },
              error: exchangeError,
            } = await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) throw exchangeError;
            if (exchangeSession) {
              return handleExistingSession(exchangeSession);
            }
          }
        } catch (error) {
          console.error("Error en intercambio de código:", error);
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
        setStatus("Inicializando usuario y suscripción...");

        const functionsUrl = import.meta.env.VITE_FUNCTIONS_URL || `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
        const response = await fetch(
          `${functionsUrl}/initialize-user`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            credentials: "include",
            mode: "cors",
            body: JSON.stringify({
              user_id: session.user.id,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Error de respuesta" }));
          throw new Error(errorData.error || `Error HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // Usuario inicializado correctamente
      } catch (error) {
        console.error("❌ Error en initializeUser:", error);
        
        // Manejo específico de errores de CORS
        if (error.message.includes('CORS') || error.message.includes('fetch')) {
          console.warn("⚠️ Error de CORS detectado - continuando sin inicialización");
          // No lanzar el error para permitir que el login continúe
          return;
        }
        
        throw error;
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
            <LoadingSpinner message={t("subscription.loading")} />
            <p className="mt-2 text-gray-600">{status}</p>
          </>
        )}
      </div>
    </div>
  );
}
