import { useState } from "react";
import { useAuth } from "../../../../supabase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./AuthLayout";
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
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import EmailExistsModal from "./EmailExistsModal";
// Añadir esta importación
import { useTranslation } from "react-i18next";

const formSchema = (t: any) =>
  z
    .object({
      email: z.string().email(t("auth.validation.invalidEmail")),
      fullName: z.string().min(1, t("auth.validation.nameRequired")),
      password: z.string().min(6, t("auth.validation.passwordLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("auth.validation.passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

export default function SignUpForm() {
  // Añadir esta línea
  const { t } = useTranslation();

  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [existingEmail, setExistingEmail] = useState("");
  const { toast } = useToast();
  const { signUp } = useAuth();

  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema(t)),
    defaultValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<ReturnType<typeof formSchema>>) => {
    setIsLoading(true);

    try {
      const result = await signUp(data.email, data.password, data.fullName);

      if (result?.error) {
        console.error(t("auth.errors.signupError"), {
          code: result.error.code,
          message: result.error.message,
          details: result.error.originalError,
        });

        switch (result.error.code) {
          case "SERVER_ERROR":
          case "MAX_RETRIES_EXCEEDED":
            toast({
              title: t("errors.server"),
              description: result.error.message,
              variant: "destructive",
              duration: 5000,
            });
            break;

          case "VERIFICATION_ERROR":
            toast({
              title: t("auth.errors.verificationError"),
              description: t("auth.errors.verificationErrorDesc"),
              variant: "destructive",
            });
            break;

          case "USER_CREATION_FAILED":
            toast({
              title: t("auth.errors.registrationError"),
              description: t("auth.errors.registrationErrorDesc"),
              variant: "destructive",
            });
            break;

          case "AUTH_ERROR":
            if (result.error.message.includes("already registered")) {
              setExistingEmail(data.email);
              setShowEmailExistsModal(true);
              return;
            }
            toast({
              title: t("auth.errors.authError"),
              description: result.error.message,
              variant: "destructive",
            });
            break;

          default:
            toast({
              title: t("errors.generic"),
              description: result.error.message,
              variant: "destructive",
            });
        }
        return;
      }

      // Success path
      navigate("/confirm-signup", {
        state: { email: data.email },
        replace: true,
      });
    } catch (error) {
      console.error(t("auth.errors.unexpectedError"), error);
      toast({
        title: t("auth.errors.unexpectedError"),
        description: t("auth.errors.tryAgain"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("auth.createAccount")}
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
                        type="email"
                        autoComplete="email"
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
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("auth.fullNamePlaceholder")}
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
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("auth.confirmPassword")}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner
                    message={t("auth.registering")}
                    compact
                  />
                ) : (
                  t("auth.signup")
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t("auth.alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-blue-600 hover:underline"
            >
              {t("auth.login")}
            </Link>
          </div>
        </CardContent>
      </Card>
      <EmailExistsModal
        isOpen={showEmailExistsModal}
        onClose={() => setShowEmailExistsModal(false)}
        email={existingEmail}
      />
    </AuthLayout>
  );
}
