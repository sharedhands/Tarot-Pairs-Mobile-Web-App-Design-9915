import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useRole, PERMISSIONS } from '../context/RoleContext';
import RoleGuard from '../components/RoleGuard';
import ProtectedRoute from '../components/ProtectedRoute';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiUsers, FiDatabase, FiBarChart3, FiSettings, FiShield, 
  FiTrendingUp, FiActivity, FiClock, FiStar 
} = FiIcons;

const AdminDashboard = () => {
  const { user } = useAuth();
  const { userRole, hasPermission } = useRole();
  const [activeMetric, setActiveMetric] = useState('users');

  const metrics = {
    users: {
      total: 1247,
      growth: '+12%',
      active: 892,
      premium: 156
    },
    content: {
      total: 3003,
      pairs: 3003,
      curated: 100,
      reports: 5
    },
    revenue: {
      monthly: '$12,450',
      growth: '+24%',
      conversions: '12.3%',
      churn: '2.1%'
    }
  };

  const adminActions = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: FiUsers,
      link: '/admin/users',
      permission: PERMISSIONS.MANAGE_USERS,
      color: 'bg-blue-500/20 text-blue-300'
    },
    {
      title: 'Content Management',
      description: 'Manage tarot pairs and interpretations',
      icon: FiDatabase,
      link: '/admin/content',
      permission: PERMISSIONS.MANAGE_CONTENT,
      color: 'bg-green-500/20 text-green-300'
    },
    {
      title: 'Analytics',
      description: 'View usage statistics and insights',
      icon: FiBarChart3,
      link: '/admin/analytics',
      permission: PERMISSIONS.ACCESS_ANALYTICS,
      color: 'bg-purple-500/20 text-purple-300'
    },
    {
      title: 'System Settings',
      description: 'Configure application settings',
      icon: FiSettings,
      link: '/admin/settings',
      permission: PERMISSIONS.MANAGE_CONTENT,
      color: 'bg-orange-500/20 text-orange-300'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'New user registration',
      user: 'jane.doe@example.com',
      time: '2 minutes ago',
      type: 'user'
    },
    {
      id: 2,
      action: 'Premium upgrade',
      user: 'john.smith@example.com',
      time: '15 minutes ago',
      type: 'premium'
    },
    {
      id: 3,
      action: 'Content report submitted',
      user: 'mike.wilson@example.com',
      time: '1 hour ago',
      type: 'report'
    },
    {
      id: 4,
      action: 'Daily draw completed',
      user: 'sarah.jones@example.com',
      time: '2 hours ago',
      type: 'activity'
    }
  ];

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.ACCESS_ANALYTICS}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-mystical font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-mystical-200">
              Welcome back, {user?.name}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiShield} className="w-5 h-5 text-mystical-300" />
            <span className="text-mystical-300 capitalize">{userRole}</span>
          </div>
        </motion.div>

        {/* Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="mystical-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Users</h3>
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{metrics.users.total}</div>
              <div className="text-sm text-mystical-200">
                <span className="text-green-400">{metrics.users.growth}</span> from last month
              </div>
              <div className="text-xs text-mystical-300">
                {metrics.users.active} active • {metrics.users.premium} premium
              </div>
            </div>
          </div>

          <div className="mystical-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Content</h3>
              <SafeIcon icon={FiDatabase} className="w-5 h-5 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-white">{metrics.content.total}</div>
              <div className="text-sm text-mystical-200">Total card pairs</div>
              <div className="text-xs text-mystical-300">
                {metrics.content.curated} curated • {metrics.content.reports} reports
              </div>
            </div>
          </div>

          <RoleGuard permission={PERMISSIONS.ACCESS_ANALYTICS}>
            <div className="mystical-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Revenue</h3>
                <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-purple-400" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">{metrics.revenue.monthly}</div>
                <div className="text-sm text-mystical-200">
                  <span className="text-green-400">{metrics.revenue.growth}</span> from last month
                </div>
                <div className="text-xs text-mystical-300">
                  {metrics.revenue.conversions} conversion • {metrics.revenue.churn} churn
                </div>
              </div>
            </div>
          </RoleGuard>
        </motion.div>

        {/* Admin Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mystical-card rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {adminActions.map((action, index) => (
              <RoleGuard key={action.title} permission={action.permission}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    to={action.link}
                    className="block p-4 bg-mystical-600/20 rounded-lg hover:bg-mystical-600/30 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                        <SafeIcon icon={action.icon} className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium mb-1">{action.title}</h4>
                        <p className="text-mystical-200 text-sm">{action.description}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </RoleGuard>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mystical-card rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Recent Activity</h3>
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-mystical-300" />
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                className="flex items-center justify-between p-3 bg-mystical-600/20 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-400' :
                    activity.type === 'premium' ? 'bg-yellow-400' :
                    activity.type === 'report' ? 'bg-red-400' :
                    'bg-green-400'
                  }`}></div>
                  <div>
                    <div className="text-white text-sm">{activity.action}</div>
                    <div className="text-mystical-300 text-xs">{activity.user}</div>
                  </div>
                </div>
                <div className="flex items-center text-mystical-400 text-xs">
                  <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                  {activity.time}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mystical-200 text-sm">API Status</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-white font-semibold">Operational</div>
          </div>
          
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mystical-200 text-sm">Database</span>
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <div className="text-white font-semibold">Healthy</div>
          </div>
          
          <div className="mystical-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-mystical-200 text-sm">Storage</span>
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            </div>
            <div className="text-white font-semibold">78% Used</div>
          </div>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;