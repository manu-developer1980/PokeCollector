import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, User, Mail, CreditCard, Shield, Trash2 } from "lucide-react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DeleteConfirmationDialog from "@/components/ui/DeleteConfirmationDialog";

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

const validatePassword = (password: string) => {
  const minLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers,
    errors: {
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
    },
  };
};

export default function AccountPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("full_name, email, avatar_url")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setEditedName(data.full_name || "");
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("users")
        .update({ full_name: editedName })
        .eq("id", user?.id);

      if (error) throw error;

      setProfile((prev) => ({ ...prev!, full_name: editedName }));
      setIsEditing(false);
      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados correctamente.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      if (!newEmail || newEmail === profile?.email) {
        setIsEditingEmail(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        email: newEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      // Redirigir a la página de confirmación
      navigate("/confirm-email-change", {
        state: { newEmail },
        replace: true,
      });

      toast({
        title: "Solicitud enviada",
        description: "Por favor, revisa tu email para confirmar el cambio.",
      });
    } catch (error: any) {
      console.error("Error updating email:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el email.",
        variant: "destructive",
      });
    } finally {
      setIsEditingEmail(false);
    }
  };

  const handleDeleteAccountConfirm = async () => {
    try {
      setIsLoading(true);

      // Primero eliminamos las colecciones del usuario
      const { error: collectionsError } = await supabase
        .from("collections")
        .delete()
        .eq("user_id", user?.id);

      if (collectionsError) throw collectionsError;

      // Eliminamos el usuario de la base de datos
      const { error: dbError } = await supabase
        .from("users")
        .delete()
        .eq("id", user?.id);

      if (dbError) throw dbError;

      // Eliminamos la cuenta de autenticación
      const { error: authError } = await supabase.auth.admin.deleteUser(
        user?.id as string
      );

      if (authError) throw authError;

      // Cerramos sesión
      await supabase.auth.signOut();

      toast({
        title: "Cuenta eliminada",
        description: "Tu cuenta ha sido eliminada correctamente.",
      });
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Error",
        description:
          error.message ||
          "No se pudo eliminar la cuenta. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas nuevas no coinciden",
        variant: "destructive",
      });
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      toast({
        title: "Contraseña inválida",
        description:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido actualizada correctamente.",
      });

      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      console.error("Error changing password:", error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando...</span>
      </div>
    );
  }

  const SecurityCard = (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Seguridad</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setIsChangePasswordOpen(true)}
        >
          Cambiar Contraseña
        </Button>
      </CardContent>
    </Card>
  );

  const ChangePasswordDialog = (
    <Dialog
      open={isChangePasswordOpen}
      onOpenChange={setIsChangePasswordOpen}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cambiar Contraseña</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva Contraseña</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">
              Confirmar Nueva Contraseña
            </Label>
            <Input
              id="confirmNewPassword"
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              disabled={isChangingPassword}
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>La contraseña debe contener:</p>
            <ul className="list-disc list-inside">
              <li>Al menos 8 caracteres</li>
              <li>Una letra mayúscula</li>
              <li>Una letra minúscula</li>
              <li>Un número</li>
            </ul>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsChangePasswordOpen(false)}
              disabled={isChangingPassword}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cambiar Contraseña
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mi Cuenta</h1>

      <div className="space-y-6">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <CardTitle>Información Personal</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                />
              ) : (
                <p className="text-gray-700">{profile?.full_name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              {isEditingEmail ? (
                <div className="space-y-2">
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder={profile?.email}
                  />
                  <div className="flex space-x-2">
                    <Button onClick={handleUpdateEmail}>Guardar</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingEmail(false);
                        setNewEmail("");
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-gray-700">{profile?.email}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingEmail(true);
                      setNewEmail(profile?.email || "");
                    }}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Cambiar
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            {isEditing ? (
              <div className="space-x-2">
                <Button onClick={handleUpdateProfile}>Guardar</Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Editar</Button>
            )}
          </CardFooter>
        </Card>

        {/* Seguridad */}
        {SecurityCard}

        {/* Eliminar Cuenta */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-500">Zona de Peligro</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Una vez eliminada tu cuenta, todos tus datos serán borrados
              permanentemente. Esta acción no se puede deshacer.
            </p>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando cuenta...
                </>
              ) : (
                "Eliminar Cuenta"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
      {ChangePasswordDialog}
      <DeleteConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeleteAccountConfirm}
        title="Eliminar Cuenta"
        description="¿Estás seguro de que deseas eliminar tu cuenta? Esta acción eliminará permanentemente todos tus datos, incluyendo tus colecciones y configuraciones. Esta acción no se puede deshacer."
      />
    </div>
  );
}
