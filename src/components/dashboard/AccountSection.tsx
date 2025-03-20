import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "../../../supabase/auth";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "../../../supabase/supabase";
import { Loader2, Pencil } from "lucide-react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { PasswordResetInstructionsModal } from "../auth/PasswordResetInstructionsModal";

export function AccountSection() {
  const navigate = useNavigate();
  const { user, refreshSession } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showPasswordInstructions, setShowPasswordInstructions] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserData({
          fullName: data?.full_name || "",
          email: user.email || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ full_name: userData.fullName })
        .eq("id", user.id);

      if (error) throw error;

      // Actualizar también los metadatos del usuario en auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: userData.fullName },
      });

      if (updateError) throw updateError;

      await refreshSession();

      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido actualizada correctamente.",
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la información del perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setShowPasswordConfirm(false);
      setShowPasswordInstructions(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo enviar el email de recuperación.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error: deleteDataError } = await supabase
        .from("users")
        .delete()
        .eq("id", user.id);

      if (deleteDataError) throw deleteDataError;

      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(
        user.id
      );

      if (deleteAuthError) throw deleteAuthError;

      navigate("/goodbye");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          "No se pudo eliminar la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Información Personal</CardTitle>
          {!isEditing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre completo</label>
            <Input
              value={userData.fullName}
              onChange={(e) =>
                setUserData((prev) => ({ ...prev, fullName: e.target.value }))
              }
              placeholder="Tu nombre completo"
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              value={userData.email}
              disabled
              className="bg-gray-50"
            />
          </div>
          {isEditing && (
            <div className="flex space-x-2">
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setUserData((prev) => ({
                    ...prev,
                    fullName: user?.user_metadata?.full_name || "",
                  }));
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={() =>
              navigate("/dashboard", {
                state: { activeSection: "Subscription" },
              })
            }
            className="w-full"
          >
            Gestionar suscripción
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguridad</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPasswordConfirm(true)}
            disabled={isLoading}
          >
            Cambiar contraseña
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isLoading}
          >
            Eliminar cuenta
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={handlePasswordReset}
        title="Cambiar contraseña"
        description="¿Deseas recibir un email con instrucciones para cambiar tu contraseña?"
      />

      <PasswordResetInstructionsModal
        isOpen={showPasswordInstructions}
        onClose={() => setShowPasswordInstructions(false)}
        email={user?.email || ""}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        description="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y perderás todos tus datos."
      />
    </div>
  );
}
