import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation, Navigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ConfirmEmailChange() {
  const { t } = useTranslation();

  const location = useLocation();
  const newEmail = location.state?.newEmail;

  // Si no hay email en el state, redirigir a la cuenta
  if (!newEmail) {
    return (
      <Navigate
        to="/account"
        replace
      />
    );
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {t("auth.verifyNewEmail")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              {t("auth.confirmationLinkSent")}
            </p>
            <p className="mt-1 font-medium">{newEmail}</p>
            <p className="mt-4 text-sm text-gray-600">
              {t("auth.checkInboxForNewEmail")}
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/account">
              <Button
                variant="outline"
                className="w-full"
              >
                {t("auth.backToAccount")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
