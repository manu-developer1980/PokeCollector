import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import AuthLayout from "./AuthLayout";
import { supabase } from "../../../supabase/supabase";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutos
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (attempts >= MAX_ATTEMPTS) {
      const lastAttempt = localStorage.getItem("lastPasswordResetAttempt");
      const now = Date.now();

      if (lastAttempt && now - parseInt(lastAttempt) < COOLDOWN_TIME) {
        toast({
          title: t("auth.tooManyAttempts"),
          description: t("auth.waitBeforeRetry"),
          variant: "destructive",
        });
        return;
      }

      setAttempts(0);
      localStorage.removeItem("lastPasswordResetAttempt");
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken: undefined, // Opcional: si tienes reCAPTCHA configurado
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: t("auth.emailSent"),
        description: t("auth.checkInboxForReset"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message || t("auth.errorTryAgain"),
        variant: "destructive",
      });
      setAttempts((prev) => prev + 1);
      localStorage.setItem("lastPasswordResetAttempt", Date.now().toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("auth.recoverPassword")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t("auth.emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoadingSpinner
                    message={t("auth.sendingInstructions")}
                    compact
                  />
                ) : (
                  t("auth.sendInstructions")
                )}
              </Button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  {t("auth.backToLogin")}
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">{t("auth.instructionsSentTo")}</p>
              <p className="font-medium">{email}</p>
              <p className="text-sm text-gray-600">
                {t("auth.checkInboxAndFollow")}
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full mt-4"
                >
                  {t("auth.backToLogin")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
