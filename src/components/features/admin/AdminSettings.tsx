import React, { useState, useCallback, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "../../../../supabase/auth.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Settings,
  Server,
  Users,
  User,
  Shield,
  Database,
  Globe,
  Wrench,
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Play,
  Trash2,
  Download,
  Eye,
  UserPlus,
  UserMinus,
  Clock,
  Monitor,
  HardDrive,
  Wifi,
  Zap,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import type { AdminUser } from "@/hooks/useAdmin";

interface SystemInfo {
  environment: string;
  version: string;
  buildDate: string;
  nodeVersion: string;
  databaseUrl: string;
  apiUrl: string;
  frontendUrl: string;
  maintenanceMode: boolean;
  auditLogging: boolean;
  rateLimiting: boolean;
}

interface SecuritySettings {
  sessionTimeout: number;
  maxLoginAttempts: number;
  twoFactorAuth: boolean;
  passwordPolicy: "weak" | "medium" | "strong";
  ipWhitelist: boolean;
  adminPanelAccess: "open" | "restricted" | "locked";
  apiAccess: "open" | "authenticated" | "restricted";
}

interface DatabaseStats {
  connectionStatus: "connected" | "disconnected";
  totalTables: number;
  totalRecords: number;
  databaseSize: string;
  lastBackup: string | null;
}

interface ApiStatus {
  name: string;
  status: "operational" | "degraded" | "down";
  lastCheck: string;
  responseTime: number;
  requestCount: number;
  errorRate: number;
}

interface MaintenanceOperation {
  type: "cache" | "logs" | "database" | "indexes";
  name: string;
  description: string;
  lastRun: string | null;
  running: boolean;
}

const AdminSettings: React.FC = () => {
  const { getUsers, updateUser, logAdminAction } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("system");

  // System info state
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    environment: import.meta.env.MODE || "development",
    version: "1.0.0",
    buildDate: new Date().toISOString(),
    nodeVersion: "18.x",
    databaseUrl: import.meta.env.VITE_SUPABASE_URL || "Not configured",
    apiUrl: import.meta.env.VITE_SUPABASE_URL || "Not configured",
    frontendUrl: window.location.origin,
    maintenanceMode: false,
    auditLogging: true,
    rateLimiting: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    twoFactorAuth: true,
    passwordPolicy: "strong",
    ipWhitelist: false,
    adminPanelAccess: "restricted",
    apiAccess: "authenticated",
  });

  // Form state management
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Admin users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Database stats state
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats>({
    connectionStatus: "connected",
    totalTables: 12,
    totalRecords: 0,
    databaseSize: "0 MB",
    lastBackup: null,
  });

  // API status state
  const [apiStatuses, setApiStatuses] = useState<ApiStatus[]>([
    {
      name: "pokemonTcgApi",
      status: "operational",
      lastCheck: new Date().toISOString(),
      responseTime: 150,
      requestCount: 1250,
      errorRate: 0.02,
    },
    {
      name: "stripeApi",
      status: "operational",
      lastCheck: new Date().toISOString(),
      responseTime: 89,
      requestCount: 456,
      errorRate: 0.01,
    },
    {
      name: "supabaseApi",
      status: "operational",
      lastCheck: new Date().toISOString(),
      responseTime: 45,
      requestCount: 2340,
      errorRate: 0.005,
    },
  ]);

  // Maintenance operations state
  const [maintenanceOps, setMaintenanceOps] = useState<MaintenanceOperation[]>([
    {
      type: "cache",
      name: t("admin.settings.maintenance.clearCache", {
        defaultValue: "Clear Cache",
      }),
      description: "Clear application cache and temporary files",
      lastRun: null,
      running: false,
    },
    {
      type: "logs",
      name: t("admin.settings.maintenance.cleanupLogs", {
        defaultValue: "Cleanup Logs",
      }),
      description: "Remove old log files and audit entries",
      lastRun: null,
      running: false,
    },
    {
      type: "database",
      name: t("admin.settings.maintenance.optimizeDatabase", {
        defaultValue: "Optimize Database",
      }),
      description: "Optimize database performance and cleanup",
      lastRun: null,
      running: false,
    },
    {
      type: "indexes",
      name: t("admin.settings.maintenance.rebuildIndexes", {
        defaultValue: "Rebuild Indexes",
      }),
      description: "Rebuild database indexes for better performance",
      lastRun: null,
      running: false,
    },
  ]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load data in parallel but handle errors individually
        await Promise.allSettled([
          loadAdminUsers(),
          loadDatabaseStats(),
          loadSystemHealth(),
        ]);
      } catch (err) {
        console.error("Error loading admin settings:", err);
        setError(
          t("admin.settings.errors.loadFailed", {
            defaultValue: "Failed to load some settings",
          })
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Load admin users
  const loadAdminUsers = useCallback(async () => {
    try {
      // Get all users and filter for admins on the client side
      const result = await getUsers(1, 100, "");
      const adminUsersOnly = (result.users || []).filter(
        (user) => user.is_admin
      );
      setAdminUsers(adminUsersOnly);
    } catch (err) {
      console.error("Error loading admin users:", err);
      // Don't set global error for individual component failures
      toast({
        title: t("admin.settings.errors.adminUsersFailed", {
          defaultValue: "Failed to load admin users",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [getUsers, t, toast]);

  // Load database statistics
  const loadDatabaseStats = useCallback(async () => {
    try {
      // In a real implementation, this would call a backend endpoint
      // For now, we'll simulate the data
      setDatabaseStats({
        connectionStatus: "connected",
        totalTables: 12,
        totalRecords: 15420,
        databaseSize: "245 MB",
        lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (err) {
      console.error("Error loading database stats:", err);
    }
  }, []);

  // Load system health
  const loadSystemHealth = useCallback(async () => {
    try {
      // In a real implementation, this would check actual API health
      // For now, we'll simulate the data
      setApiStatuses((prev) =>
        prev.map((api) => ({
          ...api,
          lastCheck: new Date().toISOString(),
          responseTime: Math.floor(Math.random() * 200) + 50,
          requestCount: api.requestCount + Math.floor(Math.random() * 10),
          errorRate: Math.random() * 0.05,
        }))
      );
    } catch (err) {
      console.error("Error loading system health:", err);
    }
  }, []);

  // Grant admin privileges
  const handleGrantAdmin = useCallback(async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, { is_admin: true });

      await logAdminAction(
        user!.id,
        selectedUser.id,
        "GRANT_ADMIN",
        "user",
        selectedUser.id,
        { is_admin: false },
        { is_admin: true },
        { reason: "Admin privileges granted via settings panel" }
      );

      toast({
        title: t("admin.settings.adminUsers.adminGranted", {
          defaultValue: "Admin privileges granted successfully",
        }),
        description: `${selectedUser.email} is now an administrator`,
      });

      loadAdminUsers();
      setShowGrantDialog(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error granting admin privileges:", err);
      toast({
        title: t("admin.settings.errors.updateFailed", {
          defaultValue: "Failed to update settings",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [
    selectedUser,
    updateUser,
    logAdminAction,
    user,
    toast,
    t,
    loadAdminUsers,
  ]);

  // Revoke admin privileges
  const handleRevokeAdmin = useCallback(async () => {
    if (!selectedUser) return;

    // Prevent self-revocation
    if (selectedUser.id === user?.id) {
      toast({
        title: t("admin.settings.adminUsers.cannotRevokeYourself", {
          defaultValue: "You cannot revoke your own admin privileges",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      await updateUser(selectedUser.id, { is_admin: false });

      await logAdminAction(
        user!.id,
        selectedUser.id,
        "REVOKE_ADMIN",
        "user",
        selectedUser.id,
        { is_admin: true },
        { is_admin: false },
        { reason: "Admin privileges revoked via settings panel" }
      );

      toast({
        title: t("admin.settings.adminUsers.adminRevoked", {
          defaultValue: "Admin privileges revoked successfully",
        }),
        description: `${selectedUser.email} is no longer an administrator`,
      });

      loadAdminUsers();
      setShowRevokeDialog(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error revoking admin privileges:", err);
      toast({
        title: t("admin.settings.errors.updateFailed", {
          defaultValue: "Failed to update settings",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [
    selectedUser,
    updateUser,
    logAdminAction,
    user,
    toast,
    t,
    loadAdminUsers,
  ]);

  // Save system configuration
  const saveSystemConfiguration = useCallback(async () => {
    try {
      // In a real implementation, this would call a backend API
      // For now, we'll simulate the save operation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await logAdminAction(
        user!.id,
        null,
        "UPDATE_SYSTEM_CONFIG",
        "system",
        "configuration",
        null,
        systemInfo,
        { section: "system_configuration" }
      );

      toast({
        title: t("admin.settings.success.configurationSaved", {
          defaultValue: "Configuration saved successfully",
        }),
        description: t("admin.settings.success.configurationSavedDesc", {
          defaultValue: "System configuration has been updated",
        }),
      });

      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving system configuration:", err);
      toast({
        title: t("admin.settings.errors.saveFailed", {
          defaultValue: "Failed to save configuration",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [systemInfo, logAdminAction, user, toast, t]);

  // Save security settings
  const saveSecuritySettings = useCallback(async () => {
    try {
      // In a real implementation, this would call a backend API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await logAdminAction(
        user!.id,
        null,
        "UPDATE_SECURITY_CONFIG",
        "system",
        "security",
        null,
        securitySettings,
        { section: "security_settings" }
      );

      toast({
        title: t("admin.settings.success.securitySaved", {
          defaultValue: "Security settings saved successfully",
        }),
        description: t("admin.settings.success.securitySavedDesc", {
          defaultValue: "Security configuration has been updated",
        }),
      });

      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving security settings:", err);
      toast({
        title: t("admin.settings.errors.saveFailed", {
          defaultValue: "Failed to save configuration",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [securitySettings, logAdminAction, user, toast, t]);

  // Run maintenance operation
  const runMaintenanceOperation = useCallback(
    async (operation: MaintenanceOperation) => {
      try {
        setMaintenanceOps((prev) =>
          prev.map((op) =>
            op.type === operation.type ? { ...op, running: true } : op
          )
        );

        // Simulate maintenance operation
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setMaintenanceOps((prev) =>
          prev.map((op) =>
            op.type === operation.type
              ? { ...op, running: false, lastRun: new Date().toISOString() }
              : op
          )
        );

        const successKey =
          `admin.settings.maintenance.${operation.type}Complete` as const;
        toast({
          title: t("admin.settings.success.operationComplete", {
            defaultValue: "Operation completed successfully",
          }),
          description: t(successKey, {
            defaultValue: `${operation.name} completed successfully`,
          }),
        });

        await logAdminAction(
          user!.id,
          null,
          "MAINTENANCE",
          "system",
          operation.type,
          null,
          null,
          { operation: operation.type, description: operation.description }
        );
      } catch (err) {
        console.error("Error running maintenance operation:", err);
        setMaintenanceOps((prev) =>
          prev.map((op) =>
            op.type === operation.type ? { ...op, running: false } : op
          )
        );

        toast({
          title: t("admin.settings.errors.maintenanceFailed", {
            defaultValue: "Maintenance operation failed",
          }),
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [user, logAdminAction, toast, t]
  );

  // Test API connection
  const testApiConnection = useCallback(
    async (apiName: string) => {
      try {
        setApiStatuses((prev) =>
          prev.map((api) =>
            api.name === apiName ? { ...api, status: "degraded" } : api
          )
        );

        // Simulate API test
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setApiStatuses((prev) =>
          prev.map((api) =>
            api.name === apiName
              ? {
                  ...api,
                  status: "operational",
                  lastCheck: new Date().toISOString(),
                  responseTime: Math.floor(Math.random() * 200) + 50,
                }
              : api
          )
        );

        toast({
          title: t("admin.settings.apis.testSuccessful", {
            defaultValue: "Connection test successful",
          }),
          description: `${apiName} is responding normally`,
        });
      } catch (err) {
        console.error("Error testing API connection:", err);
        setApiStatuses((prev) =>
          prev.map((api) =>
            api.name === apiName ? { ...api, status: "down" } : api
          )
        );

        toast({
          title: t("admin.settings.apis.testFailed", {
            defaultValue: "Connection test failed",
          }),
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      }
    },
    [toast, t]
  );

  // Get status badge variant
  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case "operational":
      case "connected":
      case "healthy":
        return "default";
      case "degraded":
      case "warning":
        return "secondary";
      case "down":
      case "disconnected":
      case "critical":
        return "destructive";
      default:
        return "outline";
    }
  }, []);

  // Format timestamp
  const formatTimestamp = useCallback(
    (timestamp: string | null) => {
      if (!timestamp)
        return t("admin.settings.systemConfig.unknown", {
          defaultValue: "Unknown",
        });
      return new Date(timestamp).toLocaleString();
    },
    [t]
  );

  if (loading && adminUsers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner
          message={t("admin.settings.loading", {
            defaultValue: "Loading settings...",
          })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("admin.settings.title", { defaultValue: "Admin Settings" })}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("admin.settings.description", {
              defaultValue: "System configuration and administrative tools",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              loadAdminUsers();
              loadDatabaseStats();
              loadSystemHealth();
            }}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t("common.refresh", { defaultValue: "Refresh" })}
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "system",
              label: t("admin.settings.systemConfig.title", {
                defaultValue: "System Configuration",
              }),
              icon: Server,
            },
            {
              id: "admins",
              label: t("admin.settings.adminUsers.title", {
                defaultValue: "Admin Users",
              }),
              icon: Users,
            },
            {
              id: "security",
              label: t("admin.settings.security.title", {
                defaultValue: "Security Settings",
              }),
              icon: Shield,
            },
            {
              id: "database",
              label: t("admin.settings.database.title", {
                defaultValue: "Database Management",
              }),
              icon: Database,
            },
            {
              id: "apis",
              label: t("admin.settings.apis.title", {
                defaultValue: "API Configuration",
              }),
              icon: Globe,
            },
            {
              id: "maintenance",
              label: t("admin.settings.maintenance.title", {
                defaultValue: "System Maintenance",
              }),
              icon: Wrench,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Configuration Section */}
      {activeSection === "system" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>
                    {t("admin.settings.systemConfig.title", {
                      defaultValue: "System Configuration",
                    })}
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t("common.edit", { defaultValue: "Edit" })}
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setHasUnsavedChanges(false);
                        }}
                      >
                        {t("common.cancel", { defaultValue: "Cancel" })}
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveSystemConfiguration}
                        disabled={!hasUnsavedChanges}
                      >
                        {t("common.save", { defaultValue: "Save" })}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Environment Information
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.environment", {
                          defaultValue: "Environment",
                        })}
                        :
                      </span>
                      <Badge
                        variant={
                          systemInfo.environment === "production"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {systemInfo.environment}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.version", {
                          defaultValue: "Version",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {systemInfo.version}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.buildDate", {
                          defaultValue: "Build Date",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {formatTimestamp(systemInfo.buildDate)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 col-span-2">
                  <h4 className="font-medium text-gray-900">
                    Configuration URLs
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.frontendUrl", {
                          defaultValue: "Frontend URL",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <Input
                          value={systemInfo.frontendUrl}
                          onChange={(e) => {
                            setSystemInfo((prev) => ({
                              ...prev,
                              frontendUrl: e.target.value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-sm font-mono w-full"
                          placeholder="https://example.com"
                        />
                      ) : (
                        <span className="text-sm font-mono text-blue-600 block break-all">
                          {systemInfo.frontendUrl}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.apiUrl", {
                          defaultValue: "API URL",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <Input
                          value={systemInfo.apiUrl}
                          onChange={(e) => {
                            setSystemInfo((prev) => ({
                              ...prev,
                              apiUrl: e.target.value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-sm font-mono w-full"
                          placeholder="https://api.example.com"
                        />
                      ) : (
                        <span className="text-sm font-mono text-blue-600 block break-all">
                          {systemInfo.apiUrl.replace(/\/.*/, "/***")}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.databaseUrl", {
                          defaultValue: "Database URL",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <Input
                          value={systemInfo.databaseUrl}
                          onChange={(e) => {
                            setSystemInfo((prev) => ({
                              ...prev,
                              databaseUrl: e.target.value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                          className="text-sm font-mono w-full"
                          placeholder="postgresql://..."
                        />
                      ) : (
                        <span className="text-sm font-mono text-blue-600 block break-all">
                          {systemInfo.databaseUrl.replace(/\/.*/, "/***")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">System Features</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.systemConfig.maintenance", {
                          defaultValue: "Maintenance Mode",
                        })}
                        :
                      </span>
                      <Switch
                        checked={systemInfo.maintenanceMode}
                        onCheckedChange={(checked) => {
                          setSystemInfo((prev) => ({
                            ...prev,
                            maintenanceMode: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Audit Logging:
                      </span>
                      <Switch
                        checked={systemInfo.auditLogging}
                        onCheckedChange={(checked) => {
                          setSystemInfo((prev) => ({
                            ...prev,
                            auditLogging: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Rate Limiting:
                      </span>
                      <Switch
                        checked={systemInfo.rateLimiting}
                        onCheckedChange={(checked) => {
                          setSystemInfo((prev) => ({
                            ...prev,
                            rateLimiting: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Users Section */}
      {activeSection === "admins" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {t("admin.settings.adminUsers.title", {
                      defaultValue: "Admin Users",
                    })}
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {t("admin.settings.adminUsers.totalAdmins", {
                      defaultValue: "Total Admins",
                    })}
                    : {adminUsers.length}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div className="flex space-x-2">
                  <Input
                    placeholder={t("admin.settings.adminUsers.searchAdmins", {
                      defaultValue: "Search admin users...",
                    })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>

                {/* Admin Users Table */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>
                          {t("admin.settings.adminUsers.lastLogin", {
                            defaultValue: "Last Login",
                          })}
                        </TableHead>
                        <TableHead>
                          {t("admin.settings.adminUsers.loginCount", {
                            defaultValue: "Login Count",
                          })}
                        </TableHead>
                        <TableHead>
                          {t("admin.settings.adminUsers.status", {
                            defaultValue: "Status",
                          })}
                        </TableHead>
                        <TableHead className="text-right">
                          {t("admin.settings.adminUsers.actions", {
                            defaultValue: "Actions",
                          })}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminUsers
                        .filter(
                          (user) =>
                            !searchTerm ||
                            user.email
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()) ||
                            (user.full_name &&
                              user.full_name
                                .toLowerCase()
                                .includes(searchTerm.toLowerCase()))
                        )
                        .map((adminUser) => (
                          <TableRow key={adminUser.id}>
                            <TableCell className="font-medium">
                              {adminUser.email}
                            </TableCell>
                            <TableCell>{adminUser.full_name || "-"}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {adminUser.last_login_at
                                ? formatTimestamp(adminUser.last_login_at)
                                : t("admin.settings.systemConfig.unknown", {
                                    defaultValue: "Unknown",
                                  })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {adminUser.login_count || 0}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  adminUser.is_active ? "default" : "secondary"
                                }
                              >
                                {adminUser.is_active
                                  ? t("admin.settings.security.active", {
                                      defaultValue: "Active",
                                    })
                                  : t("admin.settings.security.inactive", {
                                      defaultValue: "Inactive",
                                    })}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {adminUser.id !== user?.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(adminUser);
                                      setShowRevokeDialog(true);
                                    }}
                                  >
                                    <UserMinus className="h-4 w-4 mr-1" />
                                    {t(
                                      "admin.settings.adminUsers.revokeAdmin",
                                      {
                                        defaultValue: "Revoke Admin",
                                      }
                                    )}
                                  </Button>
                                )}
                                {adminUser.id === user?.id && (
                                  <Badge variant="outline">Current User</Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {adminUsers.filter(
                  (user) =>
                    !searchTerm ||
                    user.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    (user.full_name &&
                      user.full_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()))
                ).length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No admin users found
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm
                        ? "No admin users match your search criteria."
                        : "No admin users available."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings Section */}
      {activeSection === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>
                    {t("admin.settings.security.title", {
                      defaultValue: "Security Settings",
                    })}
                  </span>
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {!isEditing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t("common.edit", { defaultValue: "Edit" })}
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditing(false);
                          setHasUnsavedChanges(false);
                        }}
                      >
                        {t("common.cancel", { defaultValue: "Cancel" })}
                      </Button>
                      <Button
                        size="sm"
                        onClick={saveSecuritySettings}
                        disabled={!hasUnsavedChanges}
                      >
                        {t("common.save", { defaultValue: "Save" })}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Authentication Settings
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.security.sessionTimeout", {
                          defaultValue: "Session Timeout",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={securitySettings.sessionTimeout}
                            onChange={(e) => {
                              setSecuritySettings((prev) => ({
                                ...prev,
                                sessionTimeout: parseInt(e.target.value) || 0,
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-20 text-sm"
                            min="1"
                            max="1440"
                          />
                          <span className="text-sm text-gray-600">
                            {t("admin.settings.security.minutes", {
                              defaultValue: "minutes",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-mono block">
                          {securitySettings.sessionTimeout}{" "}
                          {t("admin.settings.security.minutes", {
                            defaultValue: "minutes",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.security.maxLoginAttempts", {
                          defaultValue: "Max Login Attempts",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={securitySettings.maxLoginAttempts}
                            onChange={(e) => {
                              setSecuritySettings((prev) => ({
                                ...prev,
                                maxLoginAttempts: parseInt(e.target.value) || 0,
                              }));
                              setHasUnsavedChanges(true);
                            }}
                            className="w-20 text-sm"
                            min="1"
                            max="20"
                          />
                          <span className="text-sm text-gray-600">
                            {t("admin.settings.security.attempts", {
                              defaultValue: "attempts",
                            })}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm font-mono block">
                          {securitySettings.maxLoginAttempts}{" "}
                          {t("admin.settings.security.attempts", {
                            defaultValue: "attempts",
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.security.twoFactorAuth", {
                          defaultValue: "Two-Factor Authentication",
                        })}
                        :
                      </span>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => {
                          setSecuritySettings((prev) => ({
                            ...prev,
                            twoFactorAuth: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">
                    Security Policies
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        {t("admin.settings.security.passwordPolicy", {
                          defaultValue: "Password Policy",
                        })}
                        :
                      </label>
                      {isEditing ? (
                        <Select
                          value={securitySettings.passwordPolicy}
                          onValueChange={(
                            value: "weak" | "medium" | "strong"
                          ) => {
                            setSecuritySettings((prev) => ({
                              ...prev,
                              passwordPolicy: value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weak">Weak</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="strong">Strong</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="default"
                          className="capitalize"
                        >
                          {securitySettings.passwordPolicy}
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.security.rateLimiting", {
                          defaultValue: "Rate Limiting",
                        })}
                        :
                      </span>
                      <Badge variant="default">
                        {t("admin.settings.security.active", {
                          defaultValue: "Active",
                        })}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.security.auditLogging", {
                          defaultValue: "Audit Logging",
                        })}
                        :
                      </span>
                      <Badge variant="default">
                        {t("admin.settings.security.active", {
                          defaultValue: "Active",
                        })}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Access Control</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.security.ipWhitelist", {
                          defaultValue: "IP Whitelist",
                        })}
                        :
                      </span>
                      <Switch
                        checked={securitySettings.ipWhitelist}
                        onCheckedChange={(checked) => {
                          setSecuritySettings((prev) => ({
                            ...prev,
                            ipWhitelist: checked,
                          }));
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        Admin Panel Access:
                      </label>
                      {isEditing ? (
                        <Select
                          value={securitySettings.adminPanelAccess}
                          onValueChange={(
                            value: "open" | "restricted" | "locked"
                          ) => {
                            setSecuritySettings((prev) => ({
                              ...prev,
                              adminPanelAccess: value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="restricted">
                              Restricted
                            </SelectItem>
                            <SelectItem value="locked">Locked</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="default"
                          className="capitalize"
                        >
                          {securitySettings.adminPanelAccess}
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-gray-600">
                        API Access:
                      </label>
                      {isEditing ? (
                        <Select
                          value={securitySettings.apiAccess}
                          onValueChange={(
                            value: "open" | "authenticated" | "restricted"
                          ) => {
                            setSecuritySettings((prev) => ({
                              ...prev,
                              apiAccess: value,
                            }));
                            setHasUnsavedChanges(true);
                          }}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="authenticated">
                              Authenticated
                            </SelectItem>
                            <SelectItem value="restricted">
                              Restricted
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="default"
                          className="capitalize"
                        >
                          {securitySettings.apiAccess}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Database Management Section */}
      {activeSection === "database" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Database className="h-5 w-5" />
                <span>
                  {t("admin.settings.database.title", {
                    defaultValue: "Database Management",
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-gray-900">Connection</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.database.connectionStatus", {
                          defaultValue: "Connection Status",
                        })}
                        :
                      </span>
                      <Badge
                        variant={getStatusBadgeVariant(
                          databaseStats.connectionStatus
                        )}
                      >
                        {t(
                          `admin.settings.database.${databaseStats.connectionStatus}`,
                          {
                            defaultValue: databaseStats.connectionStatus,
                          }
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Statistics</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.database.totalTables", {
                          defaultValue: "Total Tables",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {databaseStats.totalTables}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.database.totalRecords", {
                          defaultValue: "Total Records",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {databaseStats.totalRecords.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-purple-600" />
                    <h4 className="font-medium text-gray-900">Storage</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.database.databaseSize", {
                          defaultValue: "Database Size",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {databaseStats.databaseSize}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <h4 className="font-medium text-gray-900">Backup</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        {t("admin.settings.database.lastBackup", {
                          defaultValue: "Last Backup",
                        })}
                        :
                      </span>
                      <span className="text-sm font-mono">
                        {formatTimestamp(databaseStats.lastBackup)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runMaintenanceOperation(maintenanceOps[2])}
                    disabled={maintenanceOps[2].running}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {t("admin.settings.database.runMaintenance", {
                      defaultValue: "Run Maintenance",
                    })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: t("admin.settings.database.backupCreated", {
                          defaultValue: "Backup created successfully",
                        }),
                        description: "Database backup has been initiated",
                      });
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    {t("admin.settings.database.createBackup", {
                      defaultValue: "Create Backup",
                    })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast({
                        title: "Database logs",
                        description: "Opening database logs viewer",
                      });
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {t("admin.settings.database.viewLogs", {
                      defaultValue: "View Logs",
                    })}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* API Configuration Section */}
      {activeSection === "apis" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>
                  {t("admin.settings.apis.title", {
                    defaultValue: "API Configuration",
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {apiStatuses.map((api) => (
                  <div
                    key={api.name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-900">
                        {t(`admin.settings.apis.${api.name}`, {
                          defaultValue: api.name,
                        })}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getStatusBadgeVariant(api.status)}>
                          {t(`admin.settings.apis.${api.status}`, {
                            defaultValue: api.status,
                          })}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testApiConnection(api.name)}
                          disabled={api.status === "degraded"}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          {api.status === "degraded"
                            ? t("admin.settings.apis.testing", {
                                defaultValue: "Testing...",
                              })
                            : t("admin.settings.apis.testConnection", {
                                defaultValue: "Test Connection",
                              })}
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">
                          {t("admin.settings.apis.lastCheck", {
                            defaultValue: "Last Check",
                          })}
                          :
                        </span>
                        <p className="text-sm font-mono">
                          {formatTimestamp(api.lastCheck)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {t("admin.settings.apis.responseTime", {
                            defaultValue: "Response Time",
                          })}
                          :
                        </span>
                        <p className="text-sm font-mono">
                          {api.responseTime}ms
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {t("admin.settings.apis.requestCount", {
                            defaultValue: "Request Count",
                          })}
                          :
                        </span>
                        <p className="text-sm font-mono">
                          {api.requestCount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">
                          {t("admin.settings.apis.errorRate", {
                            defaultValue: "Error Rate",
                          })}
                          :
                        </span>
                        <p className="text-sm font-mono">
                          {(api.errorRate * 100).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* System Maintenance Section */}
      {activeSection === "maintenance" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>
                  {t("admin.settings.maintenance.title", {
                    defaultValue: "System Maintenance",
                  })}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {maintenanceOps.map((operation) => (
                  <div
                    key={operation.type}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {operation.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {operation.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => runMaintenanceOperation(operation)}
                        disabled={operation.running}
                      >
                        {operation.running ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            {t("admin.settings.database.maintenanceRunning", {
                              defaultValue: "Running maintenance...",
                            })}
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            {t("common.run", { defaultValue: "Run" })}
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Last run: {formatTimestamp(operation.lastRun)}
                      </span>
                      <Badge
                        variant={operation.running ? "secondary" : "outline"}
                      >
                        {operation.running ? "Running" : "Ready"}
                      </Badge>
                    </div>
                  </div>
                ))}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("admin.settings.maintenance.systemHealth", {
                          defaultValue: "System Health",
                        })}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Overall system status and performance
                      </p>
                    </div>
                    <Badge variant="default">
                      {t("admin.settings.maintenance.healthy", {
                        defaultValue: "Healthy",
                      })}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Grant Admin Dialog */}
      <Dialog
        open={showGrantDialog}
        onOpenChange={setShowGrantDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.settings.adminUsers.grantAdmin", {
                defaultValue: "Grant Admin Access",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.settings.adminUsers.confirmGrant", {
                defaultValue:
                  "Are you sure you want to grant admin privileges to this user?",
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.email}</p>
                  <p className="text-sm text-gray-600">
                    {selectedUser.full_name || "No name provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGrantDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleGrantAdmin}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t("admin.settings.adminUsers.grantAdmin", {
                defaultValue: "Grant Admin Access",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Admin Dialog */}
      <Dialog
        open={showRevokeDialog}
        onOpenChange={setShowRevokeDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("admin.settings.adminUsers.revokeAdmin", {
                defaultValue: "Revoke Admin Access",
              })}
            </DialogTitle>
            <DialogDescription>
              {t("admin.settings.adminUsers.confirmRevoke", {
                defaultValue:
                  "Are you sure you want to revoke admin privileges from this user?",
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedUser.email}</p>
                  <p className="text-sm text-gray-600">
                    {selectedUser.full_name || "No name provided"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRevokeDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevokeAdmin}
            >
              <UserMinus className="h-4 w-4 mr-2" />
              {t("admin.settings.adminUsers.revokeAdmin", {
                defaultValue: "Revoke Admin Access",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSettings;
