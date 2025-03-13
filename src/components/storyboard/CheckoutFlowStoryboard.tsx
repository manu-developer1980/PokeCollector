import React from "react";
import CheckoutFlow from "../checkout/CheckoutFlow";

const demoTrainerPlan = {
  id: "trainer",
  name: "Trainer",
  description: "For serious collectors",
  price: 9.99,
  interval: "month" as const,
  features: [
    "Unlimited cards in collection",
    "Advanced search filters",
    "Up to 5 custom collections",
    "Card condition tracking",
    "Collection value estimates",
    "Priority support",
  ],
  isPopular: true,
};

export default function CheckoutFlowStoryboard() {
  return (
    <div className="bg-gradient-to-b from-red-50 to-yellow-50 p-8 min-h-screen">
      <CheckoutFlow
        plan={demoTrainerPlan}
        onCancel={() => console.log("Cancelled")}
      />
    </div>
  );
}
