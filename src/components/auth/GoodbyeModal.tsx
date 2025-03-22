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

export default function GoodbyeModal() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Redirigir automáticamente después de 3 segundos
    const timer = setTimeout(() => {
      navigate("/", { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  // Si hay un usuario autenticado, redirigir inmediatamente al landing
  if (user) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  const handleClose = () => {
    navigate("/", { replace: true });
  };

  return (
    <Dialog
      open={true}
      onOpenChange={handleClose}
    >
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            ¡Hasta pronto!{" "}
            <Heart className="h-6 w-6 text-red-500 fill-current" />
          </DialogTitle>
          <DialogDescription>
            Tu cuenta ha sido eliminada correctamente. Esperamos volver a verte
            pronto en PokéCollector.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-500">
            Recuerda que siempre serás bienvenido/a de nuevo en nuestra
            comunidad de coleccionistas.
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
