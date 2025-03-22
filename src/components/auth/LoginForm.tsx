import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import OnboardingModal from "../onboarding/OnboardingModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("has_seen_onboarding")
        .eq("id", userId)
        .single();

      if (error) throw error;
      return !data?.has_seen_onboarding;
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      return false;
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const result = await signIn(data.email, data.password);

      if (result.error) {
        if (result.error.message === "Email not confirmed") {
          setEmailToConfirm(data.email);
          setShowConfirmEmail(true);

          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: data.email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (resendError) throw resendError;
          return;
        }

        const mensajeError =
          result.error.message === "Invalid login credentials"
            ? "Email o contraseña incorrectos"
            : result.error.message;

        form.setError("root", { message: mensajeError });
        toast({
          title: "Error de inicio de sesión",
          description: mensajeError,
          variant: "destructive",
        });
        return;
      }

      // Éxito en el inicio de sesión
      if (result.data?.user) {
        try {
          // Inicializar usuario
          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/initialize-user`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${result.data.session?.access_token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                user_id: result.data.user.id,
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Error initializing user");
          }

          const needsOnboarding = await checkOnboardingStatus(
            result.data.user.id
          );
          if (needsOnboarding) {
            setShowOnboarding(true);
            return;
          }

          toast({
            title: "¡Bienvenido!",
            description: "Has iniciado sesión correctamente.",
          });

          navigate(redirectTo || "/dashboard");
        } catch (error) {
          console.error("Error during user initialization:", error);
          toast({
            title: "Error",
            description: "Hubo un problema al inicializar tu cuenta.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      toast({
        title: "Error de inicio de sesión",
        description:
          "Ha ocurrido un error inesperado. Por favor, intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    // Mostrar planes después del onboarding
  };

  const handlePlansDialogClose = () => {
    // Eliminamos esta función ya que no la usaremos
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.formState.errors.root && (
                <div className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner
                    message="Iniciando sesión..."
                    compact
                  />
                ) : (
                  "Iniciar Sesión"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:underline"
            >
              Regístrate
            </Link>
          </div>
        </CardContent>
      </Card>
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
      />
      <ConfirmDialog
        isOpen={showConfirmEmail}
        onClose={() => setShowConfirmEmail(false)}
        title="Confirma tu email"
        description={
          <>
            <p>
              Tu cuenta aún no ha sido verificada. Hemos enviado un nuevo email
              de confirmación a:
            </p>
            <p className="font-semibold mt-2">{emailToConfirm}</p>
            <p className="mt-2">
              Por favor, revisa tu bandeja de entrada y carpeta de spam.
            </p>
          </>
        }
        confirmLabel="Entendido"
        onConfirm={() => {
          setShowConfirmEmail(false);
          navigate("/confirm-signup", {
            state: { email: emailToConfirm },
            replace: true,
          });
        }}
      />
    </AuthLayout>
  );
}
