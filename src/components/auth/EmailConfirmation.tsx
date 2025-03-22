import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowRight, Crown } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import AuthLayout from "./AuthLayout";
import { cn } from "@/lib/utils";
import { PlanChangeDialog } from "../subscription/PlanChangeDialog";
import { useState } from "react";
import { useSubscription } from "@/hooks/useSubscription";

interface SidebarProps {
  items: string[];
  activeItem: string;
  onItemClick: (item: string) => void;
}

export function Sidebar({ items, activeItem, onItemClick }: SidebarProps) {
  const { subscription } = useSubscription();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const isPremium = subscription?.status === "active";

  return (
    <aside className="w-64 border-r bg-background h-full">
      <nav className="space-y-2 p-4">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onItemClick(item)}
            className={cn(
              "w-full flex items-center px-3 py-2 rounded-lg text-sm",
              activeItem === item
                ? "bg-red-100 text-red-900"
                : "hover:bg-red-50 text-gray-700"
            )}
          >
            {item}
          </button>
        ))}

        {!isPremium && (
          <button
            onClick={() => setShowUpgradeDialog(true)}
            className="w-full flex items-center px-3 py-2 rounded-lg text-sm bg-gradient-to-r from-yellow-400 to-yellow-500 text-white hover:from-yellow-500 hover:to-yellow-600 transition-colors"
          >
            <Crown className="w-4 h-4 mr-2" />
            Mejora tu Plan
          </button>
        )}
      </nav>

      <PlanChangeDialog
        isOpen={showUpgradeDialog}
        onClose={() => setShowUpgradeDialog(false)}
        currentPlan="APRENDIZ"
      />
    </aside>
  );
}

export default function EmailConfirmation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = location.state || {};

  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <AuthLayout>
      <Card>
        <CardHeader>
          <Mail className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-center">Verifica tu Email</h2>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Hemos enviado un enlace de verificación a:
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="mt-4 text-sm text-gray-500 text-center">
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones
            para completar tu registro.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "https://gmail.com")}
          >
            Abrir Gmail
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
