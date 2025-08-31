import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate, Navigate, useLocation, Location } from "react-router-dom";
import * as authService from "../services/authService";
import axios from "axios";

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isVerified: boolean;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  // Add other user properties as needed
}

interface UpdateProfileData {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string
  ) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<string>; // Returns token for completeSignup
  completeSignup: (
    name: string,
    password: string,
    token: string
  ) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

const getStoredAuthData = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const userStr = localStorage.getItem(USER_KEY);
  let user = null;

  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error("Failed to parse stored user data", e);
      localStorage.removeItem(USER_KEY);
    }
  }

  return { token, user };
};

const setAuthData = (token: string, user: User | null) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  delete axios.defaults.headers.common["Authorization"];
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const { user } = getStoredAuthData();
    return user;
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const clearError = () => setError(null);

  // Check if user is already logged in on initial load
  useEffect(() => {
    const { token, user: storedUser } = getStoredAuthData();

    if (token) {
      setUser(storedUser);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Don't verify token immediately to prevent navigation loops
      // Just set the user from stored data and let subsequent requests verify the token
      setLoading(false);

      // If we're on the login or signup page, redirect to home
      if (["/login", "/signup"].includes(location.pathname)) {
        navigate("/", { replace: true });
      }
    } else {
      setLoading(false);
      // Only redirect to login if not on a public route
      const publicRoutes = [
        "/",
        "/login",
        "/signup",
        "/forgot-password",
        "/verify-reset-code",
        "/reset-password",
        "/verify-email",
        "/complete-signup",
      ];
      if (!publicRoutes.some((route) => location.pathname.startsWith(route))) {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);

      if (!response || !response.token) {
        throw new Error("No token received from server");
      }

      // Set the token in axios headers and local storage
      const { token, user } = response;

      if (!user) {
        throw new Error("No user data received");
      }

      // Update state and storage
      setUser(user);
      setAuthData(token, user);

      // Redirect to home or previous location
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Login failed";
      setError(errorMessage);
      clearAuthData();
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // First request verification code
      await authService.signupEmailcode(email);
      // The actual signup will be completed after email verification
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token } = await authService.emailcodeVerify(email, code);
      return token;
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (
    name: string,
    password: string,
    token: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.completeSignup(name, password, token);
      setUser(userData);
      setAuthData(userData.token, userData);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to complete signup"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare the update data
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.newPassword) {
        if (!data.currentPassword) {
          throw new Error("Current password is required to change password");
        }
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }

      // In a real app, you would make an API call to update the profile
      // For now, we'll simulate a successful update
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update the user in the context
      if (user) {
        setUser({
          ...user,
          name: data.name || user.name,
          // In a real app, you would get the updated user data from the API
          updatedAt: new Date().toISOString(),
        });
      }

      return Promise.resolve();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    setUser(null);
    navigate("/login", { replace: true });
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to request password reset"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      // First verify the code
      const { token } = await authService.forgotPasswordcodeVerify(email, code);
      // Then reset the password
      await authService.forgotPasswordfill(email, newPassword, token);
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    clearError,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    completeSignup,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  redirectTo = "/login",
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!user) {
    // Store the attempted URL for redirecting after login
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  if (requireAdmin && !user.isAdmin) {
    // User is logged in but not an admin
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

/**
 * Higher Order Component for protecting routes
 * @param Component - The component to protect
 * @param requireAdmin - Whether the route requires admin privileges
 * @returns Protected component or redirect
 */
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !user.isAdmin) {
      return <Navigate to="/unauthorized" state={{ from: location }} replace />;
    }

    return <Component {...(props as P)} />;
  };

  return WithAuth;
};
