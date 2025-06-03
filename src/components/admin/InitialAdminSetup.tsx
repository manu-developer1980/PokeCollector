import React, { useState } from "react";
import { useAuth } from "../../../supabase/auth";
import { supabase } from "../../../supabase/supabase";
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
        .select("is_admin")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        return;
      }

      setIsAdmin(data?.is_admin || false);
    } catch (err) {
      console.error("Error in checkAdminStatus:", err);
    }
  };

  // Grant admin privileges to current user
  const grantAdminPrivileges = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user logged in",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Update user to admin
      const { error } = await supabase
        .from("users")
        .update({ is_admin: true })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      setIsAdmin(true);
      toast({
        title: "Success!",
        description: "Admin privileges granted successfully. You can now access the admin panel.",
      });

      // Refresh the page to update admin status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("Error granting admin privileges:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to grant admin privileges",
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
              <span>Authentication Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Please log in to access the admin setup.
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
              <span>Admin Access Granted</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You already have admin privileges. You can access the admin panel.
              </AlertDescription>
            </Alert>
            <Button 
              className="w-full mt-4" 
              onClick={() => window.location.href = "/admin"}
            >
              Go to Admin Panel
            </Button>
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
            <span>Initial Admin Setup</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This is a one-time setup to grant admin privileges to your account.
              This component should be removed after initial setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Current User</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">Admin Status</p>
                <p className="text-sm text-gray-600">
                  {isAdmin === null ? "Checking..." : isAdmin ? "Admin" : "Regular User"}
                </p>
              </div>
            </div>
          </div>

          <Button
            onClick={grantAdminPrivileges}
            disabled={loading || isAdmin === true}
            className="w-full"
          >
            {loading ? "Granting Admin Privileges..." : "Grant Admin Privileges"}
          </Button>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Alternative methods:</strong></p>
            <p>1. Use Supabase Dashboard → users table → set is_admin = true</p>
            <p>2. Run SQL: UPDATE users SET is_admin = true WHERE email = '{user.email}'</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialAdminSetup;
