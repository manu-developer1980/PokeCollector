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
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, CreditCard, ArrowRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import CheckoutSummary from "./CheckoutSummary";
import PaymentMethodSelector from "./PaymentMethodSelector";
import SubscriptionConfirmation from "./SubscriptionConfirmation";

export interface PlanDetails {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: "month" | "year";
  features: string[];
  isPopular?: boolean;
}

interface CheckoutFlowProps {
  plan: PlanDetails;
  onCancel: () => void;
}

const CheckoutFlow = ({ plan, onCancel }: CheckoutFlowProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleProceedToPayment = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to subscribe to a plan.",
        variant: "destructive",
      });
      navigate("/login?redirect=pricing");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          productPriceId: plan.id,
          successUrl: `${window.location.origin}/checkout/success?plan=${plan.id}`,
          customerEmail: user.email || "",
          metadata: {
            user_id: user.id,
            plan_name: plan.name,
            plan_interval: plan.interval,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirigir directamente a la URL de checkout de Polar
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error creating your checkout session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    navigate("/dashboard");
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <div className="flex items-center space-x-2">
            <Badge
              className={`${currentStep >= 1 ? "bg-red-600" : "bg-gray-300"} text-white`}
            >
              1
            </Badge>
            <div
              className={`h-0.5 w-8 ${currentStep >= 2 ? "bg-red-600" : "bg-gray-300"}`}
            ></div>
            <Badge
              className={`${currentStep >= 2 ? "bg-red-600" : "bg-gray-300"} text-white`}
            >
              2
            </Badge>
            <div
              className={`h-0.5 w-8 ${currentStep >= 3 ? "bg-red-600" : "bg-gray-300"}`}
            ></div>
            <Badge
              className={`${currentStep >= 3 ? "bg-red-600" : "bg-gray-300"} text-white`}
            >
              3
            </Badge>
          </div>
        </div>

        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Review Your Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckoutSummary plan={plan} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleProceedToPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentMethodSelector />

              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-2 flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                  Secure Payment
                </h3>
                <p className="text-sm text-gray-600">
                  Your payment information is processed securely. We do not
                  store your credit card details.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleCompletePayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Complete Payment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Subscription Confirmed</CardTitle>
            </CardHeader>
            <CardContent>
              <SubscriptionConfirmation plan={plan} />
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={handleFinish}
              >
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckoutFlow;
