import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiStar, FiSettings } = FiIcons;

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getPageTitle = () => {
    const titles = {
      '/': 'Tarot Pairs',
      '/explore': 'Explore Pairs',
      '/daily-draw': 'Daily Draw',
      '/favorites': 'Favorites',
      '/curated': 'Curated Pairs',
      '/upgrade': 'Upgrade',
      '/admin': 'Admin Panel',
    };
    return titles[location.pathname] || 'Tarot Pairs';
  };

  return (
    <header className="bg-white/10 backdrop-blur-md border-b border-white/20 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="moon-phase"></div>
          <h1 className="text-white font-mystical text-lg font-semibold">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          {user && user.isPremium && (
            <div className="premium-badge">
              <SafeIcon icon={FiStar} className="w-3 h-3 inline mr-1" />
              Premium
            </div>
          )}
          
          {user ? (
            <Link to="/admin" className="text-white/80 hover:text-white transition-colors">
              <SafeIcon icon={FiSettings} className="w-5 h-5" />
            </Link>
          ) : (
            <Link to="/login" className="text-white/80 hover:text-white transition-colors">
              <SafeIcon icon={FiUser} className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;