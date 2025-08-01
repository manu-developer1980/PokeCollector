import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PasswordResetConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function PasswordResetConfirmationModal({
  isOpen,
  onClose,
  email,
}: PasswordResetConfirmationModalProps) {
  const { t } = useTranslation();

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {t("account.checkEmail")}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            {t("account.passwordEmailSent", { email })}
          </p>
          <p className="font-medium">{email}</p>
          <p className="text-sm text-gray-600">
            {t("account.checkInboxPassword")}
          </p>
          <Button
            onClick={onClose}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {t("common.understood")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
