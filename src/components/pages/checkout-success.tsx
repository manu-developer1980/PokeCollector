import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../../../supabase/auth";

interface Plan {
  id: string;
  name: string;
}

const defaultPlans: Record<string, string> = {
  free: "Free",
  trainer: "Trainer",
  master: "Master",
};

const CheckoutSuccessPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [planName, setPlanName] = useState("Premium");
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    // Parse query parameters to get plan ID
    const params = new URLSearchParams(location.search);
    const planId = params.get("plan");

    if (planId && defaultPlans[planId]) {
      setPlanName(defaultPlans[planId]);
    }

    // Generate a random order number
    setOrderNumber(`PK-${Math.floor(100000 + Math.random() * 900000)}`);
  }, [location.search]);

  const handleGoToDashboard = () => {
    navigate("/dashboard");
  };

  const formatDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white shadow-xl">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto"
          >
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <CardTitle className="text-2xl font-bold text-gray-800">
              Payment Successful!
            </CardTitle>
          </motion.div>
        </CardHeader>

        <CardContent>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-gray-600 text-center mb-6">
              Thank you for subscribing to the {planName} plan. Your
              subscription is now active.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4 mb-6">
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
                <span className="font-medium">{formatDate(30)}</span>
              </div>
            </div>
          </motion.div>
        </CardContent>

        <CardFooter>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="w-full"
          >
            <Button
              onClick={handleGoToDashboard}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CheckoutSuccessPage;
