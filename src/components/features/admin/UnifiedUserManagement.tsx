import React, { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  ShieldOff,
  Users,
  Calendar,
  Activity,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Mail,
  User,
  Save,
  X,
  Download,
  UserCheck,
  UserX,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  subscription: string | null;
  is_active?: boolean;
  last_login_at?: string | null;
  login_count?: number;
  created_at: string;
  updated_at?: string;
  has_seen_onboarding?: boolean;
  level?: string;
  preferred_lang?: string;
  notes?: string | null;
  avatar_url?: string;
  credits?: string;
  image?: string;
  name?: string;
  token_identifier?: string;
  subscriptions?: Array<{
    id: string;
    amount: number | null;
    cancel_at_period_end: boolean | null;
    canceled_at: number | null;
    created_at: string;
    currency: string | null;
    current_period_end: number | null;
    current_period_start: number | null;
    custom_field_data: any | null;
    customer_cancellation_comment: string | null;
    customer_cancellation_reason: string | null;
    customer_id: string | null;
    ended_at: number | null;
    interval: string | null;
    metadata: any | null;
    polar_id: string | null;
    polar_price_id: string | null;
    started_at: number | null;
    status: string | null;
    updated_at: string;
    user_id: string | null;
  }>;
  user_statistics?: Array<{
    total_cards: number;
    total_collections: number;
    total_wishlist_items: number;
    last_activity_at: string | null;
  }>;
  collections?: Array<{
    id: string;
    name: string;
    created_at: string;
  }>;
  wishlist_cards?: Array<{
    id: string;
    card_id: string;
    created_at: string;
  }>;
}

