import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import TarotCard from '../components/TarotCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiTrash2, FiUser, FiSearch } = FiIcons;

const Favorites = () => {
  const { user } = useAuth();
  const { favorites, removeFromFavorites } = useUser();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiUser} className="w-16 h-16 mx-auto mb-4 text-mystical-300" />
          <h2 className="text-white font-semibold mb-2">Login Required</h2>
          <p className="text-mystical-200 mb-6">
            Sign in to save and view your favorite tarot pairs
          </p>
          <div className="space-x-3">
            <Link
              to="/login"
              className="mystical-button px-6 py-3 rounded-lg inline-block"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border border-white/30 text-white rounded-lg inline-block hover:bg-white/10 transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-mystical font-bold text-white mb-2">
          Your Favorites
        </h1>
        <p className="text-mystical-200">
          {favorites.length} saved pair{favorites.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* Empty State */}
      {favorites.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiHeart} className="w-16 h-16 mx-auto mb-4 text-mystical-300" />
          <h3 className="text-white font-semibold mb-2">No Favorites Yet</h3>
          <p className="text-mystical-200 mb-6">
            Start exploring card pairs and save your favorites for easy access
          </p>
          <Link
            to="/explore"
            className="mystical-button px-6 py-3 rounded-lg inline-block"
          >
            <SafeIcon icon={FiSearch} className="w-4 h-4 inline mr-2" />
            Explore Pairs
          </Link>
        </motion.div>
      )}

      {/* Favorites List */}
      <div className="space-y-4">
        {favorites.map((favorite, index) => (
          <motion.div
            key={favorite.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="mystical-card rounded-xl p-4"
          >
            {/* Card Pair */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TarotCard card={favorite.card1} size="sm" />
                <div className="w-4 h-0.5 bg-mystical-300"></div>
                <TarotCard card={favorite.card2} size="sm" />
              </div>
              
              <button
                onClick={() => removeFromFavorites(favorite.id)}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </div>

            {/* Pair Info */}
            <div className="space-y-2">
              <h3 className="text-white font-semibold">
                {favorite.card1.name} + {favorite.card2.name}
              </h3>
              
              {favorite.theme && (
                <span className="inline-block px-2 py-1 bg-mystical-500/30 rounded text-mystical-200 text-xs">
                  {favorite.theme}
                </span>
              )}
              
              <p className="text-mystical-200 text-sm line-clamp-3">
                {favorite.meaning}
              </p>

              {favorite.keywords && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {favorite.keywords.slice(0, 3).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-mystical-600/30 rounded text-mystical-300 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      {favorites.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mystical-card rounded-xl p-4"
        >
          <h3 className="text-white font-semibold mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              to="/explore"
              className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
            >
              <SafeIcon icon={FiSearch} className="w-4 h-4 inline mr-2" />
              Explore More Pairs
            </Link>
            <Link
              to="/daily-draw"
              className="block w-full p-3 bg-mystical-600/20 rounded-lg text-mystical-200 hover:bg-mystical-600/30 transition-colors"
            >
              <SafeIcon icon={FiHeart} className="w-4 h-4 inline mr-2" />
              Get Daily Draw
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Favorites;