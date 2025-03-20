import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import { useToast } from "@/components/ui/use-toast";

export default function AuthCallback() {
  const navigate = useNavigate();

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
          } else {
            console.log("User data:", userData);
          }

          // Si el email está confirmado, redirigir al dashboard
          if (session.user.email_confirmed_at) {
            navigate("/dashboard");
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
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verificando cuenta...</h2>
        <p className="mt-2">Por favor espere un momento.</p>
      </div>
    </div>
  );
}
