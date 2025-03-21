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
import { useSubscription } from "@/hooks/useSubscription";
import { PLAN_FEATURES, SubscriptionPlan } from "@/lib/stripe";
import LoadingSpinner from "../ui/LoaderSpinner";
import { Progress } from "@/components/ui/progress";
import { useStats } from "@/hooks/useStats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AccountSectionProps {
  onSectionChange: (section: string) => void;
}

export function AccountSection({ onSectionChange }: AccountSectionProps) {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { subscription, loading } = useSubscription();
  const { stats, isLoading: statsLoading } = useStats();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [showPasswordInstructions, setShowPasswordInstructions] =
    useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
  });

  // Obtener el plan actual
  const currentPlanType = (subscription?.plan_type?.toUpperCase() ||
    "APRENDIZ") as SubscriptionPlan;
  const currentPlan = PLAN_FEATURES[currentPlanType] || PLAN_FEATURES.APRENDIZ;

  // Calcular porcentajes
  const cardsPercentage = (stats.cardsCount / currentPlan.maxCards) * 100;
  const collectionsPercentage =
    (stats.collectionsCount / currentPlan.maxCollections) * 100;
  const wishlistPercentage =
    (stats.wishlistCount / currentPlan.maxWishlist) * 100;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;

        // Si no hay datos, creamos el registro
        if (!data) {
          const { error: insertError } = await supabase.from("users").upsert([
            {
              id: user.id,
              full_name: user.user_metadata?.full_name || "",
              email: user.email,
            },
          ]);

          if (insertError) throw insertError;

          setUserData({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
          });
        } else {
          setUserData({
            fullName: data.full_name || user.user_metadata?.full_name || "",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la información del usuario.",
          variant: "destructive",
        });
      }
    };

    fetchUserData();
  }, [user, toast]);

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("users").upsert({
        id: user.id,
        full_name: userData.fullName,
        email: user.email,
      });

      if (error) throw error;

      // Actualizar también los metadatos del usuario en auth
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: userData.fullName },
      });

      if (updateError) throw updateError;

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
      // 1. Si hay una suscripción activa, intentar cancelarla
      if (subscription?.stripe_subscription_id) {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) {
          throw new Error("No se pudo obtener el token de autorización");
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_SUPABASE_URL
          }/functions/v1/cancel-subscription`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({
              subscriptionId: subscription.stripe_subscription_id,
              userId: user.id,
            }),
          }
        );

        const responseData = await response.json();

        if (
          !response.ok &&
          !responseData.message?.includes("already cancelled")
        ) {
          throw new Error(
            responseData.error || "Error al cancelar la suscripción"
          );
        }
      }

      // 2. Proceder con la eliminación del usuario
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("No se pudo obtener el token de autorización");
      }

      const deleteResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ user_id: user.id }),
        }
      );

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || "Error al eliminar la cuenta");
      }

      // 3. Limpiar el estado local y redirigir
      setUser(null);
      navigate("/goodbye");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "No se pudo eliminar la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
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
                    setUserData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
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
                        <LoadingSpinner message="Actualizando..." />
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
        </div>

        {/* Columna derecha */}
        <div className="space-y-6">
          {/* Card de Plan Actual */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Actual</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center min-h-[200px]">
                  <LoadingSpinner message="Cargando suscripción..." />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="font-medium">Plan: {currentPlan.name}</p>
                    <p>
                      Estado:{" "}
                      {subscription?.status === "active"
                        ? "Activo"
                        : "No activo"}
                    </p>
                    {subscription?.current_period_end && (
                      <p className="text-sm text-muted-foreground">
                        Próxima renovación:{" "}
                        {new Date(
                          subscription.current_period_end
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="default"
                    onClick={() => onSectionChange("Pricing")}
                    className="w-full"
                  >
                    {subscription?.status === "active"
                      ? "Cambiar Plan"
                      : "Ver Planes"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card de Límites del Plan */}
          <Card>
            <CardHeader>
              <CardTitle>Límites del Plan</CardTitle>
            </CardHeader>
            <CardContent>
              {loading || statsLoading ? (
                <div className="flex items-center justify-center min-h-[100px]">
                  <LoadingSpinner message="Cargando límites..." />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Cartas</span>
                      <span className="text-muted-foreground">
                        {stats.cardsCount}/
                        {currentPlan.maxCards === Infinity
                          ? "∞"
                          : currentPlan.maxCards}
                      </span>
                    </div>
                    <Progress
                      value={cardsPercentage}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Colecciones</span>
                      <span className="text-muted-foreground">
                        {stats.collectionsCount}/
                        {currentPlan.maxCollections === Infinity
                          ? "∞"
                          : currentPlan.maxCollections}
                      </span>
                    </div>
                    <Progress
                      value={collectionsPercentage}
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Lista de Deseos</span>
                      <span className="text-muted-foreground">
                        {stats.wishlistCount}/
                        {currentPlan.maxWishlist === Infinity
                          ? "∞"
                          : currentPlan.maxWishlist}
                      </span>
                    </div>
                    <Progress
                      value={wishlistPercentage}
                      className="h-2"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
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
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Zona de Peligro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-red-600">
              Las acciones en esta sección son permanentes y no se pueden
              deshacer.
            </div>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              Eliminar mi cuenta
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente tu cuenta y todos tus datos.
              Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {isLoading ? (
              <div className="w-full flex justify-center items-center py-2">
                <LoadingSpinner
                  message="Eliminando cuenta..."
                  compact={true}
                />
              </div>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                >
                  Eliminar cuenta
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
