import { useState } from "react";
import { useAuth } from "../../../../supabase/auth";
import { supabase } from "../../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link, useLocation } from "react-router-dom";
import AuthLayout from "./AuthLayout";
// import { Loader2 } from "lucide-react"; // No se utiliza
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
// import OnboardingModal from "../onboarding/OnboardingModal"; // Ya no lo necesitamos aquí
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useTranslation } from "react-i18next";

const formSchema = (t: (key: string) => string) => z.object({
  email: z.string().email(t("auth.validation.invalidEmail")),
  password: z.string().min(6, t("auth.validation.passwordLength")),
});

export default function LoginForm() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  // Ya no necesitamos el estado showOnboarding en el LoginForm
  const [showConfirmEmail, setShowConfirmEmail] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState("");
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
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

      if (error) {
        if (error.code === "PGRST116") {
          // No se encontró el usuario, asumimos que necesita ver el onboarding
          return true;
        }
        throw error;
      }
      return !data?.has_seen_onboarding;
    } catch (error) {
      console.error(t("errors.generic"), error);
      return false;
    }
  };

  const onSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
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
            ? t("auth.errors.invalidCredentials")
            : result.error.message;

        form.setError("root", { message: mensajeError });
        toast({
          title: t("auth.errors.loginError"),
          description: mensajeError,
          variant: "destructive",
        });
        return;
      }

      // Éxito en el inicio de sesión
      if ('data' in result && result.data) {
        const userData = result.data as { user: { id: string }, session?: { access_token?: string } };
        if (userData.user) {
          try {
            // Inicializar usuario (opcional - continúa si falla)
            try {
              const response = await fetch(
                `${
                  import.meta.env.VITE_SUPABASE_URL
                }/functions/v1/initialize-user`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${userData.session?.access_token || ''}`,
                    "Content-Type": "application/json",
                    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
                  },
                  mode: "cors",
                  credentials: "include",
                  body: JSON.stringify({
                    user_id: userData.user.id,
                  }),
                }
              );

              if (response.ok) {
                const data = await response.json();
        
              } else {
                console.warn("Initialize-user function not available, continuing without it");
              }
            } catch (initError) {
              console.warn("Initialize-user function not available, continuing without it:", initError);
              // Continuamos sin problemas - la función de inicialización es opcional
            }

            // Verificamos si el usuario necesita onboarding
            const needsOnboarding = await checkOnboardingStatus(
              userData.user.id
            );

            // Si necesita onboarding, guardamos esta información en localStorage
            // para que se muestre en el dashboard
            if (needsOnboarding) {
              localStorage.setItem("needs_onboarding", "true");
            }

            navigate(redirectTo || "/dashboard");
          } catch (error) {
            console.error(t("auth.errors.initError"), error);
            toast({
              title: t("errors.generic"),
              description: t("auth.errors.accountInitError"),
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error(t("auth.errors.loginProcessError"), error);
      toast({
        title: t("auth.errors.loginError"),
        description: t("errors.generic"),
        variant: "destructive",
      });
    } finally {
      // Siempre establecemos isLoading a false al finalizar
      setIsLoading(false);
    }
  };

  // Ya no necesitamos handleOnboardingClose en el LoginForm
  // El onboarding se mostrará en el dashboard

  // Eliminamos la función handlePlansDialogClose ya que no se utiliza

  return (
    <AuthLayout>
      {isLoading ? (
        <div className="w-full max-w-md flex justify-center items-center">
          <LoadingSpinner message={t("auth.accessingAccount")} />
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {t("auth.login")}
            </CardTitle>
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
                      <FormLabel>{t("auth.email")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("auth.emailPlaceholder")}
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
                      <FormLabel>{t("auth.password")}</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          autoComplete="current-password"
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
                  {t("auth.login")}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:underline"
              >
                {t("auth.forgotPassword")}
              </Link>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("auth.dontHaveAccount")}{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:underline"
              >
                {t("auth.signup")}
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Eliminamos el OnboardingModal del LoginForm */}
      <ConfirmDialog
        isOpen={showConfirmEmail}
        onClose={() => setShowConfirmEmail(false)}
        title={t("auth.confirmEmail.title")}
        description={`${t("auth.confirmEmail.description")} ${emailToConfirm} ${t("auth.confirmEmail.checkInbox")}`}
        confirmText={t("common.understood")}
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
