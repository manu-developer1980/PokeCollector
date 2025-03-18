import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
  buttonText: string;
}

const defaultPlans: Plan[] = [
  {
    id: "APRENDIZ",
    name: "Aprendiz",
    description: "Plan gratuito para comenzar",
    price: 0,
    interval: "month",
    features: [
      "Hasta 50 cartas",
      "1 colección",
      "10 cartas en lista de deseos",
      "Búsqueda básica",
      "Acceso a la comunidad",
    ],
    buttonText: "Comenzar Gratis",
  },
  {
    id: "ENTRENADOR",
    name: "Entrenador",
    description: "Para coleccionistas serios",
    price: 5,
    interval: "month",
    features: [
      "Hasta 500 cartas",
      "5 colecciones",
      "50 cartas en lista de deseos",
      "Estadísticas avanzadas",
      "Filtros de búsqueda avanzados",
      "Soporte prioritario",
    ],
    isPopular: true,
    buttonText: "Comenzar Prueba Gratuita",
  },
  {
    id: "MAESTRO",
    name: "Maestro",
    description: "Para coleccionistas profesionales",
    price: 10,
    interval: "month",
    features: [
      "Cartas ilimitadas",
      "Colecciones ilimitadas",
      "Lista de deseos ilimitada",
      "Estadísticas avanzadas",
      "Análisis de tendencias de precios",
      "Exportación de datos",
      "Soporte prioritario",
    ],
    buttonText: "Comenzar Prueba Gratuita",
  },
];

const getPokeball = (planId: string) => {
  switch (planId) {
    case "APRENDIZ":
      return "pokeball";
    case "ENTRENADOR":
      return "greatball";
    case "MAESTRO":
      return "masterball";
    default:
      return "pokeball";
  }
};

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );

  const formatPrice = (price: number | string) => {
    if (price === 0 || price === "0") {
      return "Gratis";
    }
    
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;
    
    if (isNaN(numericPrice)) {
      return "Gratis";
    }
    
    return `${numericPrice.toFixed(2)}€`;
  };

  useEffect(() => {
    // Fetch plans from Supabase or API if needed
    // For now, we'll use the default plans
  }, []);

  const handlePlanSelect = async (plan: Plan) => {
    setIsLoading(true);
    setProcessingPlanId(plan.id);

    try {
      if (!user) {
        // Siempre redirigir a signup con información del plan
        navigate(`/signup?plan=${plan.id}&interval=${billingInterval}`);
        return;
      }

      // Incluso para usuarios logueados, por ahora redirigimos a signup
      navigate(`/signup?plan=${plan.id}&interval=${billingInterval}`);
    } catch (error) {
      console.error("Error navigating to signup:", error);
    } finally {
      setIsLoading(false);
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-yellow-50 py-20">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-200 text-yellow-800 hover:bg-yellow-300 border-none">
            Elige tu Plan
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Comienza tu Viaje de Colección Pokémon
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Selecciona el plan que mejor se adapte a tus necesidades de
            colección. Todos los planes incluyen nuestras funciones principales.
          </p>

          <div className="flex items-center justify-center mt-8 space-x-4">
            <span
              className={`text-sm ${
                billingInterval === "month"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Mensual
            </span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
              aria-checked={billingInterval === "year"}
              onClick={() =>
                setBillingInterval(
                  billingInterval === "month" ? "year" : "month"
                )
              }
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  billingInterval === "year" ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                billingInterval === "year"
                  ? "text-gray-900 font-medium"
                  : "text-gray-500"
              }`}
            >
              Anual{" "}
              <span className="text-green-500 font-medium">Ahorra 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            // Calculate yearly price with discount if applicable
            const price = billingInterval === "year" && Number(plan.price) > 0
              ? (Number(plan.price) * 12 * 0.8)
              : Number(plan.price);

            return (
              <Card
                key={plan.id}
                className={`border relative ${
                  plan.isPopular
                    ? "border-red-200 shadow-lg ring-2 ring-red-500"
                    : "border-gray-200 shadow-md"
                } hover:shadow-xl transition-shadow`}
              >
                <CardHeader className="pb-2">
                  {plan.isPopular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <Badge className="bg-red-500 text-white hover:bg-red-600 border-none">
                        Más Popular
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center justify-center mb-4">
                    <div className={`${getPokeball(plan.id)} mx-auto`} />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 mt-2">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(price)}
                    </span>
                    {price !== 0 && (
                      <span className="text-gray-600 ml-2">
                        /{billingInterval}
                      </span>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-start"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${
                      plan.isPopular
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isLoading && processingPlanId === plan.id}
                  >
                    {isLoading && processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        {plan.buttonText}
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            Preguntas Frecuentes
          </h2>
          <div className="max-w-3xl mx-auto grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                ¿Puedo cancelar mi suscripción?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar tu suscripción en cualquier momento.
                Seguirás teniendo acceso hasta el final de tu período de
                facturación.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                ¿Hay una prueba gratuita?
              </h3>
              <p className="text-gray-600">
                Sí, los planes Entrenador y Maestro incluyen una prueba gratuita
                de 14 días. No se requiere tarjeta de crédito para comenzar.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-600">
                Aceptamos todas las tarjetas de crédito principales, incluyendo
                Visa, Mastercard, y American Express.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">Have more questions?</p>
          <Link to="/contact">
            <Button
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Contact Support
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
