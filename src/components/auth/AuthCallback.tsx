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
        // 1. Procesar el enlace de autenticación
        setStatus("Procesando enlace de autenticación...");
        console.log("1. Iniciando proceso de autenticación");

        const { data: initialSession, error: linkError } =
          await supabase.auth.getSession();
        if (linkError) {
          console.error("Error processing auth link:", linkError);
          throw linkError;
        }

        // Si ya tenemos una sesión válida, la usamos directamente
        if (initialSession?.session) {
          console.log(
            "Sesión encontrada inmediatamente:",
            initialSession.session.user.id
          );
          return handleExistingSession(initialSession.session);
        }

        // 2. Si no hay sesión inmediata, intentar recuperar tokens de la URL
        setStatus("Verificando tokens...");
        console.log("2. Buscando tokens en la URL");

        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");

        if (accessToken && refreshToken) {
          console.log(
            "Tokens encontrados en URL, intentando establecer sesión"
          );
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
        }

        // 3. Si no hay tokens en la URL, intentar obtener la sesión varias veces
        setStatus("Intentando obtener sesión...");
        console.log("3. Intentando obtener sesión múltiples veces");

        let currentSession = null;
        let attempts = 0;
        const maxAttempts = 5; // Aumentamos los intentos

        while (!currentSession && attempts < maxAttempts) {
          console.log(`Intento ${attempts + 1} de ${maxAttempts}`);
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Error en intento de obtener sesión:", sessionError);
          }

          if (session) {
            currentSession = session;
            console.log(
              "Sesión obtenida después de intentos:",
              session.user.id
            );
            return handleExistingSession(session);
          }

          attempts++;
          if (attempts < maxAttempts) {
            setStatus(
              `Reintentando obtener sesión (${attempts}/${maxAttempts})...`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Aumentamos el tiempo entre intentos
          }
        }

        throw new Error(
          "No se pudo establecer la sesión después de múltiples intentos"
        );
      } catch (error: any) {
        console.error("Error en el proceso de callback:", error);
        setError(error.message);
        toast({
          title: "Error de autenticación",
          description:
            "Hubo un problema al verificar tu cuenta. Por favor, intenta de nuevo.",
          variant: "destructive",
        });
        navigate("/login", { replace: true });
      }
    };

    const handleExistingSession = async (session: any) => {
      try {
        setStatus("Verificando email...");
        console.log("4. Verificando confirmación de email");

        if (!session.user.email_confirmed_at) {
          console.log("Email no confirmado");
          navigate("/login?message=please-verify-email", { replace: true });
          return;
        }

        setStatus("Verificando usuario en base de datos...");
        console.log("5. Verificando datos de usuario");

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (userError && userError.code !== "PGRST116") {
          console.error("Error al obtener datos de usuario:", userError);
          throw new Error("Error al obtener datos del usuario");
        }

        setStatus("Inicializando usuario...");
        console.log("6. Inicializando usuario");

        const { data, error } = await supabase.functions.invoke(
          "initialize-user",
          {
            body: { user_id: session.user.id },
          }
        );

        if (error) {
          console.error("Error en initialize-user:", {
            message: error.message,
            details: error,
            userId: session.user.id,
          });

          // Intento alternativo usando fetch directo
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initialize-user`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                user_id: session.user.id,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en fetch directo:", errorData);
          }
        } else {
          console.log("Usuario inicializado correctamente:", data);
        }

        setStatus("Completando verificación...");
        console.log("7. Proceso completado, redirigiendo");

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

    handleCallback();
  }, [navigate, location, toast]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">
            Error de verificación
          </h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <p className="mt-2 text-sm text-gray-500">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner message="Verificando cuenta..." />

        <p className="mt-2 text-gray-600">{status}</p>
      </div>
    </div>
  );
}
