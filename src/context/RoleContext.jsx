import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Define user roles and permissions
export const ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  PREMIUM: 'premium',
  USER: 'user'
};

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_CONTENT: 'manage_content',
  MODERATE_CONTENT: 'moderate_content',
  ACCESS_ANALYTICS: 'access_analytics',
  ACCESS_PREMIUM: 'access_premium',
  BULK_OPERATIONS: 'bulk_operations'
};

// Role-based permissions mapping
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_CONTENT,
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.ACCESS_ANALYTICS,
    PERMISSIONS.ACCESS_PREMIUM,
    PERMISSIONS.BULK_OPERATIONS
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.MODERATE_CONTENT,
    PERMISSIONS.ACCESS_ANALYTICS,
    PERMISSIONS.ACCESS_PREMIUM
  ],
  [ROLES.PREMIUM]: [
    PERMISSIONS.ACCESS_PREMIUM
  ],
  [ROLES.USER]: []
};

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState(ROLES.USER);
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (user) {
      // Determine user role based on user data
      let role = ROLES.USER;
      
      if (user.role === 'admin' || user.email === 'admin@tarotpairs.com') {
        role = ROLES.ADMIN;
      } else if (user.role === 'moderator') {
        role = ROLES.MODERATOR;
      } else if (user.isPremium) {
        role = ROLES.PREMIUM;
      }
      
      setUserRole(role);
      setPermissions(ROLE_PERMISSIONS[role] || []);
    } else {
      setUserRole(ROLES.USER);
      setPermissions([]);
    }
  }, [user]);

  const hasPermission = (permission) => {
    return permissions.includes(permission);
  };

  const hasRole = (role) => {
    return userRole === role;
  };

  const hasAnyRole = (roles) => {
    return roles.includes(userRole);
  };

  const canAccessAdminPanel = () => {
    return hasAnyRole([ROLES.ADMIN, ROLES.MODERATOR]);
  };

  const value = {
    userRole,
    permissions,
    hasPermission,
    hasRole,
    hasAnyRole,
    canAccessAdminPanel,
    ROLES,
    PERMISSIONS
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};