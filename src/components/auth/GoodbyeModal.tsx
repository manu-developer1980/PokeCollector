import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { useTranslation } from "react-i18next";

export default function GoodbyeModal() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  return (
    <Dialog
      open={true}
      onOpenChange={() => navigate("/", { replace: true })}
    >
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {t("account.goodbye")}{" "}
            <Heart className="h-6 w-6 text-red-500 fill-current" />
          </DialogTitle>
          <DialogDescription>
            {t("account.accountDeletedMessage")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            {t("account.welcomeBackMessage")}
          </p>
          <Button
            onClick={() => navigate("/", { replace: true })}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {t("account.backToHome")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
