import React from "react";
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

// Public route wrapper
const PublicRoute = ({
  children,
  skipRedirect = false,
}: {
  children: React.ReactNode;
  skipRedirect?: boolean;
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user && !skipRedirect) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login but save the current location
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute skipRedirect={true}>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-reset-code"
          element={
            <PublicRoute skipRedirect={true}>
              <VerifyResetCode />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute skipRedirect={true}>
              <ResetPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <VerifyEmail />
            </PublicRoute>
          }
        />
        <Route
          path="/complete-signup"
          element={
            <PublicRoute>
              <CompleteSignup />
            </PublicRoute>
          }
        />
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Homepage - Public but redirects to dashboard if logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
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
        />{" "}
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
