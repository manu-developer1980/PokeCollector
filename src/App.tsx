import { Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoginForm from "./components/auth/LoginForm";
import SignUpForm from "./components/auth/SignUpForm";
import ConfirmSignup from "./components/auth/ConfirmSignup";
import Success from "./components/pages/success";
import LandingPage from "./components/pages/landing";
import PricingPage from "./components/pages/pricing";
import PokemonDashboard from "./components/pages/PokemonDashboard";
import CheckoutPage from "./components/pages/checkout";
import CheckoutSuccessPage from "./components/pages/checkout-success";
import SearchPage from "./components/pages/SearchPage";
import { AuthProvider, useAuth } from "../supabase/auth";
import MainLayout from "./components/layout/MainLayout";
import AuthCallback from "./components/auth/AuthCallback";

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
        path="/dashboard"
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
        path="/success"
        element={
          <MainLayout>
            <Success />
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
    </Routes>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Suspense>
  );
}
