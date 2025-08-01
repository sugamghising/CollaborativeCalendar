import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, Navigate, useLocation, Location } from 'react-router-dom';
import * as authService from '../services/authService';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isVerified: boolean;
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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<string>; // Returns token for completeSignup
  completeSignup: (name: string, password: string, token: string) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Here you would typically verify the token with your backend
        // For now, we'll just check if there's a token in localStorage
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token with backend and get user data
          // const userData = await authService.verifyToken(token);
          // setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { token, message } = await authService.login(email, password);
      
      if (token) {
        // Store the token in localStorage
        localStorage.setItem('token', token);
        
        // Set the default Authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user data using the token
        try {
          const userResponse = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          setUser(userResponse.data);
          navigate('/dashboard');
        } catch (userError) {
          console.error('Failed to fetch user data:', userError);
          // Even if we can't get user data, we can still proceed with the token
          setUser({
            id: 'temp',
            email,
            name: 'User',
            isAdmin: false,
            isVerified: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          navigate('/dashboard');
        }
      } else {
        throw new Error(message || 'Login failed: No token received');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
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
      setError(err.response?.data?.message || 'Signup failed');
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
      setError(err.response?.data?.message || 'Verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async (name: string, password: string, token: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.completeSignup(name, password, token);
      setUser(userData);
      localStorage.setItem('token', userData.token);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete signup');
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
          throw new Error('Current password is required to change password');
        }
        updateData.currentPassword = data.currentPassword;
        updateData.newPassword = data.newPassword;
      }
      
      // In a real app, you would make an API call to update the profile
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const requestPasswordReset = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request password reset');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      // First verify the code
      const { token } = await authService.forgotPasswordcodeVerify(email, code);
      // Then reset the password
      await authService.forgotPasswordfill(email, newPassword, token);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Password reset failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
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
    throw new Error('useAuth must be used within an AuthProvider');
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
  redirectTo = '/login',
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
