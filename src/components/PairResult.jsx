import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../context/UserContext';
import TarotCard from './TarotCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiLock, FiZap } = FiIcons;

const PairResult = ({ pairData, onAskAI }) => {
  const { user } = useAuth();
  const { favorites, addToFavorites, removeFromFavorites } = useUser();
  
  const isFavorited = favorites.some(fav => fav.id === pairData.id);
  const canAccess = !pairData.isPremium || (user && user.isPremium);

  const handleFavorite = () => {
    if (!user) return;
    
    if (isFavorited) {
      const favoriteItem = favorites.find(fav => fav.id === pairData.id);
      removeFromFavorites(favoriteItem.id);
    } else {
      addToFavorites(pairData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mystical-card rounded-xl p-6 text-white"
    >
      {/* Card Pair Display */}
      <div className="flex justify-center space-x-4 mb-6">
        <TarotCard card={pairData.card1} size="lg" />
        <div className="flex items-center">
          <div className="w-8 h-0.5 bg-mystical-300"></div>
        </div>
        <TarotCard card={pairData.card2} size="lg" />
      </div>

      {/* Pair Title */}
      <div className="text-center mb-4">
        <h3 className="text-xl font-mystical font-semibold mb-2">
          {pairData.card1.name} + {pairData.card2.name}
        </h3>
        {pairData.theme && (
          <span className="inline-block px-3 py-1 bg-mystical-500/30 rounded-full text-sm">
            {pairData.theme}
          </span>
        )}
      </div>

      {/* Premium Lock or Content */}
      {!canAccess ? (
        <div className="text-center py-8">
          <SafeIcon icon={FiLock} className="w-12 h-12 mx-auto mb-4 text-mystical-300" />
          <p className="text-mystical-200 mb-4">
            This interpretation is available to Premium members
          </p>
          <button className="mystical-button px-6 py-2 rounded-lg">
            Upgrade to Premium
          </button>
        </div>
      ) : (
        <>
          {/* Meaning */}
          <div className="mb-6">
            <p className="text-mystical-100 leading-relaxed">
              {pairData.meaning}
            </p>
          </div>

          {/* Keywords */}
          {pairData.keywords && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-mystical-300 mb-2">Key Themes:</h4>
              <div className="flex flex-wrap gap-2">
                {pairData.keywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-mystical-600/30 rounded-lg text-sm text-mystical-200"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Special Interpretation for Curated Pairs */}
          {pairData.specialInterpretation && (
            <div className="mb-6 p-4 bg-mystical-600/20 rounded-lg border border-mystical-400/30">
              <h4 className="text-sm font-semibold text-mystical-300 mb-2">Special Insight:</h4>
              <p className="text-mystical-100 text-sm italic">
                {pairData.specialInterpretation}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {user && (
              <button
                onClick={handleFavorite}
                className={`flex-1 py-3 px-4 rounded-lg border transition-all ${
                  isFavorited
                    ? 'bg-red-500/20 border-red-400 text-red-300'
                    : 'bg-white/10 border-white/30 text-white hover:bg-white/20'
                }`}
              >
                <SafeIcon icon={FiHeart} className="w-4 h-4 inline mr-2" />
                {isFavorited ? 'Favorited' : 'Add to Favorites'}
              </button>
            )}

            <button
              onClick={onAskAI}
              className="flex-1 mystical-button py-3 px-4 rounded-lg"
              disabled={!user || !user.isPremium}
            >
              <SafeIcon icon={FiZap} className="w-4 h-4 inline mr-2" />
              Ask AI
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default PairResult;