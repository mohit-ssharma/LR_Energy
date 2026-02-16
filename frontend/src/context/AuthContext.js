import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from '../services/api';

// Define roles
export const ROLES = {
  HEAD_OFFICE: 'HEAD_OFFICE',
  MNRE: 'MNRE'
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('scada_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem('scada_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    try {
      // Call the PHP API for authentication
      const result = await loginUser(normalizedEmail, password);
      
      if (result.success && result.user) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('scada_user', JSON.stringify(userData));
        localStorage.setItem('scada_token', result.token);

        return { success: true, user: userData };
      } else {
        return { success: false, error: result.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('scada_user');
    localStorage.removeItem('scada_token');
  };

  const isHeadOffice = () => user?.role === ROLES.HEAD_OFFICE;
  const isMNRE = () => user?.role === ROLES.MNRE;

  const hasAccess = (requiredRole) => {
    if (!user) return false;
    if (user.role === ROLES.HEAD_OFFICE) return true; // Head Office has access to everything
    return user.role === requiredRole;
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    isHeadOffice,
    isMNRE,
    hasAccess,
    ROLES
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
