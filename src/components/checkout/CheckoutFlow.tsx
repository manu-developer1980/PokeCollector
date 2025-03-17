import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import CheckoutSummary from "./CheckoutSummary";

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
  const [isLoading, setIsLoading] = useState(false);

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
          successUrl: `${window.location.origin}/checkout/success`,
          customerEmail: user.email,
          metadata: {
            user_id: user.id,
            plan_name: plan.name,
            plan_interval: plan.interval,
          },
        },
      });

      if (error) throw error;

      if (data?.url) {
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

  return (
    <div className="max-w-3xl mx-auto px-4">
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
              'Processing...'
            ) : (
              <>
                Proceed to Payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutFlow;
