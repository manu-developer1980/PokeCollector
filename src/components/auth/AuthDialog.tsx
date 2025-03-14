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

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthDialog = ({ isOpen, onClose }: AuthDialogProps) => {
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
          <DialogTitle>Únete a PokéCollector</DialogTitle>
          <DialogDescription>
            Para gestionar tu colección y lista de deseos, necesitas tener una
            cuenta. ¡Es gratis y solo toma un minuto! Podrás:
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li>Crear y gestionar tu colección de cartas</li>
              <li>Guardar cartas en tu lista de deseos</li>
              <li>Hacer seguimiento de tus cartas favoritas</li>
            </ul>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Button
            onClick={handleSignup}
            className="bg-red-600 hover:bg-red-700"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Crear cuenta
          </Button>
          <Button
            variant="outline"
            onClick={handleLogin}
          >
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar sesión
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
