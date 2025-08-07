import React from 'react';
import { useRole } from '../context/RoleContext';

const RoleGuard = ({ 
  children, 
  role = null, 
  permission = null, 
  fallback = null,
  requireAll = false 
}) => {
  const { hasRole, hasPermission } = useRole();

  let hasAccess = true;

  if (role && permission) {
    hasAccess = requireAll 
      ? hasRole(role) && hasPermission(permission)
      : hasRole(role) || hasPermission(permission);
  } else if (role) {
    hasAccess = hasRole(role);
  } else if (permission) {
    hasAccess = hasPermission(permission);
  }

  if (!hasAccess) {
    return fallback;
  }

  return children;
};

export default RoleGuard;