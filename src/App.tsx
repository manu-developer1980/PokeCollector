import { Suspense } from "react";
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
import PricingPage from "./components/pages/pricing";
import PokemonDashboard from "./components/pages/PokemonDashboard";
import CheckoutPage from "./components/pages/checkout";
import CheckoutSuccessPage from "./components/pages/checkout-success";
import SearchPage from "./components/pages/SearchPage";
import Rules from "./components/pages/Rules";
import CookiePolicy from "./components/pages/CookiePolicy";
import PrivacyPolicy from "./components/pages/PrivacyPolicy";
import TermsOfService from "./components/pages/TermsOfService";
import LegalNotice from "./components/pages/LegalNotice";
import { AuthProvider, useAuth } from "../supabase/auth";
import MainLayout from "./components/layout/MainLayout";
import AuthCallback from "./components/auth/AuthCallback";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import ConfirmEmailChange from "@/components/auth/ConfirmEmailChange";
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";
import GoodbyePage from "@/components/pages/GoodbyePage";
import { ProtectedGoodbyeRoute } from "@/components/auth/ProtectedGoodbyeRoute";
import { CookieConsentProvider } from "./contexts/CookieConsentContext";
import CookieBanner from "./components/cookies/CookieBanner";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
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
              <PricingPage />
            </MainLayout>
          }
        />
        <Route
          path="/search"
          element={
            <MainLayout>
              <SearchPage />
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
              <PokemonDashboard />
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
              <CheckoutPage />
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
                <SubscriptionManagement />
              </MainLayout>
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
