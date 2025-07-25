import { Suspense, lazy } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ConfirmSignup from "./components/auth/ConfirmSignup";
import LandingPage from "./components/pages/landing";
import { AuthProvider, useAuth } from "../supabase/auth";
import MainLayout from "./components/layout/MainLayout";
import AuthCallback from "./components/auth/AuthCallback";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ConfirmEmailChange from "@/components/auth/ConfirmEmailChange";
import { ProtectedGoodbyeRoute } from "@/components/auth/ProtectedGoodbyeRoute";
import { CookieConsentProvider } from "./contexts/CookieConsentContext";
import CookieBanner from "./components/cookies/CookieBanner";

// Lazy load heavy components for better performance
const PricingPage = lazy(() => import("./components/pages/pricing"));
const PokemonDashboard = lazy(() => import("./components/pages/PokemonDashboard"));
const CheckoutPage = lazy(() => import("./components/pages/checkout"));
const CheckoutSuccessPage = lazy(() => import("./components/pages/checkout-success"));
const SearchPage = lazy(() => import("./components/pages/SearchPage"));
const Rules = lazy(() => import("./components/pages/Rules"));
const CookiePolicy = lazy(() => import("./components/pages/CookiePolicy"));
const PrivacyPolicy = lazy(() => import("./components/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./components/pages/TermsOfService"));
const LegalNotice = lazy(() => import("./components/pages/LegalNotice"));
const SubscriptionManagement = lazy(() => import("@/components/subscription/SubscriptionManagement"));
const GoodbyePage = lazy(() => import("@/components/pages/GoodbyePage"));
const AdminPanel = lazy(() => import("@/components/admin/AdminPanel"));
const InitialAdminSetup = lazy(() => import("@/components/admin/InitialAdminSetup"));

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
