import React from "react";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { PlanDetails } from "./CheckoutFlow";

interface CheckoutSummaryProps {
  plan: PlanDetails;
}

const CheckoutSummary = ({ plan }: CheckoutSummaryProps) => {
  const formatPrice = (price: number) => {
    return `${price.toFixed(2)}€`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{plan.name} Plan</h3>
          <p className="text-gray-600">{plan.description}</p>
          <div className="mt-2 text-sm text-gray-500">
            Billed {plan.interval === "month" ? "monthly" : "annually"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">
            {formatPrice(plan.price)}
            <span className="text-sm font-normal text-gray-600">
              /{plan.interval}
            </span>
          </div>
        </div>
      </div>

      <Separator />

      <div>
        <h4 className="font-medium mb-3">Plan Features</h4>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(plan.price)}</span>
        </div>
        {plan.interval === "year" && (
          <div className="flex justify-between text-green-600">
            <span>Descuento anual (20%)</span>
            <span>-{formatPrice(plan.price * 0.2)}</span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>
            {formatPrice(plan.interval === "year" ? plan.price * 0.8 : plan.price)}
            <span className="text-sm font-normal text-gray-600">
              /{plan.interval}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
