import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiUser, FiHeart, FiDatabase, FiUpload, FiLogOut, FiShield } = FiIcons;

const Admin = () => {
  const { user, logout } = useAuth();
  const { favorites, dailyDrawHistory } = useUser();
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
    { id: 'settings', label: 'Settings', icon: FiSettings },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-mystical font-bold text-white mb-2">
          Admin Panel
        </h1>
        <p className="text-mystical-200">
          Manage your account and content
        </p>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mystical-card rounded-xl p-2"
      >
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg transition-all ${
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
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                <SafeIcon icon={FiUpload} className="w-4 h-4 inline mr-2" />
                Upload Pair Meanings Database
              </button>
              
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                <SafeIcon icon={FiDatabase} className="w-4 h-4 inline mr-2" />
                Manage Curated Pairs
              </button>
              
              <button className="w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors text-left">
                ⚙️ Configure AI Integration
              </button>
            </div>
          </div>

          {/* Upload Placeholder */}
          <div className="mystical-card rounded-xl p-6 border-2 border-dashed border-mystical-400/30">
            <div className="text-center">
              <SafeIcon icon={FiUpload} className="w-12 h-12 mx-auto mb-3 text-mystical-400" />
              <h4 className="text-white font-semibold mb-2">Upload Content</h4>
              <p className="text-mystical-200 text-sm mb-4">
                Drag and drop your CSV files here or click to browse
              </p>
              <button className="mystical-button px-6 py-2 rounded-lg">
                Select Files
              </button>
            </div>
          </div>
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