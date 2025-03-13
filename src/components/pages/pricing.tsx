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
    id: "free",
    name: "Free",
    description: "Basic collection tracking",
    price: 0,
    interval: "month",
    features: [
      "Up to 100 cards in collection",
      "Basic search functionality",
      "Single collection",
      "Community access",
    ],
    buttonText: "Get Started",
  },
  {
    id: "trainer",
    name: "Trainer",
    description: "For serious collectors",
    price: 9.99,
    interval: "month",
    features: [
      "Unlimited cards in collection",
      "Advanced search filters",
      "Up to 5 custom collections",
      "Card condition tracking",
      "Collection value estimates",
      "Priority support",
    ],
    isPopular: true,
    buttonText: "Start Free Trial",
  },
  {
    id: "master",
    name: "Master",
    description: "For professional collectors",
    price: 19.99,
    interval: "month",
    features: [
      "Everything in Trainer",
      "Unlimited custom collections",
      "Price trend analytics",
      "Collection export",
      "API access",
      "Dedicated support",
      "Early access to new features",
    ],
    buttonText: "Start Free Trial",
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>(defaultPlans);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month",
  );

  useEffect(() => {
    // Fetch plans from Supabase or API if needed
    // For now, we'll use the default plans
  }, []);

  const handlePlanSelect = async (plan: Plan) => {
    if (plan.id === "free") {
      // For free plan, just redirect to dashboard
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/signup");
      }
      return;
    }

    setIsLoading(true);
    setProcessingPlanId(plan.id);

    try {
      if (!user) {
        // If not logged in, redirect to signup with plan info
        navigate(`/signup?plan=${plan.id}&interval=${billingInterval}`);
        return;
      }

      // For logged in users, redirect to checkout page
      navigate(`/checkout?plan=${plan.id}&interval=${billingInterval}`);
    } catch (error) {
      console.error("Error navigating to checkout:", error);
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
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Start Your Pokémon Collection Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select the plan that best fits your collection needs. All plans
            include our core features.
          </p>

          <div className="flex items-center justify-center mt-8 space-x-4">
            <span
              className={`text-sm ${billingInterval === "month" ? "text-gray-900 font-medium" : "text-gray-500"}`}
            >
              Monthly
            </span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none"
              role="switch"
              aria-checked={billingInterval === "year"}
              onClick={() =>
                setBillingInterval(
                  billingInterval === "month" ? "year" : "month",
                )
              }
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingInterval === "year" ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span
              className={`text-sm ${billingInterval === "year" ? "text-gray-900 font-medium" : "text-gray-500"}`}
            >
              Yearly{" "}
              <span className="text-green-500 font-medium">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            // Calculate yearly price with discount if applicable
            const price =
              billingInterval === "year" && plan.price > 0
                ? (plan.price * 12 * 0.8).toFixed(2)
                : plan.price.toFixed(2);

            return (
              <Card
                key={plan.id}
                className={`border ${plan.isPopular ? "border-red-200 shadow-lg ring-2 ring-red-500" : "border-gray-200 shadow-md"} hover:shadow-xl transition-shadow`}
              >
                <CardHeader className="pb-2">
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center">
                      <Badge className="bg-red-500 text-white hover:bg-red-600 border-none">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardTitle className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="mt-2 mb-6">
                    <span className="text-4xl font-bold text-gray-900">
                      {price === "0.00" ? "Free" : `$${price}`}
                    </span>
                    {price !== "0.00" && (
                      <span className="text-gray-600 ml-2">
                        /{billingInterval}
                      </span>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className={`w-full ${plan.isPopular ? "bg-red-600 hover:bg-red-700" : "bg-gray-900 hover:bg-gray-800"}`}
                    onClick={() => handlePlanSelect(plan)}
                    disabled={isLoading && processingPlanId === plan.id}
                  >
                    {isLoading && processingPlanId === plan.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
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
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto grid gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Can I cancel my subscription?
              </h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. You'll
                continue to have access until the end of your billing period.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                Yes, both Trainer and Master plans come with a 14-day free
                trial. No credit card required to start.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="font-bold text-lg mb-2 text-gray-900">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards, including Visa, Mastercard,
                American Express, and Discover.
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