const UnifiedUserManagement: React.FC = () => {
  const { getUsers, getUserById, updateUser, deleteUser } = useAdmin();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Pagination and filtering
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAdmin, setFilterAdmin] = useState<string>("all");
  const [filterActive, setFilterActive] = useState<string>("all");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    is_admin: false,
    is_active: true,
    level: "aprendiz",
    preferred_lang: "es",
    notes: "",
  });

  // Load users with current filters
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {};
      if (filterAdmin !== "all") {
        filters.is_admin = filterAdmin === "true";
      }
      if (filterActive !== "all") {
        filters.is_active = filterActive === "true";
      }
      if (filterLevel !== "all") {
        filters.level = filterLevel;
      }

      const result = await getUsers(
        currentPage,
        20,
        searchTerm || undefined,
        filters
      );

      setUsers(result.users);
      setTotalPages(result.totalPages);
      setTotalUsers(result.total);
    } catch (err) {
      console.error("Error loading users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.usersLoadError", {
          defaultValue: "Failed to load users",
        }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    filterAdmin,
    filterActive,
    filterLevel,
    getUsers,
    toast,
    t,
  ]);

  // Load users on component mount and filter changes
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Reset to first page when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filterAdmin, filterActive, filterLevel]);

  // Handle user selection for details view
  const handleViewUser = async (userId: string) => {
    try {
      setLoading(true);
      const userDetails = await getUserById(userId);
      setSelectedUser(userDetails as unknown as UserData);
      setShowUserDetails(true);
    } catch (err) {
      console.error("Error loading user details:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.userDetailsError", {
          defaultValue: "Failed to load user details",
        }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit user
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || "",
      is_admin: user.subscription === 'admin',
      is_active: user.is_active || false,
      level: user.level || "aprendiz",
      preferred_lang: user.preferred_lang || "es",
      notes: user.notes || "",
    });
    setShowEditDialog(true);
  };

  // Handle save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await updateUser(selectedUser.id, editForm);
      
      // Update local state
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, ...editForm }
          : u
      ));
      
      setShowEditDialog(false);
      setSelectedUser(null);
      
      toast({
        title: t("admin.success", { defaultValue: "Éxito" }),
        description: t("admin.userUpdated", {
          defaultValue: "Usuario actualizado correctamente",
        }),
      });
    } catch (err) {
      console.error("Error updating user:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.userUpdateError", {
          defaultValue: "Error al actualizar usuario",
        }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await deleteUser(selectedUser.id);
      
      // Update local state
      setUsers(users.filter(u => u.id !== selectedUser.id));
      setTotalUsers(totalUsers - 1);
      
      setShowDeleteDialog(false);
      setSelectedUser(null);
      
      toast({
        title: t("admin.success", { defaultValue: "Éxito" }),
        description: t("admin.userDeleted", {
          defaultValue: "Usuario eliminado correctamente",
        }),
      });
    } catch (err) {
      console.error("Error deleting user:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.userDeleteError", {
          defaultValue: "Error al eliminar usuario",
        }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Export users data
  const handleExportData = () => {
    const csvContent = [
      ["Email", "Nombre Completo", "Admin", "Activo", "Nivel", "Idioma", "Último Acceso", "Total Accesos", "Fecha Creación"].join(","),
      ...users.map(user => [
        user.email,
        user.full_name || '',
        (user.subscription?.status === 'admin') ? "Sí" : "No",
        user.is_active ? "Activo" : "Inactivo",
        user.level || '',
        user.preferred_lang || '',
        user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Nunca',
        user.login_count.toString(),
        new Date(user.created_at).toLocaleDateString()
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "usuarios_completo.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Nunca";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get user initials for avatar
  const getUserInitials = (user: UserData) => {
    if (user.full_name) {
      return user.full_name
        .split(" ")
        .map(name => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email[0].toUpperCase();
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner message="Cargando usuarios..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Administradores</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.subscription === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Activos</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.is_active).length}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Usuarios Inactivos</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => !u.is_active).length}
                </p>
              </div>
              <UserX className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Gestión Unificada de Usuarios y Cuentas</span>
            </span>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Exportar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualizar</span>
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Admin Filter */}
            <Select value={filterAdmin} onValueChange={setFilterAdmin}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de usuario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los usuarios</SelectItem>
                <SelectItem value="true">Solo administradores</SelectItem>
                <SelectItem value="false">Solo usuarios normales</SelectItem>
              </SelectContent>
            </Select>

            {/* Active Filter */}
            <Select value={filterActive} onValueChange={setFilterActive}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="true">Solo activos</SelectItem>
                <SelectItem value="false">Solo inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* Level Filter */}
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="aprendiz">Aprendiz</SelectItem>
                <SelectItem value="entrenador">Entrenador</SelectItem>
                <SelectItem value="maestro">Maestro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Mostrando {users.length} de {totalUsers} usuarios
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Información de Cuenta</TableHead>
                <TableHead>Estado y Permisos</TableHead>
                <TableHead>Actividad</TableHead>
                <TableHead>Estadísticas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const stats = user.user_statistics?.[0];
                const subscription = user.subscriptions?.[0];
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || "Sin nombre"}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Nivel:</span> {user.level || "aprendiz"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Idioma:</span> {user.preferred_lang || "es"}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Onboarding:</span> {user.has_seen_onboarding ? "Completado" : "Pendiente"}
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Badge variant={user.is_active ? "default" : "secondary"}>
                            {user.is_active ? "Activo" : "Inactivo"}
                          </Badge>
                          {user.subscription === 'admin' && (
                            <Badge variant="destructive">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        {subscription && (
                          <Badge variant="outline">
                            {subscription.status || 'Unknown'}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Último acceso:</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(user.last_login_at)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.login_count} accesos totales
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      {stats ? (
                        <div className="text-sm space-y-1">
                          <div>{stats.total_cards} cartas</div>
                          <div>{stats.total_collections} colecciones</div>
                          <div>{stats.total_wishlist_items} en wishlist</div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Sin estadísticas</div>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalles del Usuario</DialogTitle>
            <DialogDescription>
              Información completa del usuario seleccionado
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Básica</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <Label>Nombre Completo</Label>
                      <p className="text-sm">{selectedUser.full_name || "No especificado"}</p>
                    </div>
                    <div>
                      <Label>Nivel</Label>
                      <p className="text-sm">{selectedUser.level || "aprendiz"}</p>
                    </div>
                    <div>
                      <Label>Idioma Preferido</Label>
                      <p className="text-sm">{selectedUser.preferred_lang || "es"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado y Permisos</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Estado</Label>
                      <div className="mt-1">
                        <Badge variant={selectedUser.is_active ? "default" : "secondary"}>
                          {selectedUser.is_active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Permisos</Label>
                      <div className="mt-1">
                        <Badge variant={selectedUser.subscription === 'admin' ? "destructive" : "outline"}>
                          {selectedUser.subscription === 'admin' ? "Administrador" : "Usuario"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label>Onboarding</Label>
                      <p className="text-sm">
                        {selectedUser.has_seen_onboarding ? "Completado" : "Pendiente"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Actividad</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Fecha de Registro</Label>
                    <p className="text-sm">{formatDate(selectedUser.created_at)}</p>
                  </div>
                  <div>
                    <Label>Último Acceso</Label>
                    <p className="text-sm">{formatDate(selectedUser.last_login_at)}</p>
                  </div>
                  <div>
                    <Label>Total de Accesos</Label>
                    <p className="text-sm">{selectedUser.login_count}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              {selectedUser.user_statistics && selectedUser.user_statistics.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Total de Cartas</Label>
                      <p className="text-sm">{selectedUser.user_statistics[0].total_cards}</p>
                    </div>
                    <div>
                      <Label>Colecciones</Label>
                      <p className="text-sm">{selectedUser.user_statistics[0].total_collections}</p>
                    </div>
                    <div>
                      <Label>Items en Wishlist</Label>
                      <p className="text-sm">{selectedUser.user_statistics[0].total_wishlist_items}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Subscriptions */}
              {selectedUser.subscriptions && selectedUser.subscriptions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Suscripciones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedUser.subscriptions.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{sub.status || 'Unknown'}</p>
                          <p className="text-sm text-gray-500">Estado: {sub.status}</p>
                        </div>
                        {sub.customer_id && (
                          <Badge variant="outline">
                            Customer: {sub.customer_id.slice(-8)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {selectedUser.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Notas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedUser.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="full_name">Nombre Completo</Label>
              <Input
                id="full_name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                placeholder="Nombre completo del usuario"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="level">Nivel</Label>
                <Select
                  value={editForm.level}
                  onValueChange={(value) => setEditForm({ ...editForm, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprendiz">Aprendiz</SelectItem>
                    <SelectItem value="entrenador">Entrenador</SelectItem>
                    <SelectItem value="maestro">Maestro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preferred_lang">Idioma</Label>
                <Select
                  value={editForm.preferred_lang}
                  onValueChange={(value) => setEditForm({ ...editForm, preferred_lang: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                />
                <Label htmlFor="is_active">Usuario Activo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={editForm.is_admin}
                  onChange={(e) => setEditForm({ ...editForm, is_admin: e.target.checked })}
                />
                <Label htmlFor="is_admin">Administrador</Label>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea
                id="notes"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                placeholder="Notas adicionales sobre el usuario"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveUser} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar Usuario</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Se eliminará permanentemente el usuario <strong>{selectedUser.email}</strong> y todos sus datos asociados.
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar Usuario"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UnifiedUserManagement;