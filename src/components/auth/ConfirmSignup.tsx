import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation, Navigate } from "react-router-dom";
import { supabase } from "../../../supabase/supabase";
import AuthLayout from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmSignup() {
  const location = useLocation();
  const email = location.state?.email;
  const { t } = useTranslation();

  useEffect(() => {
    // Asegurarnos de que no haya sesión activa
    supabase.auth.signOut();
  }, []);

  // Si no hay email en el state, redirigir a signup
  if (!email) {
    return (
      <Navigate
        to="/signup"
        replace
      />
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("auth.confirmSignup.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              {t("auth.confirmSignup.sentConfirmation")}
            </p>
            <p className="mt-1 font-medium">{email}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t("auth.confirmSignup.checkInbox")}
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/login">
              <Button
                variant="outline"
                className="w-full"
              >
                {t("auth.confirmSignup.backToLogin")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
