import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiLock } = FiIcons;

const ProtectedRoute = ({ 
  children, 
  requireAuth = false,
  requiredRole = null,
  requiredPermission = null,
  fallbackPath = '/login'
}) => {
  const { user } = useAuth();
  const { hasRole, hasPermission, userRole } = useRole();

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiShield} className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-white font-semibold mb-2">Access Denied</h2>
          <p className="text-mystical-200 mb-4">
            You need {requiredRole} role to access this page
          </p>
          <p className="text-mystical-300 text-sm">
            Current role: {userRole}
          </p>
        </motion.div>
      </div>
    );
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiLock} className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-white font-semibold mb-2">Insufficient Permissions</h2>
          <p className="text-mystical-200 mb-4">
            You don't have permission to access this feature
          </p>
          <p className="text-mystical-300 text-sm">
            Required: {requiredPermission}
          </p>
        </motion.div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;