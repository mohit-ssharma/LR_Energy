import React, { createContext, useContext, useState, useEffect } from 'react';

// Define roles
export const ROLES = {
  HEAD_OFFICE: 'HEAD_OFFICE',
  MNRE: 'MNRE'
};

// User credentials (in production, this would be in backend)
const USERS = {
  'ho@lrenergy.in': {
    password: 'qwerty@1234',
    role: ROLES.HEAD_OFFICE,
    name: 'Head Office Admin',
    email: 'ho@lrenergy.in'
  },
  'mnre@lrenergy.in': {
    password: 'qwerty@1234',
    role: ROLES.MNRE,
    name: 'MNRE User',
    email: 'mnre@lrenergy.in'
  }
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

  const login = (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const userRecord = USERS[normalizedEmail];

    if (!userRecord) {
      return { success: false, error: 'Invalid email address' };
    }

    if (userRecord.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    const userData = {
      email: userRecord.email,
      name: userRecord.name,
      role: userRecord.role
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('scada_user', JSON.stringify(userData));

    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('scada_user');
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
