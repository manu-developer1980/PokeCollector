import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "../../../../supabase/auth.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  Settings,
  AlertTriangle,
  ArrowLeft,
  Database,
  FileText,
  Newspaper,
  UserCheck,
  Mail,
  DollarSign,
  BarChart3,
  Globe,
  Bot,
  TrendingUp,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

// Import existing components
import UserManagement from "./UserManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import AuditLogs from "./AuditLogs";
import AdminSettings from "./AdminSettings";

// Import new components
import AccountDataManagement from "./AccountDataManagement";
import PricingManagement from "./PricingManagement";
import ContentManagement from "./ContentManagement";
import NewsAutomation from "./NewsAutomation";

const ManagementZone: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading, error } = useAdmin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/dashboard");
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner
          message={t("admin.loading", {
            defaultValue: "Cargando zona de gestión...",
          })}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t("admin.error", { defaultValue: "Error cargando zona de gestión" })}:{" "}
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t("admin.unauthorized", {
              defaultValue: "No tienes permisos para acceder a la zona de gestión",
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const managementSections = [
    {
      id: "overview",
      title: "Zona de gestión",
      icon: <Database className="h-4 w-4" />,
      description: "Panel principal de administración",
    },
    {
      id: "users",
      title: "Usuarios",
      icon: <Users className="h-4 w-4" />,
      description: "Gestión de usuarios del sistema",
    },
    {
      id: "account-data",
      title: "Datos de cuenta",
      icon: <Mail className="h-4 w-4" />,
      description: "Email, nombre y datos personales",
    },
    {
      id: "pricing",
      title: "Gestión de suscripción, precios",
      icon: <DollarSign className="h-4 w-4" />,
      description: "CRUD de planes y precios",
    },
    {
      id: "user-crud",
      title: "CRUD usuarios",
      icon: <UserCheck className="h-4 w-4" />,
      description: "Operaciones completas de usuarios",
    },
    {
      id: "content",
      title: "Gestión de contenidos (CMS)",
      icon: <FileText className="h-4 w-4" />,
      description: "Sistema de gestión de contenidos",
    },
    {
      id: "news",
      title: "Noticias sobre pokemon",
      icon: <Newspaper className="h-4 w-4" />,
      description: "Autocreación de artículos y noticias",
    },
    {
      id: "audit",
      title: "Registros de auditoría",
      icon: <Activity className="h-4 w-4" />,
      description: "Logs y seguimiento de actividad",
    },
    {
      id: "settings",
      title: "Configuración",
      icon: <Settings className="h-4 w-4" />,
      description: "Configuración del sistema",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t("common.back", { defaultValue: "Volver" })}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {t("admin.managementZone.title", { defaultValue: "Zona de Gestión" })}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Globe className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
              <span className="text-sm text-gray-500">
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="bg-white rounded-lg border border-gray-200 p-1">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Resumen
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger value="account-data" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Cuentas
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Precios
              </TabsTrigger>
              <TabsTrigger value="content" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contenido
              </TabsTrigger>
              <TabsTrigger value="news" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Noticias
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {managementSections.slice(1).map((section) => (
                <Card
                  key={section.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                  onClick={() => setActiveTab(section.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      {section.icon}
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{section.description}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTab(section.id);
                      }}
                    >
                      Acceder
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Usuarios</p>
                      <p className="text-2xl font-bold">1,234</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +23 este mes
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Suscripciones</p>
                      <p className="text-2xl font-bold">567</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      12% crecimiento
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Ingresos</p>
                      <p className="text-2xl font-bold">$8,450</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +15% vs mes anterior
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Contenido</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      +5 esta semana
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Noticias Auto</p>
                      <p className="text-2xl font-bold">45</p>
                    </div>
                    <Bot className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      3 reglas activas
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sistema</p>
                      <p className="text-2xl font-bold">98%</p>
                    </div>
                    <Activity className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="mt-2">
                    <Badge variant="default" className="text-xs">
                      Excelente
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Nuevo usuario registrado</span>
                      </div>
                      <span className="text-xs text-gray-500">hace 2 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Actualización de suscripción</span>
                      </div>
                      <span className="text-xs text-gray-500">hace 5 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Contenido publicado</span>
                      </div>
                      <span className="text-xs text-gray-500">hace 10 min</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Bot className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm">Artículo generado automáticamente</span>
                      </div>
                      <span className="text-xs text-gray-500">hace 15 min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Estado del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Base de Datos</span>
                      <Badge variant="default">Saludable</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Servicios API</span>
                      <Badge variant="default">Operativo</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Pasarela de Pago</span>
                      <Badge variant="default">Conectado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Servicio de Email</span>
                      <Badge variant="secondary">Degradado</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Automatización de Noticias</span>
                      <Badge variant="default">Activo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Gestión de Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Data Tab */}
          <TabsContent value="account-data" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Datos de Cuenta (Email, Nombre)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AccountDataManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5" />
                  <span>Gestión de Suscripción y Precios (CRUD)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PricingManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* User CRUD Tab */}
          <TabsContent value="user-crud" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5" />
                  <span>CRUD Usuarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Management Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Gestión de Contenidos (CMS)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContentManagement />
              </CardContent>
            </Card>
          </TabsContent>

          {/* News Management Tab */}
          <TabsContent value="news" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Newspaper className="h-5 w-5" />
                  <span>Autocreación de Artículos. Noticias sobre Pokemon</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <NewsAutomation />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="audit" className="space-y-6">
            <AuditLogs />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagementZone;