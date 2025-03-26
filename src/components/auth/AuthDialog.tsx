import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login?redirect=/dashboard");
  };

  const handleSignup = () => {
    onClose();
    navigate("/signup?redirect=/dashboard");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("auth.dialog.title")}</DialogTitle>
          <DialogDescription>
            {t("auth.dialog.description")}
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>{t("auth.dialog.benefits.collection")}</li>
              <li>{t("auth.dialog.benefits.wishlist")}</li>
              <li>{t("auth.dialog.benefits.tracking")}</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleSignup}
            className="bg-red-600 hover:bg-red-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {t("auth.createAccount")}
          </Button>
          <Button
            variant="outline"
            onClick={handleLogin}
          >
            <LogIn className="mr-2 h-4 w-4" />
            {t("auth.login")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
