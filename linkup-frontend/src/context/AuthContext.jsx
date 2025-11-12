import { createContext, useContext, useState, useEffect } from 'react';
import { userAPI, authAPI } from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await userAPI.getProfile();
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      // Don't redirect here - just set user to null
      // The ProtectedRoute component will handle redirects
      console.log('Not authenticated');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await authAPI.login(credentials);
    if (response.data.success) {
      setUser(response.data.data.user);
      return response.data;
    }
    throw new Error(response.data.message);
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      // Redirect to login after logout
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};