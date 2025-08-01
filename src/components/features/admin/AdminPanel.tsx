import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "../../../../supabase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Users,
  CreditCard,
  Activity,
  Settings,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import LoadingSpinner from "@/components/ui/LoaderSpinner";
// Import components
import UserManagement from "./UserManagement";
import SubscriptionManagement from "./SubscriptionManagement";
import AuditLogs from "./AuditLogs";
import AdminSettings from "./AdminSettings";

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { isAdmin, isLoading, error } = useAdmin();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("users");

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
            defaultValue: "Loading admin panel...",
          })}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          variant="destructive"
          className="max-w-md"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {t("admin.error", { defaultValue: "Error loading admin panel" })}:{" "}
            {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert
          variant="destructive"
          className="max-w-md"
        >
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {t("admin.unauthorized", {
              defaultValue:
                "You don't have permission to access the admin panel",
            })}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
                <span>{t("common.back", { defaultValue: "Back" })}</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-red-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  {t("admin.title", { defaultValue: "Admin Panel" })}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {t("admin.loggedInAs", { defaultValue: "Logged in as" })}:{" "}
                {user?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger
              value="users"
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>{t("admin.users", { defaultValue: "Users" })}</span>
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="flex items-center space-x-2"
            >
              <CreditCard className="h-4 w-4" />
              <span>
                {t("admin.subscriptions", { defaultValue: "Subscriptions" })}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="audit"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>
                {t("admin.auditLogs.title", { defaultValue: "Audit Logs" })}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>
                {t("admin.settings.title", { defaultValue: "Settings" })}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="users"
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>
                    {t("admin.userManagement", {
                      defaultValue: "User Management",
                    })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="subscriptions"
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>
                    {t("admin.subscriptionManagement", {
                      defaultValue: "Subscription Management",
                    })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SubscriptionManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent
            value="audit"
            className="space-y-6"
          >
            <AuditLogs />
          </TabsContent>

          <TabsContent
            value="settings"
            className="space-y-6"
          >
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
