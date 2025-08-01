import { useState } from "react";
import { PricingCard } from "../components/features/pricing/PricingCard";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import { useAuth } from "../../supabase/auth";
import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranslation } from "react-i18next";

export default function PricingPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { subscription, isLoading: loading } = useSubscription();

  // Add this function to handle plan selection
  const handleSelectPlan = (planId: string) => {

    // Add your plan selection logic here
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const currentPlanType = subscription?.plan_type?.toUpperCase() || "APRENDIZ";

  const faqs = [
    {
      question: t("pricing.faq.freeplan.question"),
      answer: t("pricing.faq.freeplan.answer"),
    },
    {
      question: t("pricing.faq.changePlan.question"),
      answer: t("pricing.faq.changePlan.answer"),
    },
    {
      question: t("pricing.faq.collections.question"),
      answer: t("pricing.faq.collections.answer"),
    },
    {
      question: t("pricing.faq.payment.question"),
      answer: t("pricing.faq.payment.answer"),
    },
    {
      question: t("pricing.faq.cancel.question"),
      answer: t("pricing.faq.cancel.answer"),
    },
    {
      question: t("pricing.faq.data.question"),
      answer: t("pricing.faq.data.answer"),
    },
    {
      question: t("pricing.faq.wishlist.question"),
      answer: t("pricing.faq.wishlist.answer"),
    },
    {
      question: t("pricing.faq.share.question"),
      answer: t("pricing.faq.share.answer"),
    },
    {
      question: t("pricing.faq.database.question"),
      answer: t("pricing.faq.database.answer"),
    },
    {
      question: t("pricing.faq.support.question"),
      answer: t("pricing.faq.support.answer"),
    },
  ];

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">{t("pricing.title")}</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </div>
      {!user && (
        <div className="flex justify-center mt-8">
          <Link to={user ? "/dashboard" : "/signup"}>
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
            >
              {t("pricing.startFreeButton")}
            </Button>
          </Link>
        </div>
      )}
      <div className="flex flex-row justify-center flex-wrap gap-6">
        {Object.entries(PLAN_FEATURES).map(([planType, plan]) => (
          <PricingCard
            key={plan.id}
            plan={planType as SubscriptionPlan}
            isPopular={plan.name === "Entrenador"}
            isCurrentPlan={planType === currentPlanType}
            onSelectPlan={handleSelectPlan} // Add this prop
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
              {t("pricing.startFreeButton")}
            </Button>
          </Link>
        </div>
      )}

      {/* Eliminar el componente CheckoutFlow */}
      {!user && (
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            {t("pricing.faqTitle")}
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
