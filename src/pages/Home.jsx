import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiZap, FiHeart, FiGift, FiStar, FiTrendingUp } = FiIcons;

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: FiSearch,
      title: 'Explore Pairs',
      description: 'Discover meanings of any two-card combination',
      link: '/explore',
      color: 'bg-blue-500/20 text-blue-300',
    },
    {
      icon: FiZap,
      title: 'Daily Draw',
      description: 'Get your daily tarot guidance',
      link: '/daily-draw',
      color: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      icon: FiHeart,
      title: 'Favorites',
      description: 'Save your meaningful pairs',
      link: '/favorites',
      color: 'bg-red-500/20 text-red-300',
      requiresAuth: true,
    },
    {
      icon: FiGift,
      title: 'Curated Pairs',
      description: 'Specially interpreted combinations',
      link: '/curated',
      color: 'bg-purple-500/20 text-purple-300',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="moon-phase mx-auto mb-4" style={{ width: '48px', height: '48px' }}></div>
        <h1 className="text-3xl font-mystical font-bold text-white">
          Welcome to Tarot Pairs
        </h1>
        <p className="text-mystical-200 leading-relaxed">
          Unlock the deeper meanings hidden within tarot card combinations. 
          Explore thousands of interpretations and discover new insights.
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mystical-card rounded-xl p-4"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-mystical-300">3,003</div>
            <div className="text-sm text-mystical-200">Card Pairs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-mystical-300">78</div>
            <div className="text-sm text-mystical-200">Tarot Cards</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-mystical-300">100</div>
            <div className="text-sm text-mystical-200">Curated Pairs</div>
          </div>
        </div>
      </motion.div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <Link
              to={feature.requiresAuth && !user ? '/login' : feature.link}
              className="block mystical-card rounded-xl p-4 hover:scale-105 transition-transform"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                <SafeIcon icon={feature.icon} className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
              <p className="text-mystical-200 text-sm">{feature.description}</p>
              {feature.requiresAuth && !user && (
                <div className="mt-2 text-xs text-mystical-300">Login required</div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Premium CTA */}
      {user && !user.isPremium && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mystical-card rounded-xl p-6 text-center"
        >
          <SafeIcon icon={FiStar} className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
          <h3 className="text-white font-semibold mb-2">Unlock Premium Features</h3>
          <p className="text-mystical-200 text-sm mb-4">
            Access all 3,003 interpretations, AI insights, and exclusive content
          </p>
          <Link
            to="/upgrade"
            className="mystical-button px-6 py-3 rounded-lg inline-block"
          >
            Upgrade Now
          </Link>
        </motion.div>
      )}

      {/* Getting Started */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mystical-card rounded-xl p-6 text-center"
        >
          <h3 className="text-white font-semibold mb-2">New to Tarot Pairs?</h3>
          <p className="text-mystical-200 text-sm mb-4">
            Create an account to save favorites and unlock premium features
          </p>
          <div className="space-x-3">
            <Link
              to="/register"
              className="mystical-button px-4 py-2 rounded-lg inline-block"
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 border border-white/30 text-white rounded-lg inline-block hover:bg-white/10 transition-colors"
            >
              Login
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;