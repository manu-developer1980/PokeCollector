import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GoodbyeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GoodbyeModal({ isOpen, onClose }: GoodbyeModalProps) {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate("/", { replace: true });
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            ¡Hasta pronto! <Heart className="h-6 w-6 text-red-500 fill-current" />
          </DialogTitle>
          <DialogDescription>
            Tu cuenta ha sido eliminada correctamente. Esperamos volver a verte pronto en PokéCollector.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Recuerda que siempre serás bienvenido/a de nuevo en nuestra comunidad de coleccionistas.
          </p>
          <Button 
            onClick={handleClose} 
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Volver al inicio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

