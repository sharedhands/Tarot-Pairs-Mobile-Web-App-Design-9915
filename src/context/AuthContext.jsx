import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('tarotUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - replace with actual authentication
    const mockUser = {
      id: 1,
      email,
      name: email.split('@')[0],
      isPremium: false,
      joinDate: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem('tarotUser', JSON.stringify(mockUser));
    return mockUser;
  };

  const register = async (email, password, name) => {
    // Mock registration - replace with actual authentication
    const mockUser = {
      id: Date.now(),
      email,
      name,
      isPremium: false,
      joinDate: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem('tarotUser', JSON.stringify(mockUser));
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tarotUser');
  };

  const upgradeToPremium = () => {
    if (user) {
      const updatedUser = { ...user, isPremium: true };
      setUser(updatedUser);
      localStorage.setItem('tarotUser', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    upgradeToPremium,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};