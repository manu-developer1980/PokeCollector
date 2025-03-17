import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handlePlanSelection = async (planType: string) => {
    setIsLoading(true);

    try {
      if (planType === "free") {
        // Si el usuario ya está autenticado, actualizar su suscripción a free
        if (user) {
          const { error } = await supabase.from("subscriptions").upsert({
            user_id: user.id,
            status: "active",
            plan_type: "free",
            current_period_end: null,
            cancel_at_period_end: false,
          });

          if (error) throw error;

          navigate("/dashboard");
        } else {
          // Si no está autenticado, enviarlo al registro
          navigate("/signup?plan=free");
        }
      } else {
        // Para planes premium, redirigir al checkout
        if (user) {
          navigate(`/checkout?plan=${planType}`);
        } else {
          // Si no está autenticado, guardar el plan en la URL del registro
          navigate(`/signup?plan=${planType}`);
        }
      }
    } catch (error) {
      console.error("Error handling plan selection:", error);
      toast({
        title: "Error",
        description:
          "No se pudo procesar tu selección. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Elige tu Plan</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Free */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <Badge variant="outline">Gratis</Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Búsqueda básica de cartas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>1 colección</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handlePlanSelection("free")}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Comenzar Gratis"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Premium Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Mensual</CardTitle>
            <Badge>9.99€/mes</Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Todas las características Free</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Colecciones ilimitadas</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Análisis de precios</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handlePlanSelection("premium_monthly")}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Elegir Plan"
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Plan Premium Anual */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Anual</CardTitle>
            <Badge>99.99€/año</Badge>
            <Badge
              variant="outline"
              className="ml-2"
            >
              ¡2 meses gratis!
            </Badge>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Todas las características Premium</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span>Ahorra 2 meses</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              onClick={() => handlePlanSelection("premium_yearly")}
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Elegir Plan"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionPage;
