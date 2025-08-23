import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import {
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Activity,
  Database,
  Clock,
  Globe,
  Monitor,
  RefreshCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { useAdmin, type AuditLog } from "@/hooks/useAdmin";

interface AuditLogFilters {
  admin_user_id?: string;
  target_user_id?: string;
  action?: string;
  entity_type?: string;
  date_from?: string;
  date_to?: string;
}

interface AuditLogData extends AuditLog {
  admin_email?: string;
  target_email?: string;
  id: string;
  admin_user_id: string | null;
  target_user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: any;
  new_values: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

const AuditLogs: React.FC = () => {
  const { getAuditLogs, getUsers, getUserById } = useAdmin();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [logs, setLogs] = useState<AuditLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [pageSize] = useState(50);

  // Filter state
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Available filter options
  const [adminUsers, setAdminUsers] = useState<
    Array<{ id: string; email: string }>
  >([]);
  const [targetUsers, setTargetUsers] = useState<
    Array<{ id: string; email: string }>
  >([]);

  const actionTypes = [
    "CREATE",
    "UPDATE",
    "DELETE",
    "LOGIN",
    "LOGOUT",
    "PLAN_CHANGE",
    "STATUS_CHANGE",
    "OVERRIDE_CREATE",
    "OVERRIDE_DEACTIVATE",
    "SYNC_STRIPE",
    "CANCEL_SUBSCRIPTION",
  ];

  const entityTypes = [
    "user",
    "subscription",
    "collection",
    "wishlist",
    "override",
    "admin",
  ];

  // Load audit logs
  const loadAuditLogs = useCallback(
    async (page: number = 1, appliedFilters: AuditLogFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getAuditLogs(page, pageSize, appliedFilters);

        // Enrich logs with user emails
        const enrichedLogs = await Promise.all(
          result.logs.map(async (log) => {
            const auditLog = log as AuditLog;
            const enrichedLog: AuditLogData = { ...auditLog };

            // Get admin email if admin_user_id exists
            if (auditLog.admin_user_id) {
              try {
                const adminUser = await getUserById(auditLog.admin_user_id);
                if (adminUser && 'email' in adminUser) {
                  enrichedLog.admin_email = adminUser.email as string;
                }
              } catch (err) {
                console.warn("Could not fetch admin user email:", err);
              }
            }

            // Get target email if target_user_id exists
            if (auditLog.target_user_id) {
              try {
                const targetUser = await getUserById(auditLog.target_user_id);
                if (targetUser && 'email' in targetUser) {
                  enrichedLog.target_email = targetUser.email as string;
                }
              } catch (err) {
                console.warn("Could not fetch target user email:", err);
              }
            }

            return enrichedLog;
          })
        );

        setLogs(enrichedLogs);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalLogs(result.total);
      } catch (err) {
        console.error("Error loading audit logs:", err);
        setError(
          t("admin.auditLogs.errors.loadFailed", {
            defaultValue: "Failed to load audit logs",
          })
        );
        toast({
          title: t("admin.auditLogs.errors.loadFailed", {
            defaultValue: "Failed to load audit logs",
          }),
          description: err instanceof Error ? err.message : "Unknown error",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [getAuditLogs, getUserById, pageSize, t, toast]
  );

  // Load initial data
  useEffect(() => {
    loadAuditLogs(1, filters);
  }, [loadAuditLogs, filters]);

  // Handle search
  const handleSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      loadAuditLogs(1, filters);
      return;
    }

    try {
      setLoading(true);

      // Search for users by email to get their IDs
      const userResult = await getUsers(1, 100, searchTerm.trim());
      const userIds = userResult.users?.map((user) => user.id) || [];

      // Apply search as filter
      const searchFilters: AuditLogFilters = {
        ...filters,
        // We'll need to modify the backend to support email search
        // For now, we'll search by user IDs
      };

      loadAuditLogs(1, searchFilters);
    } catch (err) {
      console.error("Error searching audit logs:", err);
      toast({
        title: t("admin.auditLogs.errors.filterError", {
          defaultValue: "Error applying filters",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  }, [searchTerm, filters, getUsers, loadAuditLogs, t, toast]);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (key: keyof AuditLogFilters, value: string) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value || undefined,
      }));
    },
    []
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setFilters({});
    setSearchTerm("");
    loadAuditLogs(1, {});
  }, [loadAuditLogs]);

  // Toggle row expansion
  const toggleRowExpansion = useCallback((logId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  }, []);

  // Export logs to CSV
  const exportLogs = useCallback(async () => {
    try {
      setExporting(true);

      // Get all logs with current filters
      const result = await getAuditLogs(1, 10000, filters); // Large limit to get all

      // Convert to CSV
      const headers = [
        "Timestamp",
        "Admin Email",
        "Action",
        "Entity Type",
        "Entity ID",
        "Target Email",
        "IP Address",
        "User Agent",
        "Old Values",
        "New Values",
        "Metadata",
      ];

      const csvContent = [
        headers.join(","),
        ...result.logs.map((log) =>
          [
            new Date(log.created_at).toISOString(),
            log.admin_user_id || "System",
            log.action,
            log.entity_type,
            log.entity_id || "",
            log.target_user_id || "",
            log.ip_address || "",
            log.user_agent || "",
            JSON.stringify(log.old_values || {}),
            JSON.stringify(log.new_values || {}),
            JSON.stringify(log.metadata || {}),
          ]
            .map((field) => `"${String(field).replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: t("admin.auditLogs.export.success", {
          defaultValue: "Logs exported successfully",
        }),
        description: `${result.logs.length} logs exported to CSV`,
      });
    } catch (err) {
      console.error("Error exporting logs:", err);
      toast({
        title: t("admin.auditLogs.export.error", {
          defaultValue: "Failed to export logs",
        }),
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  }, [getAuditLogs, filters, t, toast]);

  // Format timestamp
  const formatTimestamp = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  }, []);

  // Get action badge variant
  const getActionBadgeVariant = useCallback((action: string) => {
    switch (action) {
      case "CREATE":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      case "LOGIN":
      case "LOGOUT":
        return "outline";
      default:
        return "secondary";
    }
  }, []);

  if (loading && logs.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner
          message={t("admin.auditLogs.loading", {
            defaultValue: "Loading audit logs...",
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
            {t("admin.auditLogs.title", { defaultValue: "Audit Logs" })}
          </h2>
          <p className="text-gray-600 mt-1">
            {t("admin.auditLogs.description", {
              defaultValue: "Complete history of administrative actions",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAuditLogs(currentPage, filters)}
            disabled={loading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
            />
            {t("common.refresh", { defaultValue: "Refresh" })}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            disabled={exporting || logs.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {exporting
              ? t("admin.auditLogs.export.exporting", {
                  defaultValue: "Exporting...",
                })
              : t("admin.auditLogs.export.button", {
                  defaultValue: "Export Logs",
                })}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">
                  {t("admin.auditLogs.totalLogs", {
                    defaultValue: "Total logs",
                  })}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalLogs.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">
                  {t("common.currentPage", { defaultValue: "Current page" })}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPage} / {totalPages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">
                  {t("common.showing", { defaultValue: "Showing" })}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {logs.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>
                {t("admin.auditLogs.filters.title", {
                  defaultValue: "Filters & Search",
                })}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <Collapsible
          open={showFilters}
          onOpenChange={setShowFilters}
        >
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder={t(
                      "admin.auditLogs.filters.searchPlaceholder",
                      {
                        defaultValue: "Search by email...",
                      }
                    )}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {t("common.search", { defaultValue: "Search" })}
                </Button>
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Action Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t("admin.auditLogs.filters.action", {
                      defaultValue: "Action",
                    })}
                  </label>
                  <Select
                    value={filters.action || ""}
                    onValueChange={(value) =>
                      handleFilterChange("action", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("admin.auditLogs.filters.allActions", {
                          defaultValue: "All Actions",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t("admin.auditLogs.filters.allActions", {
                          defaultValue: "All Actions",
                        })}
                      </SelectItem>
                      {actionTypes.map((action) => (
                        <SelectItem
                          key={action}
                          value={action}
                        >
                          {t(`admin.auditLogs.actions.${action}`, {
                            defaultValue: action,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Entity Type Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t("admin.auditLogs.filters.entityType", {
                      defaultValue: "Entity Type",
                    })}
                  </label>
                  <Select
                    value={filters.entity_type || ""}
                    onValueChange={(value) =>
                      handleFilterChange("entity_type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("admin.auditLogs.filters.allEntities", {
                          defaultValue: "All Entities",
                        })}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {t("admin.auditLogs.filters.allEntities", {
                          defaultValue: "All Entities",
                        })}
                      </SelectItem>
                      {entityTypes.map((entity) => (
                        <SelectItem
                          key={entity}
                          value={entity}
                        >
                          {t(`admin.auditLogs.entities.${entity}`, {
                            defaultValue: entity,
                          })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t("admin.auditLogs.filters.dateFrom", {
                      defaultValue: "From",
                    })}
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.date_from || ""}
                    onChange={(e) =>
                      handleFilterChange("date_from", e.target.value)
                    }
                  />
                </div>

                {/* Date To */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {t("admin.auditLogs.filters.dateTo", {
                      defaultValue: "To",
                    })}
                  </label>
                  <Input
                    type="datetime-local"
                    value={filters.date_to || ""}
                    onChange={(e) =>
                      handleFilterChange("date_to", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadAuditLogs(1, filters)}
                  disabled={loading}
                >
                  {t("admin.auditLogs.filters.applyFilters", {
                    defaultValue: "Apply Filters",
                  })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={loading}
                >
                  {t("admin.auditLogs.filters.clearFilters", {
                    defaultValue: "Clear Filters",
                  })}
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>
              {t("admin.auditLogs.title", { defaultValue: "Audit Logs" })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("admin.auditLogs.noLogs", {
                  defaultValue: "No audit logs found",
                })}
              </h3>
              <p className="text-gray-600">
                {loading
                  ? t("admin.auditLogs.loading", {
                      defaultValue: "Loading audit logs...",
                    })
                  : t("admin.auditLogs.noLogs", {
                      defaultValue: "No audit logs found",
                    })}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>
                        {t("admin.auditLogs.table.timestamp", {
                          defaultValue: "Timestamp",
                        })}
                      </TableHead>
                      <TableHead>
                        {t("admin.auditLogs.table.admin", {
                          defaultValue: "Admin",
                        })}
                      </TableHead>
                      <TableHead>
                        {t("admin.auditLogs.table.action", {
                          defaultValue: "Action",
                        })}
                      </TableHead>
                      <TableHead>
                        {t("admin.auditLogs.table.entity", {
                          defaultValue: "Entity",
                        })}
                      </TableHead>
                      <TableHead>
                        {t("admin.auditLogs.table.target", {
                          defaultValue: "Target",
                        })}
                      </TableHead>
                      <TableHead className="text-right">
                        {t("admin.auditLogs.table.details", {
                          defaultValue: "Details",
                        })}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <React.Fragment key={log.id}>
                        <TableRow className="hover:bg-gray-50">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(log.id)}
                              className="p-1"
                            >
                              {expandedRows.has(log.id) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {formatTimestamp(log.created_at)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {log.admin_email ||
                                  log.admin_user_id ||
                                  t("admin.auditLogs.details.unknown", {
                                    defaultValue: "Unknown",
                                  })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={getActionBadgeVariant(log.action)}>
                              {t(`admin.auditLogs.actions.${log.action}`, {
                                defaultValue: log.action,
                              })}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Database className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {t(
                                  `admin.auditLogs.entities.${log.entity_type}`,
                                  {
                                    defaultValue: log.entity_type,
                                  }
                                )}
                                {log.entity_id && (
                                  <span className="text-gray-500 ml-1">
                                    ({log.entity_id.substring(0, 8)}...)
                                  </span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {log.target_email || log.target_user_id ? (
                              <div className="flex items-center space-x-2">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  {log.target_email ||
                                    (log.target_user_id
                                      ? `${log.target_user_id.substring(
                                          0,
                                          8
                                        )}...`
                                      : "")}
                                </span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleRowExpansion(log.id)}
                            >
                              {expandedRows.has(log.id)
                                ? t("admin.auditLogs.table.hideDetails", {
                                    defaultValue: "Hide Details",
                                  })
                                : t("admin.auditLogs.table.viewDetails", {
                                    defaultValue: "View Details",
                                  })}
                            </Button>
                          </TableCell>
                        </TableRow>

                        {/* Expanded Details Row */}
                        {expandedRows.has(log.id) && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="bg-gray-50 p-6"
                            >
                              <div className="space-y-4">
                                <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                  <Activity className="h-5 w-5" />
                                  <span>
                                    {t("admin.auditLogs.details.title", {
                                      defaultValue: "Action Details",
                                    })}
                                  </span>
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                  {/* Basic Information */}
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-gray-900">
                                      Basic Information
                                    </h5>

                                    <div className="space-y-2 text-sm">
                                      <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">
                                          {t(
                                            "admin.auditLogs.details.timestamp",
                                            { defaultValue: "Timestamp" }
                                          )}
                                          :
                                        </span>
                                        <span className="font-mono">
                                          {formatTimestamp(log.created_at)}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">
                                          {t(
                                            "admin.auditLogs.details.adminUser",
                                            { defaultValue: "Admin User" }
                                          )}
                                          :
                                        </span>
                                        <span>
                                          {log.admin_email ||
                                            log.admin_user_id ||
                                            t(
                                              "admin.auditLogs.details.unknown",
                                              { defaultValue: "Unknown" }
                                            )}
                                        </span>
                                      </div>

                                      {(log.target_email ||
                                        log.target_user_id) && (
                                        <div className="flex items-center space-x-2">
                                          <User className="h-4 w-4 text-gray-400" />
                                          <span className="font-medium">
                                            {t(
                                              "admin.auditLogs.details.targetUser",
                                              { defaultValue: "Target User" }
                                            )}
                                            :
                                          </span>
                                          <span>
                                            {log.target_email ||
                                              log.target_user_id}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Technical Information */}
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-gray-900">
                                      Technical Information
                                    </h5>

                                    <div className="space-y-2 text-sm">
                                      {log.ip_address && (
                                        <div className="flex items-center space-x-2">
                                          <Globe className="h-4 w-4 text-gray-400" />
                                          <span className="font-medium">
                                            {t(
                                              "admin.auditLogs.details.ipAddress",
                                              { defaultValue: "IP Address" }
                                            )}
                                            :
                                          </span>
                                          <span className="font-mono">
                                            {log.ip_address}
                                          </span>
                                        </div>
                                      )}

                                      {log.user_agent && (
                                        <div className="flex items-start space-x-2">
                                          <Monitor className="h-4 w-4 text-gray-400 mt-0.5" />
                                          <span className="font-medium">
                                            {t(
                                              "admin.auditLogs.details.userAgent",
                                              { defaultValue: "User Agent" }
                                            )}
                                            :
                                          </span>
                                          <span className="text-xs break-all">
                                            {log.user_agent}
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  {log.metadata &&
                                    Object.keys(log.metadata).length > 0 && (
                                      <div className="space-y-3">
                                        <h5 className="font-medium text-gray-900">
                                          {t(
                                            "admin.auditLogs.details.metadata",
                                            { defaultValue: "Metadata" }
                                          )}
                                        </h5>
                                        <div className="bg-white p-3 rounded border">
                                          <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                                            {JSON.stringify(
                                              log.metadata,
                                              null,
                                              2
                                            )}
                                          </pre>
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Changes Section */}
                                {(log.old_values || log.new_values) && (
                                  <div className="space-y-3">
                                    <h5 className="font-medium text-gray-900 flex items-center space-x-2">
                                      <Database className="h-5 w-5" />
                                      <span>
                                        {t("admin.auditLogs.details.changes", {
                                          defaultValue: "Changes",
                                        })}
                                      </span>
                                    </h5>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                      {/* Old Values */}
                                      {log.old_values &&
                                        Object.keys(log.old_values).length >
                                          0 && (
                                          <div>
                                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                                              {t(
                                                "admin.auditLogs.details.oldValues",
                                                {
                                                  defaultValue:
                                                    "Previous Values",
                                                }
                                              )}
                                            </h6>
                                            <div className="bg-red-50 border border-red-200 p-3 rounded">
                                              <pre className="text-xs text-red-800 whitespace-pre-wrap">
                                                {JSON.stringify(
                                                  log.old_values,
                                                  null,
                                                  2
                                                )}
                                              </pre>
                                            </div>
                                          </div>
                                        )}

                                      {/* New Values */}
                                      {log.new_values &&
                                        Object.keys(log.new_values).length >
                                          0 && (
                                          <div>
                                            <h6 className="text-sm font-medium text-gray-700 mb-2">
                                              {t(
                                                "admin.auditLogs.details.newValues",
                                                { defaultValue: "New Values" }
                                              )}
                                            </h6>
                                            <div className="bg-green-50 border border-green-200 p-3 rounded">
                                              <pre className="text-xs text-green-800 whitespace-pre-wrap">
                                                {JSON.stringify(
                                                  log.new_values,
                                                  null,
                                                  2
                                                )}
                                              </pre>
                                            </div>
                                          </div>
                                        )}
                                    </div>

                                    {(!log.old_values ||
                                      Object.keys(log.old_values).length ===
                                        0) &&
                                      (!log.new_values ||
                                        Object.keys(log.new_values).length ===
                                          0) && (
                                        <p className="text-gray-500 text-sm italic">
                                          {t(
                                            "admin.auditLogs.details.noChanges",
                                            {
                                              defaultValue:
                                                "No changes recorded",
                                            }
                                          )}
                                        </p>
                                      )}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {t("pagination.showing", { defaultValue: "Showing" })}{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    {t("pagination.of", { defaultValue: "of" })}{" "}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, totalLogs)}
                    </span>{" "}
                    {t("pagination.of", { defaultValue: "of" })}{" "}
                    <span className="font-medium">{totalLogs}</span>{" "}
                    {t("admin.auditLogs.totalLogs", {
                      defaultValue: "Total logs",
                    }).toLowerCase()}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAuditLogs(currentPage - 1, filters)}
                      disabled={currentPage <= 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("pagination.previous", { defaultValue: "Previous" })}
                    </Button>

                    <div className="flex items-center space-x-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => loadAuditLogs(pageNum, filters)}
                              disabled={loading}
                              className="w-10"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadAuditLogs(currentPage + 1, filters)}
                      disabled={currentPage >= totalPages || loading}
                    >
                      {t("pagination.next", { defaultValue: "Next" })}
                      <ChevronRightIcon className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogs;
