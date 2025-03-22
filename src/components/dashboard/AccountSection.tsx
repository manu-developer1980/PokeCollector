import { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionStats } from "@/hooks/useSubscriptionStats";
import { PLAN_FEATURES } from "@/lib/stripe";
import { Crown } from "lucide-react";

interface AccountSectionProps {
  onSectionChange: (section: string) => void;
}

export default function AccountSection({
  onSectionChange,
}: AccountSectionProps) {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showPasswordInstructions, setShowPasswordInstructions] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const [fullName, setFullName] = useState(
    user?.user_metadata?.full_name || ""
  );
  const [isEditingName, setIsEditingName] = useState(false);
  const { subscription } = useSubscription();
  const { stats } = useSubscriptionStats();

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

      toast({
        title: "Email enviado",
        description: "Revisa tu bandeja de entrada para cambiar tu contraseña.",
      });
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

  const handleUpdateName = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) throw error;

      setIsEditingName(false);
      toast({
        title: "Nombre actualizado",
        description: "Tu nombre ha sido actualizado correctamente.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el nombre.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc("delete_user_data", {
        user_id_param: user.id,
      });

      if (error) throw error;

      await signOut();
      navigate("/", { replace: true });

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente.",
      });
    } catch (error: any) {
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

  const getCurrentPlan = () => {
    if (!subscription || subscription.status !== "active") {
      return PLAN_FEATURES.APRENDIZ;
    }
    return (
      PLAN_FEATURES[subscription.plan_type as keyof typeof PLAN_FEATURES] ||
      PLAN_FEATURES.APRENDIZ
    );
  };

  const currentPlan = getCurrentPlan();

  return (
    <>
      {/* Sección de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button
                    onClick={handleUpdateName}
                    disabled={isLoading}
                    size="sm"
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingName(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">
                    {user?.user_metadata?.full_name || "Sin nombre"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    Editar
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sección de Plan Actual */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Actual</CardTitle>
            <CardDescription>
              {subscription?.status === "active"
                ? "Tu suscripción está activa"
                : "No tienes una suscripción activa"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Plan</span>
                <span>{currentPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Estado</span>
                <span
                  className={
                    subscription?.status === "active"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {subscription?.status === "active" ? "Activo" : "Inactivo"}
                </span>
              </div>
              {subscription?.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">Próxima facturación</span>
                  <span>
                    {new Date(
                      subscription.current_period_end
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="default"
              className="w-full"
              onClick={() => onSectionChange("Pricing")}
            >
              <Crown className="h-4 w-4 mr-2" />
              {subscription?.status === "active"
                ? "Cambiar Plan"
                : "Ver Planes"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Estadísticas */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Uso actual de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Cartas en colecciones</span>
                <span>
                  {stats?.cardsCount || 0} /{" "}
                  {currentPlan.maxCards === -1 ? "∞" : currentPlan.maxCards}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Colecciones</span>
                <span>
                  {stats?.collectionsCount || 0} /{" "}
                  {currentPlan.maxCollections === -1
                    ? "∞"
                    : currentPlan.maxCollections}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Lista de deseos</span>
                <span>
                  {stats?.wishlistCount || 0} /{" "}
                  {currentPlan.maxWishlist === -1
                    ? "∞"
                    : currentPlan.maxWishlist}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Seguridad */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
      </div>

      {/* Zona de Peligro */}
      <div className="mt-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Zona de Peligro</CardTitle>
            <CardDescription>
              Las acciones en esta sección son irreversibles
            </CardDescription>
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
      </div>

      {/* Modal de confirmación de cambio de contraseña */}
      <ConfirmDialog
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={handlePasswordReset}
        title="Cambiar contraseña"
        description="Te enviaremos un email con instrucciones para cambiar tu contraseña. ¿Deseas continuar?"
      />

      {/* Modal de instrucciones enviadas */}
      <ConfirmDialog
        isOpen={showPasswordInstructions}
        onClose={() => setShowPasswordInstructions(false)}
        onConfirm={() => setShowPasswordInstructions(false)}
        title="Instrucciones enviadas"
        description="Hemos enviado un email con las instrucciones para cambiar tu contraseña. Por favor, revisa tu bandeja de entrada."
        confirmText="Entendido"
        showCancel={false}
      />

      {/* Modal de confirmación de eliminación de cuenta */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        description="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible y perderás todas tus colecciones y datos."
        confirmText="Eliminar cuenta"
        confirmVariant="destructive"
      />
    </>
  );
}
