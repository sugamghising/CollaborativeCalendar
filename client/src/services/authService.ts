import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if:
    // 1. It's not an auth endpoint
    // 2. We have a response with status 401
    // 3. We're not already on a public route
    const isAuthEndpoint = error.config?.url?.includes('/auth/');
    const isPublicRoute = window.location.pathname.match(/^\/((login|signup|forgot-password|verify-reset-code|reset-password).*)?$/);
    
    if (!isAuthEndpoint && error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request a verification code for signup
export const signupEmailcode = async (email: string) => {
    const response = await api.post(
        '/auth/signupEmailcode', 
        { email },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );
    return response.data;
};

// Verify the email verification code
export const emailcodeVerify = async (email: string, code: string) => {
    const response = await api.post(
        '/auth/emailcodeVerify',
        { email, code },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );
    return response.data;
};

// Complete the signup process
export const completeSignup = async (name: string, password: string, token: string) => {
    const response = await api.post(
        '/auth/completeSignup',
        { name, password },
        {
            withCredentials: true,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    );
     
    return response.data;
};

// Login with email and password
export const login = async (email: string, password: string) => {
    try {
        const response = await api.post(
            '/auth/login',
            { email, password },
            {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        // Handle the response based on server's actual response structure
        if (response.data && (response.data.SessionToken || response.data.sessionToken)) {
            // Store the token in localStorage
            const token = response.data.SessionToken || response.data.sessionToken;
            localStorage.setItem('token', token);
            
            // Get user data from the response if available
            let userData = null;
            if (response.data.user) {
                userData = response.data.user;
            } else {
                // If no user data in response, try to decode from token
                try {
                    const base64Url = token.split('.')[1];
                    if (base64Url) {
                        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                        const decodedToken = JSON.parse(window.atob(base64));
                        userData = {
                            id: decodedToken.userId || '',
                            email: decodedToken.email || '',
                            name: decodedToken.name || '',
                            isAdmin: decodedToken.isAdmin || false,
                            isVerified: decodedToken.isVerified || false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                    }
                } catch (e) {
                    console.error('Error decoding token:', e);
                }
            }
            
            return { 
                token,
                user: userData,
                message: response.data.message || 'Login successful'
            };
        } else {
            throw new Error('Invalid response from server: No token found');
        }
    } catch (error: any) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const errorMessage = error.response.data?.message || 'Login failed';
            console.error('Login error:', {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data,
                headers: error.response.headers
            });
            throw new Error(errorMessage);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            throw new Error('No response from server. Please check your connection.');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request setup error:', error.message);
            throw new Error(error.message || 'Error setting up login request');
        }
    }
};

// Request a password reset code
export const forgotPassword = async (email: string) => {
    const response = await api.post(
        '/auth/forgotPasswordcode',
        { email },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );
    return response.data;
};

// Verify the password reset code
export const forgotPasswordcodeVerify = async (email: string, code: string) => {
    const response = await api.post(
        '/auth/forgotPasswordcodeVerify',
        { email, code },
        {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
        }
    );
    return response.data;
};

// Reset the password with a new one
export const forgotPasswordfill = async (email: string, password: string, token: string) => {
    const response = await api.post(
        '/auth/forgotPasswordfill',
        { email, password },
        {
            withCredentials: true,
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
        }
    );
    return response.data;
};

// Helper function to set the auth token in axios headers
export const setAuthToken = (token: string | null) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};
