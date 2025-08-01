import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";

interface EmailExistsModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export default function EmailExistsModal({
  isOpen,
  onClose,
  email,
}: EmailExistsModalProps) {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login", { 
      state: { email },
      replace: true 
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            Email ya registrado
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Mail className="mx-auto h-12 w-12 text-blue-500" />
          <p className="text-sm text-gray-600">
            El email <span className="font-medium">{email}</span> ya está registrado en nuestra plataforma.
          </p>
          <p className="text-sm text-gray-600">
            Por favor, inicia sesión con tu cuenta existente.
          </p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleLogin} className="w-full">
              Ir a iniciar sesión
            </Button>
            <Button variant="outline" onClick={onClose} className="w-full">
              Intentar con otro email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}