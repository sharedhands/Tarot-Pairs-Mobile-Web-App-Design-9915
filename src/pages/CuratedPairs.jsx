import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { curatedPairs } from '../data/pairMeanings';
import PairResult from '../components/PairResult';
import TarotCard from '../components/TarotCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiGift, FiStar, FiEye } = FiIcons;

const CuratedPairs = () => {
  const [selectedPair, setSelectedPair] = useState(null);
  const [showAIPlaceholder, setShowAIPlaceholder] = useState(false);

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
  };

  const handleAskAI = () => {
    setShowAIPlaceholder(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-mystical font-bold text-white mb-2">
          Curated Pairs
        </h1>
        <p className="text-mystical-200">
          Specially interpreted combinations with deeper insights
        </p>
      </motion.div>

      {/* Featured Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mystical-card rounded-xl p-4 text-center"
      >
        <SafeIcon icon={FiStar} className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
        <h3 className="text-white font-semibold mb-1">Expertly Crafted</h3>
        <p className="text-mystical-200 text-sm">
          100 hand-selected pairs with themed interpretations
        </p>
      </motion.div>

      {/* Back Button */}
      {selectedPair && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSelectedPair(null)}
          className="flex items-center text-mystical-300 hover:text-white transition-colors"
        >
          <SafeIcon icon={FiEye} className="w-4 h-4 mr-2" />
          Back to Curated Pairs
        </motion.button>
      )}

      {/* Selected Pair Detail */}
      {selectedPair ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PairResult pairData={selectedPair} onAskAI={handleAskAI} />
        </motion.div>
      ) : (
        /* Curated Pairs List */
        <div className="space-y-4">
          {curatedPairs.map((pair, index) => (
            <motion.div
              key={pair.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="mystical-card rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => handlePairSelect(pair)}
            >
              {/* Pair Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <SafeIcon icon={FiGift} className="w-5 h-5 text-mystical-300" />
                  <span className="text-mystical-300 text-sm font-semibold">
                    {pair.theme}
                  </span>
                </div>
                <SafeIcon icon={FiEye} className="w-4 h-4 text-mystical-400" />
              </div>

              {/* Card Pair Display */}
              <div className="flex items-center justify-center space-x-3 mb-4">
                <TarotCard card={pair.card1} size="sm" />
                <div className="w-6 h-0.5 bg-mystical-300"></div>
                <TarotCard card={pair.card2} size="sm" />
              </div>

              {/* Pair Title */}
              <h3 className="text-white font-semibold text-center mb-2">
                {pair.title}
              </h3>

              {/* Preview Text */}
              <p className="text-mystical-200 text-sm text-center line-clamp-2">
                {pair.meaning.substring(0, 100)}...
              </p>

              {/* Keywords */}
              {pair.keywords && (
                <div className="flex flex-wrap justify-center gap-1 mt-3">
                  {pair.keywords.slice(0, 3).map((keyword, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-mystical-600/30 rounded text-mystical-300 text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {/* Coming Soon Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mystical-card rounded-xl p-6 text-center border-2 border-dashed border-mystical-400/30"
          >
            <SafeIcon icon={FiGift} className="w-12 h-12 mx-auto mb-3 text-mystical-400" />
            <h3 className="text-white font-semibold mb-2">More Coming Soon</h3>
            <p className="text-mystical-200 text-sm">
              Additional curated pairs are being crafted with special themes and interpretations
            </p>
            <div className="mt-4 text-mystical-300 text-xs">
              98 more pairs in development
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Placeholder */}
      {showAIPlaceholder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <SafeIcon icon={FiStar} className="w-5 h-5 mr-2 text-mystical-300" />
            AI Enhanced Interpretation
          </h3>
          <div className="bg-mystical-600/20 rounded-lg p-4 border border-mystical-400/30">
            <p className="text-mystical-200 text-center italic">
              Enhanced AI interpretation for curated pairs will provide even deeper insights 
              and personalized guidance based on your specific situation and the special 
              themes of these expertly crafted combinations.
            </p>
          </div>
          <button
            onClick={() => setShowAIPlaceholder(false)}
            className="mt-4 w-full py-2 text-mystical-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default CuratedPairs;