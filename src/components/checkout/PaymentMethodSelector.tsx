import React, { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Calendar, Lock } from "lucide-react";

const PaymentMethodSelector = () => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue="credit-card"
        value={paymentMethod}
        onValueChange={setPaymentMethod}
        className="space-y-3"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="credit-card" id="credit-card" />
          <Label
            htmlFor="credit-card"
            className="flex items-center cursor-pointer"
          >
            <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
            Credit / Debit Card
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <RadioGroupItem value="paypal" id="paypal" disabled />
          <Label
            htmlFor="paypal"
            className="flex items-center cursor-pointer text-gray-400"
          >
            <svg
              className="h-5 w-5 mr-2"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19.5 8.5C19.5 11.5 17 14 14 14H11L10 19H7L8.5 8.5H14C17 8.5 19.5 5.5 19.5 8.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.5 3.5C16.5 6.5 14 9 11 9H8L7 14H4L5.5 3.5H11C14 3.5 16.5 0.5 16.5 3.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            PayPal (Coming Soon)
          </Label>
        </div>
      </RadioGroup>

      {paymentMethod === "credit-card" && (
        <Card className="border-gray-200">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <div className="relative">
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  className="pl-10"
                />
                <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <div className="relative">
                  <Input id="expiry" placeholder="MM/YY" className="pl-10" />
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <div className="relative">
                  <Input id="cvc" placeholder="123" className="pl-10" />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name on Card</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
