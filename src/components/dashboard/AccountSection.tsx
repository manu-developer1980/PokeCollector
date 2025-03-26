import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { useSubscription } from "@/hooks/useSubscription";
import { useSubscriptionStats } from "@/hooks/useSubscriptionStats";
import { PLAN_FEATURES } from "@/lib/stripe";
import { Crown } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AccountSectionProps {
  onSectionChange: (section: string) => void;
}

export default function AccountSection({
  onSectionChange,
}: AccountSectionProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
        title: t("account.passwordResetEmailSent"),
        description: t("account.checkInbox"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: t("account.passwordResetError"),
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
        title: t("account.nameUpdated"),
        description: t("account.nameUpdatedSuccess"),
      });
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: t("account.nameUpdateError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Primero obtenemos el token de acceso actual
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error(t("account.noActiveSession"));
      }

      // Llamada a la función de eliminar usuario
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-user`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: user?.id }),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.message || t("account.deleteError"));
      }

      // Si todo fue exitoso, navegamos a goodbye y cerramos sesión
      navigate("/goodbye", { replace: true });
      await signOut();
    } catch (error: any) {
      console.error("Error detallado:", error);
      toast({
        title: t("account.deleteAccountError"),
        description: error.message || t("common.tryAgainLater"),
        variant: "destructive",
      });

      // Solo intentamos refrescar la sesión si hay un error de autenticación
      if (error.status === 401 || error.status === 403) {
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          await signOut();
          navigate("/login", { replace: true });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Asegurarnos de que planType sea una clave válida para PLAN_FEATURES
  const rawPlanType = subscription?.plan_type || "APRENDIZ";
  const planType = rawPlanType.toUpperCase() as keyof typeof PLAN_FEATURES;
  // Proporcionar un valor por defecto si no existe
  const planFeatures = PLAN_FEATURES[planType] || PLAN_FEATURES.APRENDIZ;

  return (
    <>
      {/* Sección de Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>{t("account.profile")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
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
                    {t("common.save")}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setIsEditingName(false)}
                    size="sm"
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h3 className="text-xl font-semibold">
                    {user?.user_metadata?.full_name || t("account.noName")}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingName(true)}
                  >
                    {t("common.edit")}
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
            <CardTitle>{t("subscription.currentPlan")}</CardTitle>
            <CardDescription>
              {subscription?.status === "active"
                ? t("subscription.active")
                : t("subscription.inactive")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("subscription.plan")}</span>
                <span>{t(`plans.${planType.toLowerCase()}.name`)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("subscription.status")}</span>
                <span
                  className={
                    subscription?.status === "active"
                      ? "text-green-600"
                      : "text-yellow-600"
                  }
                >
                  {subscription?.status === "active"
                    ? t("subscription.statusActive")
                    : t("subscription.statusInactive")}
                </span>
              </div>
              {subscription?.current_period_end && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    {t("subscription.nextBilling")}
                  </span>
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
                ? t("subscription.changePlan")
                : t("subscription.viewPlans")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sección de Estadísticas */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>{t("account.statistics")}</CardTitle>
            <CardDescription>{t("account.currentUsage")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {t("account.cardsInCollections")}
                </span>
                <span>
                  {stats?.cardsCount || 0} /{" "}
                  {planFeatures?.maxCards === -1
                    ? "∞"
                    : planFeatures?.maxCards || 50}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("account.collections")}</span>
                <span>
                  {stats?.collectionsCount || 0} /{" "}
                  {planFeatures?.maxCollections === -1
                    ? "∞"
                    : planFeatures?.maxCollections || 1}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">{t("account.wishlist")}</span>
                <span>
                  {stats?.wishlistCount || 0} /{" "}
                  {planFeatures?.maxWishlist === -1
                    ? "∞"
                    : planFeatures?.maxWishlist || 10}
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
            <CardTitle>{t("account.security")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowPasswordConfirm(true)}
              disabled={isLoading}
            >
              {t("account.changePassword")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Zona de Peligro */}
      <div className="mt-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">
              {t("account.dangerZone")}
            </CardTitle>
            <CardDescription>
              {t("account.dangerZoneDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isLoading}
            >
              {t("account.deleteAccount")}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de confirmación de cambio de contraseña */}
      <ConfirmDialog
        isOpen={showPasswordConfirm}
        onClose={() => setShowPasswordConfirm(false)}
        onConfirm={handlePasswordReset}
        title={t("account.changePassword")}
        description={t("account.passwordResetConfirmation")}
      />

      {/* Modal de instrucciones enviadas */}
      <ConfirmDialog
        isOpen={showPasswordInstructions}
        onClose={() => setShowPasswordInstructions(false)}
        onConfirm={() => setShowPasswordInstructions(false)}
        title={t("account.instructionsSent")}
        description={t("account.passwordResetInstructions")}
        confirmText={t("common.understood")}
        showCancel={false}
      />

      {/* Modal de confirmación de eliminación de cuenta */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title={t("account.deleteAccount")}
        description={t("account.deleteAccountConfirmation")}
        confirmText={t("account.deleteAccount")}
        confirmVariant="destructive"
      />
    </>
  );
}
