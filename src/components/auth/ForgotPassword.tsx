import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import AuthLayout from "./AuthLayout";
import { supabase } from "../../../supabase/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;
  const COOLDOWN_TIME = 30 * 60 * 1000; // 30 minutos
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (attempts >= MAX_ATTEMPTS) {
      const lastAttempt = localStorage.getItem("lastPasswordResetAttempt");
      const now = Date.now();

      if (lastAttempt && now - parseInt(lastAttempt) < COOLDOWN_TIME) {
        toast({
          title: "Demasiados intentos",
          description:
            "Por favor, espera 30 minutos antes de intentar de nuevo",
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
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: "Email enviado",
        description:
          "Revisa tu bandeja de entrada para restablecer tu contraseña.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error. Intenta de nuevo.",
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
            Recuperar Contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
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
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Enviar instrucciones"
                )}
              </Button>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-600 hover:text-red-600"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Hemos enviado las instrucciones a:
              </p>
              <p className="font-medium">{email}</p>
              <p className="text-sm text-gray-600">
                Revisa tu bandeja de entrada y sigue las instrucciones para
                restablecer tu contraseña.
              </p>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="w-full mt-4"
                >
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
