import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

interface PasswordResetInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function PasswordResetInstructionsModal({
  isOpen,
  onClose,
  email,
}: PasswordResetInstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Revisa tu email
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <p className="text-sm text-gray-600">
            Hemos enviado un enlace para cambiar tu contraseña a:
          </p>
          <p className="font-medium">{email}</p>
          <p className="text-sm text-gray-600">
            Por favor, revisa tu bandeja de entrada y sigue las instrucciones
            para establecer una nueva contraseña.
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}