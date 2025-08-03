import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginForm from "./components/features/auth/LoginForm";
import SignUpForm from "./components/features/auth/SignUpForm";
import ConfirmSignup from "./components/features/auth/ConfirmSignup";
import LandingPage from "./pages/landing";
import { AuthProvider, useAuth } from "../supabase/auth.tsx";
import MainLayout from "./components/layout/MainLayout";
import AuthCallback from "./components/features/auth/AuthCallback";
import ForgotPassword from "./components/features/auth/ForgotPassword";
import ResetPassword from "./components/features/auth/ResetPassword";
import ConfirmEmailChange from "@/components/features/auth/ConfirmEmailChange";
import { ProtectedGoodbyeRoute } from "@/components/features/auth/ProtectedGoodbyeRoute";
import { CookieConsentProvider } from "./contexts/CookieConsentContext";
import CookieBanner from "./components/common/cookies/CookieBanner";
import { useEffect, useState } from "react";

// Lazy load heavy components for better performance
const PricingPage = lazy(() => import("./pages/pricing"));
const PokemonDashboard = lazy(() => import("./pages/PokemonDashboard"));
const CheckoutPage = lazy(() => import("./pages/checkout"));
const CheckoutSuccessPage = lazy(() => import("./pages/checkout-success"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const Rules = lazy(() => import("./pages/Rules"));
const Contact = lazy(() => import("./pages/Contact"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const LegalNotice = lazy(() => import("./pages/LegalNotice"));
const SubscriptionManagement = lazy(() => import("@/components/features/subscription/SubscriptionManagement"));
const GoodbyePage = lazy(() => import("./pages/GoodbyePage"));
const AdminPanel = lazy(() => import("@/components/features/admin/AdminPanel"));
const InitialAdminSetup = lazy(() => import("@/components/features/admin/InitialAdminSetup"));
const ManagementZone = lazy(() => import("@/components/features/admin/ManagementZone"));

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
      />
    );
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden">
      <Routes>
        <Route
          path="/"
          element={
            <MainLayout>
              <LandingPage />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginForm />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout>
              <SignUpForm />
            </MainLayout>
          }
        />
        <Route
          path="/confirm-signup"
          element={
            <MainLayout>
              <ConfirmSignup />
            </MainLayout>
          }
        />
        <Route
          path="/pricing"
          element={
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <PricingPage />
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/search"
          element={
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <SearchPage />
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/rules"
          element={
            <MainLayout>
              <Rules />
            </MainLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <Contact />
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/cookie-policy"
          element={
            <MainLayout>
              <CookiePolicy />
            </MainLayout>
          }
        />
        <Route
          path="/privacy-policy"
          element={
            <MainLayout>
              <PrivacyPolicy />
            </MainLayout>
          }
        />
        <Route
          path="/terms-of-service"
          element={
            <MainLayout>
              <TermsOfService />
            </MainLayout>
          }
        />
        <Route
          path="/legal-notice"
          element={
            <MainLayout>
              <LegalNotice />
            </MainLayout>
          }
        />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <PokemonDashboard />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="/collection"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />
        <Route
          path="/checkout"
          element={
            <MainLayout>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <CheckoutPage />
              </Suspense>
            </MainLayout>
          }
        />
        <Route
          path="/checkout-success"
          element={
            <MainLayout>
              <CheckoutSuccessPage />
            </MainLayout>
          }
        />
        <Route
          path="/auth/confirm-signup"
          element={
            <MainLayout>
              <ConfirmSignup />
            </MainLayout>
          }
        />
        <Route
          path="/auth/callback"
          element={
            <MainLayout>
              <AuthCallback />
            </MainLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <MainLayout>
              <ForgotPassword />
            </MainLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <MainLayout>
              <ResetPassword />
            </MainLayout>
          }
        />
        <Route
          path="/confirm-email-change"
          element={
            <MainLayout>
              <ConfirmEmailChange />
            </MainLayout>
          }
        />
        <Route
          path="/subscription-management"
          element={
            <PrivateRoute>
              <MainLayout>
                <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                  <SubscriptionManagement onSectionChange={() => {}} />
                </Suspense>
              </MainLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <AdminPanel />
              </Suspense>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-setup"
          element={
            <PrivateRoute>
              <InitialAdminSetup />
            </PrivateRoute>
          }
        />
        <Route
          path="/management-zone"
          element={
            <PrivateRoute>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div></div>}>
                <ManagementZone />
              </Suspense>
            </PrivateRoute>
          }
        />
        {/* Ruta especial para la página de despedida después de eliminar la cuenta */}
        <Route
          path="/goodbye"
          element={
            <ProtectedGoodbyeRoute>
              {/* No usamos MainLayout para evitar que el usuario pueda navegar */}
              <GoodbyePage />
            </ProtectedGoodbyeRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BrowserRouter>
        <AuthProvider>
          <CookieConsentProvider>

             <AppRoutes />
            <CookieBanner />
          </CookieConsentProvider>
        </AuthProvider>
      </BrowserRouter>
    </Suspense>
  );
}
