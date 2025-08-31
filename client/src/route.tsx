import React, { useRef, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import UserSchedulePage from "./pages/UserSchedule";

// Lazy load components for better performance
const HomePage = React.lazy(() => import("./pages/Homepage"));
const Login = React.lazy(() => import("./pages/Login"));
const SignUp = React.lazy(() => import("./pages/SignUp"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const VerifyResetCode = React.lazy(() => import("./pages/VerifyResetCode"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Calendar = React.lazy(() => import("./pages/Calendar"));
const Events = React.lazy(() => import("./pages/Events"));
const CreateEvent = React.lazy(() => import("./pages/CreateEvent"));
const Unauthorized = React.lazy(() => import("./pages/Unauthorized"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const CompleteSignup = React.lazy(() => import("./pages/CompleteSignup"));
const TeamMembers = React.lazy(() => import("./pages/TeamMembers"));

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
  </div>
);

// Auth route wrapper - redirects logged-in users to dashboard
const AuthRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const lastRedirectRef = useRef<string | null>(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  // If user is already logged in, redirect to dashboard
  if (user) {
    if (lastRedirectRef.current === "/dashboard") {
      console.warn("Prevented duplicate redirect to dashboard");
      return <LoadingSpinner />;
    }
    lastRedirectRef.current = "/dashboard";
    return <Navigate to="/dashboard" replace />;
  }

  // Reset redirect tracking when not authenticated
  lastRedirectRef.current = null;
  return <>{children}</>;
};

// Protected route wrapper with navigation throttling
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const lastRedirectRef = useRef<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login but prevent duplicate redirects
  if (!user) {
    if (lastRedirectRef.current === "/login") {
      console.warn("Prevented duplicate redirect to login");
      return <LoadingSpinner />;
    }
    lastRedirectRef.current = "/login";
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Reset redirect tracking when authenticated
  lastRedirectRef.current = null;
  return <>{children}</>;
};

const AppRoutes = () => {
  const location = useLocation();

  // Debug logging to track navigation
  useEffect(() => {
    console.log(`Navigated to: ${location.pathname}`);
  }, [location.pathname]);

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Homepage - Always accessible, no automatic redirect */}
        <Route path="/" element={<HomePage />} />

        {/* Auth Routes - Redirect logged-in users to dashboard */}
        <Route
          path="/login"
          element={
            <AuthRoute>
              <Login />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute>
              <SignUp />
            </AuthRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRoute>
              <ForgotPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-reset-code"
          element={
            <AuthRoute>
              <VerifyResetCode />
            </AuthRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthRoute>
              <ResetPassword />
            </AuthRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <AuthRoute>
              <VerifyEmail />
            </AuthRoute>
          }
        />
        <Route
          path="/complete-signup"
          element={
            <AuthRoute>
              <CompleteSignup />
            </AuthRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/new"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/team-members"
          element={
            <ProtectedRoute>
              <TeamMembers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-schedule"
          element={
            <ProtectedRoute>
              <UserSchedulePage />
            </ProtectedRoute>
          }
        />
        {/* 404 - Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </React.Suspense>
  );
};

export default AppRoutes;
