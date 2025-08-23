import React, { useState } from "react";
import { useAuth } from "../../../../supabase/auth.tsx";
import { supabase } from "../../../../supabase/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Shield, User, AlertTriangle, CheckCircle } from "lucide-react";

/**
 * InitialAdminSetup Component
 * 
 * This component is used for initial setup to grant admin privileges
 * to the first user. It should be removed after initial setup is complete.
 */
const InitialAdminSetup: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Check current admin status
  const checkAdminStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .select("subscription")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        return;
      }

      setIsAdmin(data?.subscription === 'admin');
    } catch (err) {
      console.error("Error in checkAdminStatus:", err);
    }
  };

  // Grant admin privileges to current user
  const grantAdminPrivileges = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No hay usuario autenticado",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Update user to admin
      const { error } = await supabase
        .from("users")
        .update({ subscription: 'admin' })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setIsAdmin(true);
      toast({
        title: "¡Éxito!",
        description: "Privilegios de administrador otorgados exitosamente. Ahora puedes acceder al panel de administración.",
      });

      // Refresh the page to update admin status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error granting admin privileges:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Error al otorgar privilegios de administrador",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check admin status on component mount
  React.useEffect(() => {
    checkAdminStatus();
  }, [user]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Autenticación Requerida</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Por favor inicia sesión para acceder a la configuración de administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isAdmin === true) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Acceso de Administrador Concedido</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Ya tienes privilegios de administrador. Puedes acceder a las áreas de administración.
              </AlertDescription>
            </Alert>
            <div className="space-y-2 mt-4">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = "/management-zone"}
              >
                Ir a Zona de Gestión
              </Button>
              <Button 
                variant="outline"
                className="w-full" 
                onClick={() => window.location.href = "/admin"}
              >
                Ir al Panel de Admin (Legacy)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-blue-500" />
            <span>Configuración Inicial de Administrador</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Esta es una configuración única para otorgar privilegios de administrador a tu cuenta.
              Este componente debe ser removido después de la configuración inicial.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Usuario Actual</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Estado de Administrador</p>
                <p className="text-sm text-gray-600">
                  {isAdmin === null ? "Verificando..." : isAdmin ? "Administrador" : "Usuario Regular"}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={grantAdminPrivileges}
            disabled={loading || isAdmin}
            className="w-full"
          >
            {loading ? "Otorgando Privilegios de Admin..." : "Otorgar Privilegios de Administrador"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Métodos alternativos:</strong></p>
            <p>1. Usar Supabase Dashboard → tabla users → establecer is_admin = true</p>
            <p>2. Ejecutar SQL: UPDATE users SET is_admin = true WHERE email = '{user.email}'</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialAdminSetup;
