import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import { useRole, PERMISSIONS } from '../context/RoleContext';
import RoleGuard from '../components/RoleGuard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiSettings, FiUser, FiHeart, FiDatabase, FiUpload, FiLogOut, 
  FiShield, FiUsers, FiBarChart3, FiCrown 
} = FiIcons;

const Admin = () => {
  const { user, logout } = useAuth();
  const { favorites, dailyDrawHistory } = useUser();
  const { userRole, canAccessAdminPanel, hasPermission } = useRole();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiShield} className="w-16 h-16 mx-auto mb-4 text-mystical-300" />
          <h2 className="text-white font-semibold mb-2">Access Denied</h2>
          <p className="text-mystical-200 mb-6">
            Please login to access the admin panel
          </p>
          <Link
            to="/login"
            className="mystical-button px-6 py-3 rounded-lg inline-block"
          >
            Login
          </Link>
        </motion.div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'content', label: 'Content', icon: FiDatabase },
    { id: 'settings', label: 'Settings', icon: FiSettings }
  ];

  // Add admin-specific tabs based on permissions
  if (canAccessAdminPanel()) {
    tabs.splice(1, 0, { id: 'dashboard', label: 'Dashboard', icon: FiBarChart3 });
    
    if (hasPermission(PERMISSIONS.MANAGE_USERS)) {
      tabs.splice(2, 0, { id: 'users', label: 'Users', icon: FiUsers });
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-2 mb-2">
          <SafeIcon icon={FiShield} className="w-6 h-6 text-mystical-300" />
          <h1 className="text-2xl font-mystical font-bold text-white">
            Admin Panel
          </h1>
        </div>
        <p className="text-mystical-200">
          Manage your account and content
        </p>
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            userRole === 'admin' ? 'bg-red-500/20 text-red-300' :
            userRole === 'moderator' ? 'bg-purple-500/20 text-purple-300' :
            userRole === 'premium' ? 'bg-yellow-500/20 text-yellow-300' :
            'bg-mystical-500/20 text-mystical-300'
          }`}>
            <SafeIcon 
              icon={userRole === 'admin' ? FiShield : userRole === 'premium' ? FiCrown : FiUser} 
              className="w-3 h-3 mr-1" 
            />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} User
          </span>
        </div>
      </motion.div>

      {/* Quick Admin Access */}
      <RoleGuard permission={PERMISSIONS.ACCESS_ANALYTICS}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mystical-card rounded-xl p-4"
        >
          <h3 className="text-white font-semibold mb-3 flex items-center">
            <SafeIcon icon={FiBarChart3} className="w-5 h-5 mr-2 text-mystical-300" />
            Admin Dashboard
          </h3>
          <Link
            to="/admin/dashboard"
            className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-center"
          >
            Access Full Admin Dashboard
          </Link>
        </motion.div>
      </RoleGuard>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mystical-card rounded-xl p-2"
      >
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-mystical-500 text-white'
                  : 'text-mystical-200 hover:text-white hover:bg-mystical-600/30'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* User Info */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-mystical-300" />
              User Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-mystical-200">Name:</span>
                <span className="text-white">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mystical-200">Email:</span>
                <span className="text-white">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mystical-200">Role:</span>
                <span className={
                  userRole === 'admin' ? 'text-red-400' :
                  userRole === 'moderator' ? 'text-purple-400' :
                  userRole === 'premium' ? 'text-yellow-400' :
                  'text-mystical-300'
                }>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mystical-200">Status:</span>
                <span className={user.isPremium ? 'text-yellow-400' : 'text-mystical-300'}>
                  {user.isPremium ? 'Premium' : 'Free'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-mystical-200">Member since:</span>
                <span className="text-white">
                  {new Date(user.joinDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Your Activity</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-mystical-300 mb-1">
                  {favorites.length}
                </div>
                <div className="text-mystical-200 text-sm">Favorites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-mystical-300 mb-1">
                  {dailyDrawHistory.length}
                </div>
                <div className="text-mystical-200 text-sm">Daily Draws</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/favorites"
                className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
              >
                <SafeIcon icon={FiHeart} className="w-4 h-4 inline mr-2" />
                View Favorites
              </Link>
              {!user.isPremium && (
                <Link
                  to="/upgrade"
                  className="block w-full p-3 bg-yellow-500/20 rounded-lg text-yellow-300 hover:bg-yellow-500/30 transition-colors"
                >
                  ⭐ Upgrade to Premium
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <RoleGuard permission={PERMISSIONS.ACCESS_ANALYTICS}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="mystical-card rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <SafeIcon icon={FiBarChart3} className="w-5 h-5 mr-2 text-mystical-300" />
                Admin Overview
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/dashboard"
                  className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
                >
                  📊 Full Dashboard
                </Link>
                <RoleGuard permission={PERMISSIONS.MANAGE_USERS}>
                  <Link
                    to="/admin/users"
                    className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
                  >
                    <SafeIcon icon={FiUsers} className="w-4 h-4 inline mr-2" />
                    Manage Users
                  </Link>
                </RoleGuard>
                <RoleGuard permission={PERMISSIONS.MANAGE_CONTENT}>
                  <Link
                    to="/admin/content"
                    className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
                  >
                    <SafeIcon icon={FiDatabase} className="w-4 h-4 inline mr-2" />
                    Manage Content
                  </Link>
                </RoleGuard>
              </div>
            </div>
          </motion.div>
        </RoleGuard>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <RoleGuard permission={PERMISSIONS.MANAGE_USERS}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="mystical-card rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2 text-mystical-300" />
                User Management
              </h3>
              <div className="space-y-3">
                <Link
                  to="/admin/users"
                  className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
                >
                  👥 Manage All Users
                </Link>
                <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                  📧 Send Notifications
                </button>
                <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                  📊 User Analytics
                </button>
              </div>
            </div>
          </motion.div>
        </RoleGuard>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Content Management */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <SafeIcon icon={FiDatabase} className="w-5 h-5 mr-2 text-mystical-300" />
              Content Management
            </h3>
            <div className="space-y-3">
              <RoleGuard permission={PERMISSIONS.MANAGE_CONTENT}>
                <Link
                  to="/admin/content"
                  className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left"
                >
                  <SafeIcon icon={FiUpload} className="w-4 h-4 inline mr-2" />
                  Upload Pair Meanings Database
                </Link>
                <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                  <SafeIcon icon={FiDatabase} className="w-4 h-4 inline mr-2" />
                  Manage Curated Pairs
                </button>
              </RoleGuard>
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                ⚙️ Configure AI Integration
              </button>
            </div>
          </div>

          {/* Upload Placeholder */}
          <RoleGuard permission={PERMISSIONS.MANAGE_CONTENT}>
            <Link to="/admin/content" className="block">
              <div className="mystical-card rounded-xl p-6 border-2 border-dashed border-mystical-400/30 hover:border-mystical-400/50 transition-colors">
                <div className="text-center">
                  <SafeIcon icon={FiUpload} className="w-12 h-12 mx-auto mb-3 text-mystical-400" />
                  <h4 className="text-white font-semibold mb-2">Upload Content</h4>
                  <p className="text-mystical-200 text-sm mb-4">
                    Upload and manage your tarot pair database
                  </p>
                  <span className="mystical-button px-6 py-2 rounded-lg inline-block">
                    Manage Content
                  </span>
                </div>
              </div>
            </Link>
          </RoleGuard>
        </motion.div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* App Settings */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <SafeIcon icon={FiSettings} className="w-5 h-5 mr-2 text-mystical-300" />
              Application Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-mystical-200">Daily Draw Notifications</span>
                <button className="w-12 h-6 bg-mystical-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 left-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mystical-200">Email Updates</span>
                <button className="w-12 h-6 bg-mystical-600 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-mystical-200">Dark Mode</span>
                <button className="w-12 h-6 bg-mystical-500 rounded-full relative">
                  <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="mystical-card rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                🔒 Change Password
              </button>
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                📧 Update Email
              </button>
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                📱 Export Data
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="mystical-card rounded-xl p-6">
            <button
              onClick={logout}
              className="w-full p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-colors"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4 inline mr-2" />
              Sign Out
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Admin;