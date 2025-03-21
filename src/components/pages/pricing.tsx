import { useState } from "react";
import { PricingCard } from "../pricing/PricingCard";
import { PLAN_FEATURES } from "@/lib/stripe";
import { useAuth } from "../../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import LoadingSpinner from "../ui/LoaderSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (loading) {
    return <LoadingSpinner />;
  }

  const currentPlanType = subscription?.plan_type?.toUpperCase() || "APRENDIZ";

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setIsCheckoutOpen(true);
  };

  const faqs = [
    {
      question: "¿Qué incluye el plan gratuito?",
      answer:
        "El plan Aprendiz incluye todas las funciones básicas para empezar tu colección: hasta 50 cartas, una colección, 10 cartas en tu lista de deseos y búsqueda básica por nombre y tipo. Es perfecto para comenzar y familiarizarte con la plataforma.",
    },
    {
      question: "¿Puedo cambiar de plan en cualquier momento?",
      answer:
        "Sí, puedes actualizar o cambiar tu plan en cualquier momento. Si actualizas a un plan superior, tendrás acceso inmediato a todas las nuevas funciones. Si decides bajar de plan, el cambio se aplicará al final del período de facturación actual.",
    },
    {
      question: "¿Cómo funciona el sistema de colecciones?",
      answer:
        "Cada colección te permite organizar tus cartas Pokémon de la manera que prefieras. Puedes crear colecciones por set, por tipo, por rareza o cualquier otro criterio. Cada carta puede incluir detalles como su condición, notas personales y fecha de adquisición.",
    },
    {
      question: "¿Qué métodos de pago aceptan?",
      answer:
        "Aceptamos todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express) y PayPal. Todos los pagos se procesan de forma segura a través de Stripe.",
    },
    {
      question: "¿Puedo cancelar mi suscripción en cualquier momento?",
      answer:
        "Sí, puedes cancelar tu suscripción cuando quieras. No hay compromisos de permanencia. Al cancelar, mantendrás el acceso a las funciones premium hasta el final del período facturado.",
    },
    {
      question: "¿Qué pasa con mis datos si cancelo mi suscripción?",
      answer:
        "Si cancelas una suscripción premium y vuelves al plan gratuito, tus datos se mantendrán guardados, pero solo podrás acceder a las limitaciones del plan gratuito. Podrás volver a acceder a todos tus datos al reactivar tu suscripción.",
    },
    {
      question: "¿Cómo funciona la lista de deseos?",
      answer:
        "La lista de deseos te permite guardar las cartas que te gustaría adquirir en el futuro. Puedes añadir notas, establecer prioridades y recibir notificaciones cuando actualicemos información sobre esas cartas.",
    },
    {
      question: "¿Puedo compartir mi colección con otros usuarios?",
      answer:
        "Sí, puedes compartir tu colección con otros usuarios mediante un enlace público. Tú controlas qué información es visible para otros coleccionistas y puedes desactivar la visibilidad en cualquier momento.",
    },
    {
      question: "¿Cómo mantienen actualizada la base de datos de cartas?",
      answer:
        "Nuestra base de datos se actualiza regularmente con los últimos lanzamientos de cartas Pokémon. Trabajamos con fuentes oficiales y bases de datos reconocidas para garantizar que tengas acceso a la información más precisa y actualizada.",
    },
    {
      question: "¿Ofrecen soporte técnico?",
      answer:
        "Sí, ofrecemos soporte técnico por email para todos los usuarios. Los usuarios de planes premium tienen acceso a soporte prioritario con tiempos de respuesta garantizados.",
    },
  ];

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Planes y Precios</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Estos son nuestros planes para ti. Empieza con el gratuito y sube de
          nivel cuando lo necesites
        </p>
      </div>

      <div className="flex flex-row justify-center flex-wrap gap-6">
        {Object.entries(PLAN_FEATURES).map(([planType, plan]) => (
          <PricingCard
            key={plan.id}
            plan={plan}
            isPopular={plan.name === "Entrenador"}
            isCurrentPlan={planType === currentPlanType}
            onSelectPlan={handleSelectPlan}
          />
        ))}
      </div>

      {!user && (
        <div className="flex justify-center mt-8">
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
            >
              Empezar Gratis
            </Button>
          </Link>
        </div>
      )}

      {selectedPlanId && (
        <CheckoutFlow
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          planId={selectedPlanId}
          currentSubscription={subscription}
        />
      )}

      {!user && (
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <Accordion
            type="single"
            collapsible
            className="w-full"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
              >
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
