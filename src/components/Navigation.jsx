import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiSearch, FiStar, FiHeart, FiGift, FiZap } = FiIcons;

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: FiHome, label: 'Home' },
    { path: '/explore', icon: FiSearch, label: 'Explore' },
    { path: '/daily-draw', icon: FiZap, label: 'Daily' },
    { path: '/favorites', icon: FiHeart, label: 'Favorites' },
    { path: '/curated', icon: FiGift, label: 'Curated' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20">
      <div className="max-w-md mx-auto px-4">
        <div className="flex justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all ${
                  isActive
                    ? 'text-mystical-300 bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <SafeIcon icon={item.icon} className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;