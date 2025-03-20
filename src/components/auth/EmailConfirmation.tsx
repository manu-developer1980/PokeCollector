import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight } from "lucide-react";
import { useAuth } from "../../../supabase/auth";

export default function EmailConfirmation() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { email, planId, interval } = location.state || {};

  useEffect(() => {
    // Si el usuario está autenticado y verificado
    if (user?.email_confirmed_at) {
      const storedPlan = localStorage.getItem("selectedPlan");

      if (storedPlan) {
        const { planId, interval } = JSON.parse(storedPlan);
        // Redirigir al login para primer ingreso
        navigate(
          `/login?redirect=checkout&plan=${planId}&interval=${interval}`
        );
        localStorage.removeItem("selectedPlan");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-yellow-50 py-20">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center">Verifica tu Email</h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Hemos enviado un enlace de verificación a:
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones
            para completar tu registro.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "https://gmail.com")}
          >
            Abrir Gmail
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
