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
import { PlanUpgradeDialog } from "@/components/subscription/PlanUpgradeDialog";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState("");
  const [showPlansDialog, setShowPlansDialog] = useState(false);
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
      const result = await signIn(
        data.email.trim().toLowerCase(),
        data.password
      );

      if (result.error) {
        if (result.error.message === "Email not confirmed") {
          setEmailToConfirm(data.email);
          setShowConfirmEmail(true);

          // Añadir un retraso antes de intentar reenviar
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const { error: resendError } = await supabase.auth.resend({
            type: "signup",
            email: data.email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (resendError) {
            if (resendError.status === 429) {
              toast({
                title: "Demasiados intentos",
                description:
                  "Por favor, espera unos minutos antes de solicitar otro email de confirmación.",
                variant: "destructive",
              });
            } else {
              throw resendError;
            }
          } else {
            toast({
              title: "Email de confirmación enviado",
              description: "Por favor, revisa tu bandeja de entrada y spam.",
            });
          }
          setIsLoading(false);
          return;
        }

        // Otros errores
        let mensajeError = "Error al iniciar sesión";
        if (result.error.message === "Email o contraseña incorrectos") {
          mensajeError = "Email o contraseña incorrectos";
        } else if (result.error.message.includes("Database error")) {
          mensajeError =
            "Error de conexión con la base de datos. Por favor, intente más tarde.";
        }

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
        const needsOnboarding = await checkOnboardingStatus(
          result.data.user.id
        );
        if (needsOnboarding) {
          setShowOnboarding(true);
          setIsLoading(false);
          return;
        }
      }

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });

      navigate(redirectTo);
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
    setShowPlansDialog(true); // Mostrar planes después del onboarding
  };

  const handlePlansDialogClose = () => {
    setShowPlansDialog(false);
    navigate(redirectTo);
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
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Iniciar Sesión
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
      <PlanUpgradeDialog
        isOpen={showPlansDialog}
        onClose={handlePlansDialogClose}
        currentPlan="APRENDIZ"
        showWelcomeMessage={true}
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
