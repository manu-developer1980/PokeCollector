import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../supabase/auth";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useToast } from "../ui/use-toast";

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

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // 1. Primero borrar la cuenta en la base de datos
      console.log("1. Eliminando cuenta en la base de datos...");
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

      console.log("2. Cuenta eliminada correctamente, cerrando sesión...");

      // 2. Cerrar el diálogo antes de hacer signOut
      onOpenChange(false);

      // Establecer un token de acceso único para la página de despedida
      console.log(
        "3. Estableciendo token de acceso para la página de despedida..."
      );
      sessionStorage.setItem("goodbyeAccessToken", Date.now().toString());

      // Navegar a la página de despedida
      console.log("4. Navegando a la página de despedida...");
      navigate("/goodbye", { replace: true });

      // Nota: No intentamos cerrar sesión aquí porque está causando errores 403
      // El usuario podrá cerrar sesión manualmente después si es necesario
    } catch (error) {
      console.error("Error al eliminar la cuenta:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la cuenta. Por favor, intenta nuevamente.",
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
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente tu
            cuenta y todos tus datos.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAccount}
            disabled={isLoading}
          >
            {isLoading ? "Eliminando..." : "Eliminar cuenta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
