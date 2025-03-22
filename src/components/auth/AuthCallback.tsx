import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }

        // Verificar si el usuario está confirmado
        if (session?.user) {
          console.log("Verificación de usuario:", {
            id: session.user.id,
            email: session.user.email,
            emailConfirmed: session.user.email_confirmed_at,
            lastSignIn: session.user.last_sign_in_at,
          });

          // Verificar el estado en la base de datos
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
          }

          // Si el email está confirmado, inicializar el usuario
          if (session.user.email_confirmed_at) {
            try {
              // Llamar a la función edge initialize-user
              const response = await fetch(
                `${
                  import.meta.env.VITE_SUPABASE_URL
                }/functions/v1/initialize-user`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    user_id: session.user.id,
                  }),
                }
              );

              const data = await response.json();
              console.log("Initialize user response:", data);

              if (!response.ok) {
                throw new Error(data.error || "Error initializing user");
              }

              // Si todo sale bien, redirigir al dashboard
              navigate("/dashboard");
            } catch (error) {
              console.error("Error initializing user:", error);
              toast({
                title: "Error",
                description:
                  "Hubo un problema al inicializar tu cuenta. Por favor, contacta a soporte.",
                variant: "destructive",
              });
              navigate("/login");
            }
          } else {
            navigate("/login?message=please-verify-email");
          }
        } else {
          navigate("/login?message=verification-failed");
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
        navigate("/login?message=error");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verificando cuenta...</h2>
        <p className="mt-2">Por favor espere un momento.</p>
      </div>
    </div>
  );
}
