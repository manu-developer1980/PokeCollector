import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../supabase/auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 1. Primero borrar la cuenta en la base de datos
      const response = await fetch("/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la cuenta");
      }



      // 2. Cerrar el diálogo antes de hacer signOut
      onOpenChange(false);

      // Establecer un token de acceso único para la página de despedida
      sessionStorage.setItem("goodbyeAccessToken", Date.now().toString());

      // Navegar a la página de despedida
      navigate("/goodbye", { replace: true });

      // Nota: No intentamos cerrar sesión aquí porque está causando errores 403
      // El usuario podrá cerrar sesión manualmente después si es necesario
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      toast({
        title: t("common.error"),
        description: t("account.deleteAccountError", {
          defaultValue: "No se pudo eliminar la cuenta. Por favor, intenta nuevamente."
        }),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      onOpenChange(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("account.deleteAccountTitle", {
            defaultValue: "¿Estás seguro?"
          })}</DialogTitle>
          <DialogDescription>
            {t("account.deleteAccountDescription", {
              defaultValue: "Esta acción no se puede deshacer. Se eliminará permanentemente tu cuenta y todos tus datos."
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? t("account.deleting", {
              defaultValue: "Eliminando..."
            }) : t("account.deleteAccount", {
              defaultValue: "Eliminar cuenta"
            })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
