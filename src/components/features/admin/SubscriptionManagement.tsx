import React, { useState, useCallback, useEffect } from "react";
import { useAdminSubscription } from "@/hooks/useAdminSubscription";
import { useAdmin } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Search,
  CreditCard,
  RefreshCw,
  Edit,
  Ban,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Settings,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Eye,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
import { PlanChangeModal } from "./PlanChangeModal";

interface UserSubscriptionData {
  id: string;
  email: string;
  full_name: string | null;
  subscription: {
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
  } | null;
  overrides: Array<{
    id: string;
    override_type: string;
    original_value: string | null;
    override_value: string | null;
    reason: string | null;
    expires_at: string | null;
    is_active: boolean;
    created_at: string;
  }>;
}

const SubscriptionManagement: React.FC = () => {
  const {
    getUserSubscription,
    changePlan,
    updateSubscriptionStatus,
    syncWithStripe,
    cancelSubscription,
    createOverride,
    getUserOverrides,
    deactivateOverride,
    isChangingPlan,
  } = useAdminSubscription();
  const { getUsers, getUserById } = useAdmin();
  const { toast } = useToast();
  const { t } = useTranslation();

  // State management
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserSubscriptionData | null>(
    null
  );
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showPlanChangeDialog, setShowPlanChangeDialog] = useState(false);
  const [showStatusChangeDialog, setShowStatusChangeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);

  // All subscriptions state
  const [allSubscriptions, setAllSubscriptions] = useState<
    UserSubscriptionData[]
  >([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscriptions, setTotalSubscriptions] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"search" | "all">("all");
  const itemsPerPage = 20;

  // Form states
  const [planChangeForm, setPlanChangeForm] = useState({
    newPlan: "",
    reason: "",
  });
  const [statusChangeForm, setStatusChangeForm] = useState({
    newStatus: "",
    reason: "",
  });
  const [cancelForm, setCancelForm] = useState({
    immediate: false,
    reason: "",
  });
  const [overrideForm, setOverrideForm] = useState({
    type: "",
    originalValue: "",
    overrideValue: "",
    reason: "",
    expiresAt: "",
  });

  // Load all subscriptions
  const loadAllSubscriptions = useCallback(async () => {
    try {
      setLoading(true);

      // Get all users with their subscriptions
      const result = await getUsers(currentPage, itemsPerPage, searchTerm);

      if (!result.users) {
        setAllSubscriptions([]);
        setTotalSubscriptions(0);
        setTotalPages(1);
        return;
      }

      // Get subscription data for each user
      const subscriptionsData: UserSubscriptionData[] = await Promise.all(
        result.users.map(async (user) => {
          try {
            const subscription = await getUserSubscription(user.id);
            const overrides = await getUserOverrides(user.id);

            return {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              subscription,
              overrides,
            };
          } catch (err) {

            return {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              subscription: null,
              overrides: [],
            };
          }
        })
      );

      // Apply filters
      let filteredSubscriptions = subscriptionsData;

      if (statusFilter !== "all") {
        filteredSubscriptions = filteredSubscriptions.filter(
          (sub) => sub.subscription?.status === statusFilter
        );
      }

      // Plan filter removed - plan_type field doesn't exist in database schema

      setAllSubscriptions(filteredSubscriptions);
      setTotalSubscriptions(result.total || filteredSubscriptions.length);
      setTotalPages(
        Math.ceil((result.total || filteredSubscriptions.length) / itemsPerPage)
      );
    } catch (err) {

      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.loadSubscriptionsError", {
          defaultValue: "Failed to load subscriptions",
        }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    searchTerm,
    statusFilter,
    planFilter,
    getUsers,
    getUserSubscription,
    getUserOverrides,
    toast,
    t,
  ]);

  // Load subscriptions on component mount and when filters change
  useEffect(() => {
    if (viewMode === "all") {
      loadAllSubscriptions();
    }
  }, [loadAllSubscriptions, viewMode]);

  // Search for user by email
  const handleUserSearch = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.enterUserEmail", {
          defaultValue: "Please enter a user email to search",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // First, find the user by email
      const result = await getUsers(1, 1, searchTerm.trim());

      if (!result.users || result.users.length === 0) {
        toast({
          title: t("admin.userNotFound", { defaultValue: "User Not Found" }),
          description: t("admin.userNotFoundDescription", {
            defaultValue: "No user found with that email address",
          }),
          variant: "destructive",
        });
        return;
      }

      const user = result.users[0];

      // Get subscription details
      const subscription = await getUserSubscription(user.id);

      // Get overrides
      const overrides = await getUserOverrides(user.id);

      const userData: UserSubscriptionData = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        subscription,
        overrides,
      };

      setSelectedUser(userData);
      setShowUserDetails(true);
    } catch (err) {

      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.searchError", {
                defaultValue: "Failed to search for user",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [searchTerm, getUsers, getUserSubscription, getUserOverrides, toast, t]);

  // Handle plan change
  const handlePlanChange = useCallback(async () => {
    if (!selectedUser || !planChangeForm.newPlan || !planChangeForm.reason) {
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.fillAllFields", {
          defaultValue: "Please fill in all required fields",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await changePlan(
        selectedUser.id,
        planChangeForm.newPlan,
        planChangeForm.reason
      );

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.planChanged", {
          defaultValue: "Plan changed successfully",
        }),
      });

      setShowPlanChangeDialog(false);
      setPlanChangeForm({ newPlan: "", reason: "" });

      // Refresh user data
      handleUserSearch();
    } catch (err) {

      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.planChangeError", {
                defaultValue: "Failed to change plan",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUser, planChangeForm, changePlan, toast, t, handleUserSearch]);

  // Handle status change
  const handleStatusChange = useCallback(async () => {
    if (
      !selectedUser ||
      !statusChangeForm.newStatus ||
      !statusChangeForm.reason
    ) {
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.fillAllFields", {
          defaultValue: "Please fill in all required fields",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await updateSubscriptionStatus(
        selectedUser.id,
        statusChangeForm.newStatus,
        statusChangeForm.reason
      );

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.statusChanged", {
          defaultValue: "Subscription status changed successfully",
        }),
      });

      setShowStatusChangeDialog(false);
      setStatusChangeForm({ newStatus: "", reason: "" });

      // Refresh user data
      handleUserSearch();
    } catch (err) {
      console.error("Error changing status:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.statusChangeError", {
                defaultValue: "Failed to change subscription status",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedUser,
    statusChangeForm,
    updateSubscriptionStatus,
    toast,
    t,
    handleUserSearch,
  ]);

  // Handle Stripe sync
  const handleStripeSync = useCallback(async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const result = await syncWithStripe(selectedUser.id);

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.syncCompleted", {
          defaultValue: "Stripe synchronization completed",
        }),
      });

      setShowSyncDialog(false);

      // Show sync results
      

      // Refresh user data
      handleUserSearch();
    } catch (err) {
      console.error("Error syncing with Stripe:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.syncError", {
                defaultValue: "Failed to sync with Stripe",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUser, syncWithStripe, toast, t, handleUserSearch]);

  // Handle subscription cancellation
  const handleCancelSubscription = useCallback(async () => {
    if (!selectedUser || !cancelForm.reason) {
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.fillAllFields", {
          defaultValue: "Please fill in all required fields",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await cancelSubscription(
        selectedUser.id,
        cancelForm.immediate,
        cancelForm.reason
      );

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.subscriptionCancelled", {
          defaultValue: "Subscription cancelled successfully",
        }),
      });

      setShowCancelDialog(false);
      setCancelForm({ immediate: false, reason: "" });

      // Refresh user data
      handleUserSearch();
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.cancelError", {
                defaultValue: "Failed to cancel subscription",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    selectedUser,
    cancelForm,
    cancelSubscription,
    toast,
    t,
    handleUserSearch,
  ]);

  // Handle create override
  const handleCreateOverride = useCallback(async () => {
    if (
      !selectedUser ||
      !overrideForm.type ||
      !overrideForm.overrideValue ||
      !overrideForm.reason
    ) {
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description: t("admin.fillAllFields", {
          defaultValue: "Please fill in all required fields",
        }),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await createOverride(
        selectedUser.id,
        overrideForm.type,
        overrideForm.originalValue,
        overrideForm.overrideValue,
        overrideForm.reason,
        overrideForm.expiresAt || undefined
      );

      toast({
        title: t("admin.success", { defaultValue: "Success" }),
        description: t("admin.overrideCreated", {
          defaultValue: "Override created successfully",
        }),
      });

      setShowOverrideDialog(false);
      setOverrideForm({
        type: "",
        originalValue: "",
        overrideValue: "",
        reason: "",
        expiresAt: "",
      });

      // Refresh user data
      handleUserSearch();
    } catch (err) {
      console.error("Error creating override:", err);
      toast({
        title: t("admin.error", { defaultValue: "Error" }),
        description:
          err instanceof Error
            ? err.message
            : t("admin.overrideError", {
                defaultValue: "Failed to create override",
              }),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedUser, overrideForm, createOverride, toast, t, handleUserSearch]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("admin.subscriptionManagement", {
              defaultValue: "Subscription Management",
            })}
          </h2>
          <p className="text-gray-600">
            {t("admin.subscriptionManagementDescription", {
              defaultValue: "Manage user subscriptions, plans, and billing",
            })}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === "all" ? "default" : "outline"}
            onClick={() => setViewMode("all")}
            className="flex items-center space-x-2"
          >
            <Users className="h-4 w-4" />
            <span>
              {t("admin.allSubscriptions", {
                defaultValue: "All Subscriptions",
              })}
            </span>
          </Button>
          <Button
            variant={viewMode === "search" ? "default" : "outline"}
            onClick={() => setViewMode("search")}
            className="flex items-center space-x-2"
          >
            <Search className="h-4 w-4" />
            <span>
              {t("admin.searchUser", { defaultValue: "Search User" })}
            </span>
          </Button>
        </div>
      </div>

      {/* All Subscriptions View */}
      {viewMode === "all" && (
        <>
          {/* Filters and Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {t("admin.allSubscriptions", {
                      defaultValue: "All Subscriptions",
                    })}
                  </span>
                </span>
                <div className="text-sm text-gray-500">
                  {t("admin.totalSubscriptions", { defaultValue: "Total" })}:{" "}
                  {totalSubscriptions}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">
                    {t("admin.status", { defaultValue: "Status" })}:
                  </label>
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("admin.all", { defaultValue: "All" })}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("admin.active", { defaultValue: "Active" })}
                      </SelectItem>
                      <SelectItem value="canceled">
                        {t("admin.canceled", { defaultValue: "Canceled" })}
                      </SelectItem>
                      <SelectItem value="paused">
                        {t("admin.paused", { defaultValue: "Paused" })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">
                    {t("admin.plan", { defaultValue: "Plan" })}:
                  </label>
                  <Select
                    value={planFilter}
                    onValueChange={setPlanFilter}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("admin.all", { defaultValue: "All" })}
                      </SelectItem>
                      <SelectItem value="aprendiz">
                        {t("plans.aprendiz", { defaultValue: "Aprendiz" })}
                      </SelectItem>
                      <SelectItem value="entrenador">
                        {t("plans.entrenador", { defaultValue: "Entrenador" })}
                      </SelectItem>
                      <SelectItem value="maestro">
                        {t("plans.maestro", { defaultValue: "Maestro" })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder={t("admin.searchByEmail", {
                      defaultValue: "Search by email...",
                    })}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                <Button
                  onClick={loadAllSubscriptions}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {t("admin.refresh", { defaultValue: "Refresh" })}
                </Button>
              </div>

              {/* Subscriptions Table */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <>
                  <div className="border rounded-lg">
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
                            {t("admin.periodEnd", {
                              defaultValue: "Period End",
                            })}
                          </TableHead>
                          <TableHead>
                            {t("admin.actions", { defaultValue: "Actions" })}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allSubscriptions.map((userSub) => (
                          <TableRow key={userSub.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {userSub.full_name?.charAt(0) ||
                                      userSub.email.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {userSub.full_name || userSub.email}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {userSub.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {userSub.subscription ? (
                                <Badge
                                  className={getPlanBadgeColor(
                                    userSub.subscription.plan_type
                                  )}
                                >
                                  {t(
                                    `plans.${userSub.subscription.plan_type}`,
                                    {
                                      defaultValue:
                                        userSub.subscription.plan_type,
                                    }
                                  )}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">
                                  {t("admin.noSubscription", {
                                    defaultValue: "No subscription",
                                  })}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              {userSub.subscription ? (
                                <Badge
                                  className={getStatusBadgeColor(
                                    userSub.subscription.status
                                  )}
                                >
                                  {userSub.subscription.status}
                                </Badge>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {userSub.subscription?.current_period_end ? (
                                formatDate(
                                  userSub.subscription.current_period_end
                                )
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(userSub);
                                  setShowUserDetails(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t("admin.view", { defaultValue: "View" })}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-500">
                        {t("admin.showingResults", {
                          defaultValue:
                            "Showing {{start}} to {{end}} of {{total}} results",
                          start: (currentPage - 1) * itemsPerPage + 1,
                          end: Math.min(
                            currentPage * itemsPerPage,
                            totalSubscriptions
                          ),
                          total: totalSubscriptions,
                        })}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          {t("admin.previous", { defaultValue: "Previous" })}
                        </Button>
                        <span className="text-sm">
                          {t("admin.pageOf", {
                            defaultValue: "Page {{current}} of {{total}}",
                            current: currentPage,
                            total: totalPages,
                          })}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          {t("admin.next", { defaultValue: "Next" })}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* User Search View */}
      {viewMode === "search" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5" />
              <span>
                {t("admin.userSearch", { defaultValue: "User Search" })}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder={t("admin.enterUserEmail", {
                    defaultValue: "Enter user email...",
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleUserSearch()}
                />
              </div>
              <Button
                onClick={handleUserSearch}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {t("admin.search", { defaultValue: "Search" })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Subscription Details Dialog */}
      <Dialog
        open={showUserDetails}
        onOpenChange={setShowUserDetails}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>
                {t("admin.subscriptionDetails", {
                  defaultValue: "Subscription Details",
                })}
              </span>
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("admin.userInfo", { defaultValue: "User Information" })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback>
                        {selectedUser.full_name?.charAt(0) ||
                          selectedUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-lg">
                        {selectedUser.full_name || selectedUser.email}
                      </div>
                      <div className="text-gray-500">{selectedUser.email}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {t("admin.currentSubscription", {
                        defaultValue: "Current Subscription",
                      })}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPlanChangeDialog(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {t("admin.changePlan", { defaultValue: "Change Plan" })}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowStatusChangeDialog(true)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {t("admin.changeStatus", {
                          defaultValue: "Change Status",
                        })}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowSyncDialog(true)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        {t("admin.syncStripe", { defaultValue: "Sync Stripe" })}
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.subscription ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.plan", { defaultValue: "Plan" })}
                          </label>
                          <div className="mt-1">
                            <Badge className="bg-blue-100 text-blue-800">
                              {selectedUser.subscription.status || "Unknown"}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.status", { defaultValue: "Status" })}
                          </label>
                          <div className="mt-1">
                            <Badge
                              className={getStatusBadgeColor(
                                selectedUser.subscription.status
                              )}
                            >
                              {selectedUser.subscription.status}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.isActive", { defaultValue: "Is Active" })}
                          </label>
                          <div className="mt-1 flex items-center space-x-2">
                            {selectedUser.subscription.status === "active" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            <span className="text-sm">
                              {selectedUser.subscription.status || "Unknown"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.currentPeriodStart", {
                              defaultValue: "Current Period Start",
                            })}
                          </label>
                          <p className="text-sm mt-1">
                            {formatDate(
                              selectedUser.subscription.current_period_start
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.currentPeriodEnd", {
                              defaultValue: "Current Period End",
                            })}
                          </label>
                          <p className="text-sm mt-1">
                            {formatDate(
                              selectedUser.subscription.current_period_end
                            )}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.cancelAtPeriodEnd", {
                              defaultValue: "Cancel at Period End",
                            })}
                          </label>
                          <div className="mt-1 flex items-center space-x-2">
                            {selectedUser.subscription.cancel_at_period_end ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            <span className="text-sm">
                              {selectedUser.subscription.cancel_at_period_end
                                ? t("admin.yes", { defaultValue: "Yes" })
                                : t("admin.no", { defaultValue: "No" })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.stripeSubscriptionId", {
                              defaultValue: "Stripe Subscription ID",
                            })}
                          </label>
                          <p className="text-xs font-mono mt-1 bg-gray-50 p-2 rounded">
                            {selectedUser.subscription.stripe_subscription_id ||
                              t("admin.notConnected", {
                                defaultValue: "Not connected",
                              })}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            {t("admin.stripeCustomerId", {
                              defaultValue: "Stripe Customer ID",
                            })}
                          </label>
                          <p className="text-xs font-mono mt-1 bg-gray-50 p-2 rounded">
                            {selectedUser.subscription.customer_id ||
                              t("admin.notConnected", {
                                defaultValue: "Not connected",
                              })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noSubscription", {
                          defaultValue: "No subscription found",
                        })}
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setShowPlanChangeDialog(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("admin.createSubscription", {
                          defaultValue: "Create Subscription",
                        })}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Overrides */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {t("admin.activeOverrides", {
                        defaultValue: "Active Overrides",
                      })}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowOverrideDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t("admin.createOverride", {
                        defaultValue: "Create Override",
                      })}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedUser.overrides &&
                  selectedUser.overrides.length > 0 ? (
                    <div className="space-y-4">
                      {selectedUser.overrides.map((override) => (
                        <div
                          key={override.id}
                          className="border rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {override.override_type}
                              </div>
                              <div className="text-sm text-gray-500">
                                {override.original_value} →{" "}
                                {override.override_value}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {t("admin.reason", { defaultValue: "Reason" })}:{" "}
                                {override.reason}
                              </div>
                              {override.expires_at && (
                                <div className="text-xs text-gray-400">
                                  {t("admin.expires", {
                                    defaultValue: "Expires",
                                  })}
                                  : {formatDate(override.expires_at)}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                deactivateOverride(
                                  override.id,
                                  "Deactivated by admin"
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {t("admin.noOverrides", {
                          defaultValue: "No active overrides",
                        })}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-lg text-red-600 flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>
                      {t("admin.dangerZone", { defaultValue: "Danger Zone" })}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {t("admin.cancelSubscription", {
                          defaultValue: "Cancel Subscription",
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {t("admin.cancelSubscriptionDescription", {
                          defaultValue:
                            "Permanently cancel the user's subscription",
                        })}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowCancelDialog(true)}
                      disabled={!selectedUser.subscription}
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      {t("admin.cancel", { defaultValue: "Cancel" })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Plan Change Dialog */}
      <Dialog
        open={showPlanChangeDialog}
        onOpenChange={setShowPlanChangeDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5" />
              <span>
                {t("admin.changePlan", { defaultValue: "Change Plan" })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.changePlanDescription", {
                defaultValue:
                  "Change the user's subscription plan. This action will be logged for audit purposes.",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("admin.newPlan", { defaultValue: "New Plan" })}
              </label>
              <Select
                value={planChangeForm.newPlan}
                onValueChange={(value) =>
                  setPlanChangeForm({ ...planChangeForm, newPlan: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("admin.selectPlan", {
                      defaultValue: "Select a plan",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
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
            <div>
              <label className="text-sm font-medium">
                {t("admin.reason", { defaultValue: "Reason" })}
              </label>
              <textarea
                value={planChangeForm.reason}
                onChange={(e) =>
                  setPlanChangeForm({
                    ...planChangeForm,
                    reason: e.target.value,
                  })
                }
                placeholder={t("admin.enterReason", {
                  defaultValue: "Enter reason for plan change...",
                })}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanChangeDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              onClick={handlePlanChange}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit className="h-4 w-4 mr-2" />
              )}
              {t("admin.changePlan", { defaultValue: "Change Plan" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog
        open={showStatusChangeDialog}
        onOpenChange={setShowStatusChangeDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>
                {t("admin.changeStatus", { defaultValue: "Change Status" })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.changeStatusDescription", {
                defaultValue:
                  "Change the subscription status. This will affect the user's access to features.",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("admin.newStatus", { defaultValue: "New Status" })}
              </label>
              <Select
                value={statusChangeForm.newStatus}
                onValueChange={(value) =>
                  setStatusChangeForm({ ...statusChangeForm, newStatus: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("admin.selectStatus", {
                      defaultValue: "Select a status",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">
                    {t("admin.active", { defaultValue: "Active" })}
                  </SelectItem>
                  <SelectItem value="paused">
                    {t("admin.paused", { defaultValue: "Paused" })}
                  </SelectItem>
                  <SelectItem value="canceled">
                    {t("admin.canceled", { defaultValue: "Canceled" })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.reason", { defaultValue: "Reason" })}
              </label>
              <textarea
                value={statusChangeForm.reason}
                onChange={(e) =>
                  setStatusChangeForm({
                    ...statusChangeForm,
                    reason: e.target.value,
                  })
                }
                placeholder={t("admin.enterReason", {
                  defaultValue: "Enter reason for status change...",
                })}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusChangeDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              onClick={handleStatusChange}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Settings className="h-4 w-4 mr-2" />
              )}
              {t("admin.changeStatus", { defaultValue: "Change Status" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stripe Sync Dialog */}
      <Dialog
        open={showSyncDialog}
        onOpenChange={setShowSyncDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5" />
              <span>
                {t("admin.syncStripe", { defaultValue: "Sync with Stripe" })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.syncStripeDescription", {
                defaultValue:
                  "Synchronize subscription data with Stripe. This will fetch the latest information from Stripe and update the local database.",
              })}
            </DialogDescription>
          </DialogHeader>
          <Alert>
            <RefreshCw className="h-4 w-4" />
            <AlertDescription>
              {t("admin.syncWarning", {
                defaultValue:
                  "This will overwrite local subscription data with information from Stripe. Make sure this is what you want to do.",
              })}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSyncDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              onClick={handleStripeSync}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              {t("admin.syncNow", { defaultValue: "Sync Now" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <Ban className="h-5 w-5" />
              <span>
                {t("admin.cancelSubscription", {
                  defaultValue: "Cancel Subscription",
                })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.cancelSubscriptionWarning", {
                defaultValue:
                  "This will cancel the user's subscription. Choose whether to cancel immediately or at the end of the current billing period.",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="immediate"
                checked={cancelForm.immediate}
                onChange={(e) =>
                  setCancelForm({ ...cancelForm, immediate: e.target.checked })
                }
                className="rounded"
              />
              <label
                htmlFor="immediate"
                className="text-sm font-medium"
              >
                {t("admin.cancelImmediately", {
                  defaultValue: "Cancel immediately (user loses access now)",
                })}
              </label>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.reason", { defaultValue: "Reason" })}
              </label>
              <textarea
                value={cancelForm.reason}
                onChange={(e) =>
                  setCancelForm({ ...cancelForm, reason: e.target.value })
                }
                placeholder={t("admin.enterCancelReason", {
                  defaultValue: "Enter reason for cancellation...",
                })}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {t("admin.cancelConfirmation", {
                defaultValue:
                  "This action cannot be undone. The user will lose access to premium features.",
              })}
            </AlertDescription>
          </Alert>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Ban className="h-4 w-4 mr-2" />
              )}
              {t("admin.cancelSubscription", {
                defaultValue: "Cancel Subscription",
              })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Override Dialog */}
      <Dialog
        open={showOverrideDialog}
        onOpenChange={setShowOverrideDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>
                {t("admin.createOverride", { defaultValue: "Create Override" })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {t("admin.createOverrideDescription", {
                defaultValue:
                  "Create a temporary override for subscription limits or features.",
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">
                {t("admin.overrideType", { defaultValue: "Override Type" })}
              </label>
              <Select
                value={overrideForm.type}
                onValueChange={(value) =>
                  setOverrideForm({ ...overrideForm, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("admin.selectOverrideType", {
                      defaultValue: "Select override type",
                    })}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plan_change">
                    {t("admin.planChange", { defaultValue: "Plan Change" })}
                  </SelectItem>
                  <SelectItem value="limit_override">
                    {t("admin.limitOverride", {
                      defaultValue: "Limit Override",
                    })}
                  </SelectItem>
                  <SelectItem value="feature_access">
                    {t("admin.featureAccess", {
                      defaultValue: "Feature Access",
                    })}
                  </SelectItem>
                  <SelectItem value="billing_override">
                    {t("admin.billingOverride", {
                      defaultValue: "Billing Override",
                    })}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.originalValue", { defaultValue: "Original Value" })}
              </label>
              <Input
                value={overrideForm.originalValue}
                onChange={(e) =>
                  setOverrideForm({
                    ...overrideForm,
                    originalValue: e.target.value,
                  })
                }
                placeholder={t("admin.enterOriginalValue", {
                  defaultValue: "Enter original value...",
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.overrideValue", { defaultValue: "Override Value" })}
              </label>
              <Input
                value={overrideForm.overrideValue}
                onChange={(e) =>
                  setOverrideForm({
                    ...overrideForm,
                    overrideValue: e.target.value,
                  })
                }
                placeholder={t("admin.enterOverrideValue", {
                  defaultValue: "Enter override value...",
                })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.expirationDate", {
                  defaultValue: "Expiration Date (Optional)",
                })}
              </label>
              <Input
                type="datetime-local"
                value={overrideForm.expiresAt}
                onChange={(e) =>
                  setOverrideForm({
                    ...overrideForm,
                    expiresAt: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">
                {t("admin.reason", { defaultValue: "Reason" })}
              </label>
              <textarea
                value={overrideForm.reason}
                onChange={(e) =>
                  setOverrideForm({ ...overrideForm, reason: e.target.value })
                }
                placeholder={t("admin.enterOverrideReason", {
                  defaultValue: "Enter reason for override...",
                })}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowOverrideDialog(false)}
            >
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button
              onClick={handleCreateOverride}
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {t("admin.createOverride", { defaultValue: "Create Override" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Plan Change Loading Modal */}
      <PlanChangeModal 
        isOpen={isChangingPlan} 
        message="Actualizando plan de suscripción..." 
      />
    </div>
  );
};

export default SubscriptionManagement;
