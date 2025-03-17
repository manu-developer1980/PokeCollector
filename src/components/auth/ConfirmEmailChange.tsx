import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation, Navigate } from "react-router-dom";
import AuthLayout from "./AuthLayout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function ConfirmEmailChange() {
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
            Verifica tu nuevo email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-600">
              Hemos enviado un enlace de confirmación a:
            </p>
            <p className="mt-1 font-medium">{newEmail}</p>
            <p className="mt-4 text-sm text-gray-600">
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones
              para confirmar tu nuevo email.
            </p>
          </div>
          <div className="flex flex-col space-y-2">
            <Link to="/account">
              <Button
                variant="outline"
                className="w-full"
              >
                Volver a mi cuenta
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
