import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useRecentActivity, formatRelativeTime } from "@/hooks/useRecentActivity";
import { useAuth } from "../../../../supabase/auth.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

// Import existing components
import SubscriptionManagement from "./SubscriptionManagement";
import AuditLogs from "./AuditLogs";
import AdminSettings from "./AdminSettings";

// Import new components
import UnifiedUserManagement from "./UnifiedUserManagement";
import PricingManagement from "./PricingManagement";
import ContentManagement from "./ContentManagement";
import NewsAutomation from "./NewsAutomation";
import ErrorBoundary from "@/components/common/ErrorBoundary";

const ManagementZone: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading, error } = useAdmin();
  const { stats, loading: statsLoading, error: statsError, refetch } = useAdminStats();
  const { activities, loading: activitiesLoading, error: activitiesError, refetch: refetchActivities } = useRecentActivity();
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
      title: "Usuarios y Cuentas",
      icon: <Users className="h-4 w-4" />,
      description: "Gestión unificada de usuarios y datos de cuenta",
    },
    {
      id: "pricing",
      title: "Gestión de suscripción, precios",
      icon: <DollarSign className="h-4 w-4" />,
      description: "CRUD de planes y precios",
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
              <TabsTrigger value="audit" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Auditoría
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Estadísticas en Tiempo Real</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refetch}
                  disabled={statsLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
              </div>
              
              {statsError && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Error al cargar estadísticas: {statsError}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Usuarios</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.totalUsers.toLocaleString()}
                        </p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        +{statsLoading ? '...' : stats.newUsersThisMonth} este mes
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Suscripciones</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.activeSubscriptions.toLocaleString()}
                        </p>
                      </div>
                      <CreditCard className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {statsLoading ? '...' : stats.subscriptionGrowth}% crecimiento
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Colecciones</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.totalCollections.toLocaleString()}
                        </p>
                      </div>
                      <Database className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        +{statsLoading ? '...' : stats.newCollectionsThisWeek} esta semana
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Cartas</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.totalCardsInCollections.toLocaleString()}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        En colecciones
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Actividad</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.recentActivity.toLocaleString()}
                        </p>
                      </div>
                      <Bot className="h-8 w-8 text-indigo-600" />
                    </div>
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        Últimos 7 días
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sistema</p>
                        <p className="text-2xl font-bold">
                          {statsLoading ? '...' : stats.systemHealth}%
                        </p>
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
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Actividad Reciente
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={refetchActivities}
                      disabled={activitiesLoading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${activitiesLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activitiesError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Error al cargar actividad: {activitiesError}
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-4">
                    {activitiesLoading ? (
                      <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="h-4 w-4 bg-gray-300 rounded"></div>
                              <div className="h-4 w-32 bg-gray-300 rounded"></div>
                            </div>
                            <div className="h-3 w-16 bg-gray-300 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : activities.length > 0 ? (
                      activities.map((activity) => {
                        const IconComponent = activity.icon === 'UserCheck' ? UserCheck :
                                            activity.icon === 'CreditCard' ? CreditCard :
                                            activity.icon === 'Database' ? Database :
                                            activity.icon === 'Activity' ? Activity : Activity;
                        
                        return (
                          <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <IconComponent className={`h-4 w-4 ${activity.color}`} />
                              <span className="text-sm">{activity.description}</span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(activity.timestamp)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No hay actividad reciente</p>
                      </div>
                    )}
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
            <UnifiedUserManagement />
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
                <ErrorBoundary>
                  <ContentManagement />
                </ErrorBoundary>
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