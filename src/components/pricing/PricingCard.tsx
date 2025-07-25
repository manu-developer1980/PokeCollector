import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { PlanFeature, PLAN_FEATURES } from "@/lib/stripe";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { DowngradeWarningModal } from "@/components/subscription/DowngradeWarningModal";
import type { SubscriptionPlan } from "@/lib/stripe";
import { useTranslation } from "react-i18next";
import { supabase } from "../../../supabase/supabase";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isPopular?: boolean;
  onSelectPlan?: (plan: SubscriptionPlan) => void;
  isCurrentPlan?: boolean;
}

export function PricingCard({
  plan,
  isPopular,
  onSelectPlan,
  isCurrentPlan,
}: PricingCardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDowngradeWarning, setShowDowngradeWarning] = useState(false);
  const [targetPlan, setTargetPlan] = useState<string | null>(null);
  
  // Get the actual plan features
  const planFeatures = PLAN_FEATURES[plan];

  const isPlanDowngrade = (current: string, target: string): boolean => {
    const planHierarchy: Record<string, number> = {
      APRENDIZ: 1,
      ENTRENADOR: 2,
      MAESTRO: 3,
    };

    const normalizedCurrent = current.toUpperCase();
    const normalizedTarget = target.toUpperCase();

    return planHierarchy[normalizedTarget] < planHierarchy[normalizedCurrent];
  };

  const handleSelectPlan = async () => {
    if (!user) {
      sessionStorage.setItem("selectedPlan", planFeatures.id);
      navigate(`/signup?plan=${plan.toLowerCase()}`);
      return;
    }

    // Si es el plan actual, no hacemos nada
    if (isCurrentPlan) {
      toast({
        title: t("pricing.currentPlan"),
        description: t("pricing.alreadyActive"),
        variant: "default",
      });
      return;
    }

    // Verificar si es un downgrade
    const currentPlanType = (
      subscription?.plan_type || "APRENDIZ"
    ).toUpperCase();

    if (isPlanDowngrade(currentPlanType, plan)) {
      setShowDowngradeWarning(true);
      setTargetPlan(plan); // Store the plan type, not the plan ID
      return;
    }

    // Ir directamente al checkout de Stripe
    try {
      // Añadir logs para depuración
      console.log("Plan seleccionado:", plan);

      const requestData = {
        priceId: planFeatures.id,
        customerEmail: user.email,
        metadata: {
          user_id: user.id,
          plan_name: planFeatures.name,
        },
        successUrl: `${window.location.origin}/checkout-success`,
        cancelUrl: `${window.location.origin}/dashboard`,
      };

      console.log("Datos de la solicitud:", requestData);

      // Verificar si hay un token de autenticación válido
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error("No hay sesión de autenticación activa");
        throw new Error("No hay sesión de autenticación");
      }

      // Llamar a la función Edge con manejo de errores mejorado
      const { data, error } = await supabase.functions.invoke(
        "create-stripe-checkout",
        {
          body: requestData,
        }
      );

      if (error) {
        console.error("Checkout error:", error);
        // Mostrar más detalles del error
        console.error("Error completo:", JSON.stringify(error, null, 2));
        throw new Error(
          `Error en checkout: ${error.message || "Error desconocido"}`
        );
      }

      if (!data) {
        console.error("No se recibieron datos de la respuesta");
        throw new Error("No se recibieron datos de la respuesta");
      }

      console.log("Respuesta de Stripe:", data);

      if (!data?.url) {
        console.error("URL de checkout no encontrada en la respuesta", data);
        throw new Error(t("checkout.noCheckoutUrl"));
      }

      // Redirigir directamente a la URL de Stripe
      window.location.href = data.url;
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: t("common.error"),
        description: error.message || t("pricing.updateError"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  // Determinar el nombre y descripción del plan según el idioma
  const planName = t(`plans.${plan.toLowerCase()}`);
  const planDescription = t(`plans.descriptions.${plan.toLowerCase()}`);

  return (
    <>
      <Card
        className={`relative max-w-[330px] ${
          isPopular ? "border-primary" : ""
        } ${
          user && isCurrentPlan
            ? "bg-opacity-90"
            : "hover:scale-105 duration-150 transition-transform cursor-pointer"
        }`}
      >
        {isPopular && (
          <div className="absolute -top-4 left-1/2 -translate-x-1/2">
            <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full flex items-center gap-1">
              <Crown className="w-4 h-4" />
              {t("pricing.popular")}
            </span>
          </div>
        )}

        <CardHeader className="text-center">
          <h3 className="text-2xl font-bold">{planName}</h3>
          <p className="text-muted-foreground">{planDescription}</p>
          <div className="mt-4">
            <span className="text-4xl font-bold">
              {planFeatures.price === 0 ? t("pricing.free") : `${planFeatures.price}€`}
            </span>
            {planFeatures.price > 0 && (
              <span className="text-muted-foreground">
                {t("plans.perMonth")}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <ul className="space-y-3">
            {planFeatures.features.map((feature, index) => (
              <li
                key={index}
                className="flex items-center gap-2"
              >
                <Check className="w-5 h-5 text-primary" />
                <span>
                  {t(`plans.featuresList.${plan.toLowerCase()}.${index}`, {
                    defaultValue: feature,
                  })}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        {user && (
          <CardFooter>
            {isCurrentPlan ? (
              <div className="w-full px-4 py-2 bg-green-100 text-green-800 rounded-md text-center font-medium shadow-sm">
                {t("plans.currentPlan")}
              </div>
            ) : (
              <Button
                className="w-full"
                variant={isPopular ? "default" : "outline"}
                onClick={handleSelectPlan}
              >
                {t("plans.selectPlan")}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      <DowngradeWarningModal
        isOpen={showDowngradeWarning}
        onClose={() => {
          setShowDowngradeWarning(false);
          setTargetPlan(null);
        }}
        onConfirm={() => {
          if (targetPlan) {
            // Instead of just calling onSelectPlan, we should directly handle the checkout
            // for downgrades here, regardless of whether onSelectPlan is provided

            // Close the modal first
            setShowDowngradeWarning(false);

            // Then proceed with the checkout process
            try {
              console.log("Processing downgrade to plan:", targetPlan);

              const targetPlanFeatures = PLAN_FEATURES[targetPlan as SubscriptionPlan];
              if (!targetPlanFeatures) {
                throw new Error(`Plan features not found for plan: ${targetPlan}`);
              }
              
              const requestData = {
                priceId: targetPlanFeatures.id,
                customerEmail: user.email,
                metadata: {
                  user_id: user.id,
                  plan_name: targetPlanFeatures.name,
                },
                successUrl: `${window.location.origin}/checkout-success`,
                cancelUrl: `${window.location.origin}/dashboard`,
              };

              // Call the Stripe checkout function
              supabase.functions
                .invoke("create-stripe-checkout", {
                  body: requestData,
                })
                .then(({ data, error }) => {
                  if (error) {
                    console.error("Checkout error:", error);
                    throw new Error(
                      `Error en checkout: ${
                        error.message || "Error desconocido"
                      }`
                    );
                  }

                  if (!data?.url) {
                    console.error(
                      "URL de checkout no encontrada en la respuesta",
                      data
                    );
                    throw new Error(t("checkout.noCheckoutUrl"));
                  }

                  // Redirect to Stripe checkout
                  window.location.href = data.url;
                })
                .catch((error) => {
                  console.error("Error processing downgrade:", error);
                  toast({
                    title: t("common.error"),
                    description: error.message || t("pricing.updateError"),
                    variant: "destructive",
                    duration: 5000,
                  });
                });
            } catch (error) {
              console.error("Error initiating downgrade:", error);
              toast({
                title: t("common.error"),
                description: error.message || t("pricing.updateError"),
                variant: "destructive",
                duration: 5000,
              });
            }
          }
        }}
        currentPlan={
          (subscription?.plan_type?.toUpperCase() as SubscriptionPlan) ||
          "APRENDIZ"
        }
        targetPlan={plan}
        currentStats={undefined}
      />
    </>
  );
}
