import React from "react";
import { CheckCircle2, Calendar, CreditCard, Mail } from "lucide-react";
import { PlanDetails } from "./CheckoutFlow";

interface SubscriptionConfirmationProps {
  plan: PlanDetails;
}

const SubscriptionConfirmation = ({ plan }: SubscriptionConfirmationProps) => {
  const formatDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const nextBillingDate = formatDate(plan.interval === "month" ? 30 : 365);
  const orderNumber = `PK-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-6">
        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-center">
          Thank You for Your Subscription!
        </h2>
        <p className="text-gray-600 text-center mt-2">
          Your {plan.name} plan is now active. You can start using all the
          features immediately.
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex justify-between">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Order Number</span>
          </div>
          <span className="font-medium">{orderNumber}</span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Next Billing Date</span>
          </div>
          <span className="font-medium">{nextBillingDate}</span>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-gray-500" />
            <span className="text-gray-600">Confirmation Email</span>
          </div>
          <span className="font-medium">Sent</span>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">What's Next?</h3>
        <ul className="space-y-2 text-blue-700 text-sm">
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>
              Explore your dashboard to start managing your Pokémon card
              collection
            </span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Search for cards and add them to your collection</span>
          </li>
          <li className="flex items-start">
            <CheckCircle2 className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
            <span>Create custom collections to organize your cards</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SubscriptionConfirmation;
