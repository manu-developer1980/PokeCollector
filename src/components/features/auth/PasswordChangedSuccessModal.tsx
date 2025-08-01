import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordChangedSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PasswordChangedSuccessModal({
  isOpen,
  onClose,
}: PasswordChangedSuccessModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {t("common.success")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">
            {t("auth.passwordChanged")}
          </p>
          <p className="text-sm text-gray-600">
            {t("auth.passwordChangedDescription", { defaultValue: "You can now log in with your new password." })}
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {t("auth.backToLogin")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
