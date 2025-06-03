import React, { useState, useEffect, useCallback } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoaderSpinner";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  last_login_at: string | null;
  login_count: number;
  created_at: string;
  updated_at: string;
  subscriptions: Array<{
    plan_type: string;
    status: string;
    stripe_subscription_id: string | null;
  }>;
  user_statistics: Array<{
    total_cards: number;
    total_collections: number;
    total_wishlist_items: number;
    last_activity_at: string | null;
  }>;
}

const UserManagement: React.FC = () => {
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
  const [filterPlan, setFilterPlan] = useState<string>("all");

  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    is_admin: false,
    is_active: true,
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
      if (filterPlan !== "all") {
        filters.plan_type = filterPlan;
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
    filterPlan,
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
  }, [searchTerm, filterAdmin, filterActive, filterPlan]);

  // Handle user selection for details view
  const handleViewUser = async (userId: string) => {
    try {
      setLoading(true);
      const userDetails = await getUserById(userId);
      setSelectedUser(userDetails);
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
      is_admin: user.is_admin,
      is_active: user.is_active,
      notes: "", // Notes would come from user details if available
    });
    setShowEditDialog(true);
  };

  // Save user changes
  const handleSaveUser = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      await updateUser(selectedUser.id, editForm);

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.userUpdated", {
          defaultValue: "User updated successfully",
        }),
      });

      setShowEditDialog(false);
      loadUsers(); // Refresh the list
    } catch (err) {
      console.error("Error updating user:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.userUpdateError", {
                defaultValue: "Failed to update user",
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
      await deleteUser(selectedUser.id, "Deleted by admin");

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.userDeleted", {
          defaultValue: "User deleted successfully",
        }),
      });

      setShowDeleteDialog(false);
      loadUsers(); // Refresh the list
    } catch (err) {
      console.error("Error deleting user:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.userDeleteError", {
                defaultValue: "Failed to delete user",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t("admin.never", { defaultValue: "Never" });
    return new Date(dateString).toLocaleDateString();
  };

  // Get plan badge color
  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case "maestro":
        return "bg-purple-100 text-purple-800";
      case "entrenador":
        return "bg-blue-100 text-blue-800";
      case "aprendiz":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner
          message={t("admin.loadingUsers", {
            defaultValue: "Loading users...",
          })}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("admin.userManagement", { defaultValue: "User Management" })}
          </h2>
          <p className="text-gray-600">
            {t("admin.totalUsers", { defaultValue: "Total users" })}:{" "}
            {totalUsers}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={loadUsers}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("common.refresh", { defaultValue: "Refresh" })}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>
              {t("admin.filtersAndSearch", {
                defaultValue: "Filters & Search",
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("admin.searchUsers", {
                    defaultValue: "Search users...",
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Admin Filter */}
            <Select
              value={filterAdmin}
              onValueChange={setFilterAdmin}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.adminStatus", {
                    defaultValue: "Admin Status",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.allUsers", { defaultValue: "All Users" })}
                </SelectItem>
                <SelectItem value="true">
                  {t("admin.adminsOnly", { defaultValue: "Admins Only" })}
                </SelectItem>
                <SelectItem value="false">
                  {t("admin.regularUsers", { defaultValue: "Regular Users" })}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Active Filter */}
            <Select
              value={filterActive}
              onValueChange={setFilterActive}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.activeStatus", {
                    defaultValue: "Active Status",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.allStatuses", { defaultValue: "All Statuses" })}
                </SelectItem>
                <SelectItem value="true">
                  {t("admin.activeUsers", { defaultValue: "Active Users" })}
                </SelectItem>
                <SelectItem value="false">
                  {t("admin.inactiveUsers", { defaultValue: "Inactive Users" })}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Plan Filter */}
            <Select
              value={filterPlan}
              onValueChange={setFilterPlan}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={t("admin.planType", {
                    defaultValue: "Plan Type",
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {t("admin.allPlans", { defaultValue: "All Plans" })}
                </SelectItem>
                <SelectItem value="aprendiz">
                  {t("plans.aprendiz", { defaultValue: "Apprentice" })}
                </SelectItem>
                <SelectItem value="entrenador">
                  {t("plans.entrenador", { defaultValue: "Trainer" })}
                </SelectItem>
                <SelectItem value="maestro">
                  {t("plans.maestro", { defaultValue: "Master" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("admin.user", { defaultValue: "User" })}
                </TableHead>
                <TableHead>
                  {t("admin.plan", { defaultValue: "Plan" })}
                </TableHead>
                <TableHead>
                  {t("admin.status", { defaultValue: "Status" })}
                </TableHead>
                <TableHead>
                  {t("admin.lastLogin", { defaultValue: "Last Login" })}
                </TableHead>
                <TableHead>
                  {t("admin.statistics", { defaultValue: "Statistics" })}
                </TableHead>
                <TableHead>
                  {t("admin.actions", { defaultValue: "Actions" })}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const subscription = user.subscriptions?.[0];
                const stats = user.user_statistics?.[0];

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {user.full_name?.charAt(0) ||
                              user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.full_name || user.email}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {user.is_admin && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                              >
                                <Shield className="h-3 w-3 mr-1" />
                                {t("admin.admin", { defaultValue: "Admin" })}
                              </Badge>
                            )}
                            {!user.is_active && (
                              <Badge
                                variant="destructive"
                                className="text-xs"
                              >
                                {t("admin.inactive", {
                                  defaultValue: "Inactive",
                                })}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {subscription && (
                        <Badge
                          className={getPlanBadgeColor(subscription.plan_type)}
                        >
                          {t(`plans.${subscription.plan_type}`, {
                            defaultValue: subscription.plan_type,
                          })}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {subscription && (
                        <Badge
                          className={getStatusBadgeColor(subscription.status)}
                        >
                          {subscription.status}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(user.last_login_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {user.login_count}{" "}
                        {t("admin.logins", { defaultValue: "logins" })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {stats && (
                        <div className="text-sm space-y-1">
                          <div>
                            {stats.total_cards}{" "}
                            {t("admin.cards", { defaultValue: "cards" })}
                          </div>
                          <div>
                            {stats.total_collections}{" "}
                            {t("admin.collections", {
                              defaultValue: "collections",
                            })}
                          </div>
                          <div>
                            {stats.total_wishlist_items}{" "}
                            {t("admin.wishlist", { defaultValue: "wishlist" })}
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDeleteDialog(true);
                          }}
                          className="text-red-600 hover:text-red-700"
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
          <div className="text-sm text-gray-500">
            {t("pagination.showing", { defaultValue: "Showing" })}{" "}
            {(currentPage - 1) * 20 + 1} -{" "}
            {Math.min(currentPage * 20, totalUsers)}{" "}
            {t("pagination.of", { defaultValue: "of" })} {totalUsers}{" "}
            {t("pagination.results", { defaultValue: "results" })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              {t("pagination.previous", { defaultValue: "Previous" })}
            </Button>
            <span className="text-sm">
              {t("common.page", { defaultValue: "Page" })} {currentPage}{" "}
              {t("pagination.of", { defaultValue: "of" })} {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t("pagination.next", { defaultValue: "Next" })}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>
                {t("admin.userDetails", { defaultValue: "User Details" })}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t("admin.basicInfo", {
                        defaultValue: "Basic Information",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t("admin.email", { defaultValue: "Email" })}
                      </label>
                      <p className="text-sm">{selectedUser.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t("admin.fullName", { defaultValue: "Full Name" })}
                      </label>
                      <p className="text-sm">
                        {selectedUser.full_name ||
                          t("admin.notProvided", {
                            defaultValue: "Not provided",
                          })}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t("admin.registrationDate", {
                          defaultValue: "Registration Date",
                        })}
                      </label>
                      <p className="text-sm">
                        {formatDate(selectedUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t("admin.lastLogin", { defaultValue: "Last Login" })}
                      </label>
                      <p className="text-sm">
                        {formatDate(selectedUser.last_login_at)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t("admin.loginCount", { defaultValue: "Login Count" })}
                      </label>
                      <p className="text-sm">{selectedUser.login_count}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        {selectedUser.is_admin ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ShieldOff className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm">
                          {selectedUser.is_admin
                            ? t("admin.admin", { defaultValue: "Admin" })
                            : t("admin.regularUser", {
                                defaultValue: "Regular User",
                              })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            selectedUser.is_active
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm">
                          {selectedUser.is_active
                            ? t("admin.active", { defaultValue: "Active" })
                            : t("admin.inactive", { defaultValue: "Inactive" })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Subscription Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>
                        {t("admin.subscriptionInfo", {
                          defaultValue: "Subscription Information",
                        })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedUser.subscriptions &&
                    selectedUser.subscriptions.length > 0 ? (
                      selectedUser.subscriptions.map((sub, index) => (
                        <div
                          key={index}
                          className="space-y-2"
                        >
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              {t("admin.plan", { defaultValue: "Plan" })}
                            </label>
                            <p className="text-sm">
                              <Badge
                                className={getPlanBadgeColor(sub.plan_type)}
                              >
                                {t(`plans.${sub.plan_type}`, {
                                  defaultValue: sub.plan_type,
                                })}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              {t("admin.status", { defaultValue: "Status" })}
                            </label>
                            <p className="text-sm">
                              <Badge
                                className={getStatusBadgeColor(sub.status)}
                              >
                                {sub.status}
                              </Badge>
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              {t("admin.stripeSubscription", {
                                defaultValue: "Stripe Subscription",
                              })}
                            </label>
                            <p className="text-xs font-mono">
                              {sub.stripe_subscription_id ||
                                t("admin.notConnected", {
                                  defaultValue: "Not connected",
                                })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        {t("admin.noSubscription", {
                          defaultValue: "No subscription found",
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>
                      {t("admin.userStatistics", {
                        defaultValue: "User Statistics",
                      })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.user_statistics &&
                  selectedUser.user_statistics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedUser.user_statistics[0].total_cards}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("admin.totalCards", {
                            defaultValue: "Total Cards",
                          })}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {selectedUser.user_statistics[0].total_collections}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("admin.totalCollections", {
                            defaultValue: "Total Collections",
                          })}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedUser.user_statistics[0].total_wishlist_items}
                        </div>
                        <div className="text-sm text-gray-600">
                          {t("admin.totalWishlistItems", {
                            defaultValue: "Total Wishlist Items",
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {t("admin.noStatistics", {
                        defaultValue: "No statistics available",
                      })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>{t("admin.editUser", { defaultValue: "Edit User" })}</span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.editUserDescription", {
                defaultValue:
                  "Make changes to the user's information and permissions.",
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {t("admin.fullName", { defaultValue: "Full Name" })}
                </label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                  placeholder={t("admin.enterFullName", {
                    defaultValue: "Enter full name",
                  })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_admin"
                  checked={editForm.is_admin}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_admin: e.target.checked })
                  }
                  className="rounded"
                />
                <label
                  htmlFor="is_admin"
                  className="text-sm font-medium"
                >
                  {t("admin.adminPrivileges", {
                    defaultValue: "Admin Privileges",
                  })}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editForm.is_active}
                  onChange={(e) =>
                    setEditForm({ ...editForm, is_active: e.target.checked })
                  }
                  className="rounded"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium"
                >
                  {t("admin.activeAccount", { defaultValue: "Active Account" })}
                </label>
              </div>
              <div>
                <label className="text-sm font-medium">
                  {t("admin.notes", { defaultValue: "Notes" })}
                </label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) =>
                    setEditForm({ ...editForm, notes: e.target.value })
                  }
                  placeholder={t("admin.enterNotes", {
                    defaultValue: "Enter admin notes...",
                  })}
                  className="w-full p-2 border rounded-md text-sm"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              onClick={handleSaveUser}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {t("common.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>
                {t("admin.deleteUser", { defaultValue: "Delete User" })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.deleteUserWarning", {
                defaultValue:
                  "This action cannot be undone. This will permanently delete the user account and all associated data.",
              })}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {selectedUser.full_name?.charAt(0) ||
                        selectedUser.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedUser.full_name || selectedUser.email}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedUser.email}
                    </div>
                  </div>
                </div>
              </div>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {t("admin.deleteConfirmation", {
                    defaultValue: "Type 'DELETE' to confirm this action",
                  })}
                </AlertDescription>
              </Alert>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {t("admin.deleteUser", { defaultValue: "Delete User" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
