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

interface GoodbyeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function GoodbyeModal({
  isOpen = true,
  onClose,
}: GoodbyeModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Verificar si debemos mostrar el modal basado en sessionStorage
  useEffect(() => {
    const shouldShowModal = sessionStorage.getItem("showGoodbyeModal");
    console.log("¿Debemos mostrar el modal de despedida?", shouldShowModal);

    if (!shouldShowModal) {
      console.log(
        "No se encontró indicador para mostrar el modal, redirigiendo..."
      );
      navigate("/", { replace: true });
    } else {
      console.log("Mostrando modal de despedida...");
      // Limpiar el indicador después de mostrar el modal
      sessionStorage.removeItem("showGoodbyeModal");
    }
  }, [navigate]);

  // Configurar temporizador para redirigir después de mostrar el modal
  useEffect(() => {
    console.log("GoodbyeModal montado, configurando temporizador...");

    // Temporizador para redirigir a la página de inicio después de 5 segundos
    const timer = setTimeout(() => {
      console.log(
        "Temporizador completado, redirigiendo a la página de inicio..."
      );
      navigate("/", { replace: true });
    }, 5000);

    return () => {
      console.log("GoodbyeModal desmontado, limpiando temporizador...");
      clearTimeout(timer);
    };
  }, [navigate]);

  // Solo registrar si el usuario sigue autenticado, pero no redirigir
  useEffect(() => {
    if (user) {
      console.log(
        "Usuario aún autenticado en GoodbyeModal, pero continuando..."
      );
    } else {
      console.log("Usuario no autenticado en GoodbyeModal, como se esperaba.");
    }
  }, [user]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          if (onClose) onClose();
          navigate("/", { replace: true });
        }
      }}
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
