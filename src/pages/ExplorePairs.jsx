import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CardSelector from '../components/CardSelector';
import PairResult from '../components/PairResult';
import { usePairData } from '../context/PairDataContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShuffle, FiZap, FiAlertCircle } = FiIcons;

const ExplorePairs = () => {
  const { pairData, generatePairMeaning, getRandomPair, isLoading, dataSource } = usePairData();
  const [selectedCards, setSelectedCards] = useState([]);
  const [pairResult, setPairResult] = useState(null);
  const [showAIPlaceholder, setShowAIPlaceholder] = useState(false);

  const handleCardSelect = (card) => {
    setSelectedCards(prev => {
      const isSelected = prev.some(selected => selected.id === card.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== card.id);
      } else if (prev.length < 2) {
        return [...prev, card];
      }
      return prev;
    });
    setPairResult(null);
  };

  const handleGenerateMeaning = () => {
    if (selectedCards.length === 2) {
      // First check if this combination exists in our data
      const existingPair = pairData.find(
        pair => 
          (pair.card1.id === selectedCards[0].id && pair.card2.id === selectedCards[1].id) || 
          (pair.card1.id === selectedCards[1].id && pair.card2.id === selectedCards[0].id)
      );

      if (existingPair) {
        setPairResult(existingPair);
      } else {
        const generatedMeaning = generatePairMeaning(selectedCards[0], selectedCards[1]);
        setPairResult(generatedMeaning);
      }
    }
  };

  const handleRandomPair = () => {
    const randomPair = getRandomPair();
    if (randomPair) {
      setSelectedCards([randomPair.card1, randomPair.card2]);
      setPairResult(randomPair);
    }
  };

  const handleAskAI = () => {
    setShowAIPlaceholder(true);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-6 flex justify-center items-center">
        <div className="text-white">Loading tarot pairs data...</div>
      </div>
    );
  }

  if (pairData.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-8 text-center"
        >
          <SafeIcon icon={FiAlertCircle} className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-white font-semibold mb-2">No Tarot Pair Data Found</h2>
          <p className="text-mystical-200 mb-6">
            Please upload a CSV file in the Admin panel to populate the tarot pairs database.
          </p>
          <a href="#/admin/content" className="mystical-button px-6 py-3 rounded-lg inline-block">
            Go to Content Management
          </a>
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
          Explore Card Pairs
        </h1>
        <p className="text-mystical-200">
          Select two cards to discover their combined meaning
        </p>
        {dataSource === 'sample' && (
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">
              Using sample data. Upload your own in Admin panel.
            </span>
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-3"
      >
        <button
          onClick={handleGenerateMeaning}
          disabled={selectedCards.length !== 2}
          className="flex-1 mystical-button py-3 px-4 rounded-lg disabled:opacity-50"
        >
          <SafeIcon icon={FiZap} className="w-4 h-4 inline mr-2" />
          Get Meaning
        </button>
        <button
          onClick={handleRandomPair}
          className="px-4 py-3 bg-white/10 border border-white/30 text-white rounded-lg hover:bg-white/20 transition-colors"
        >
          <SafeIcon icon={FiShuffle} className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Card Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CardSelector
          selectedCards={selectedCards}
          onCardSelect={handleCardSelect}
          maxCards={2}
        />
      </motion.div>

      {/* Pair Result */}
      {pairResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PairResult pairData={pairResult} onAskAI={handleAskAI} />
          
          {pairResult.generatedOnTheFly && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 p-3 bg-blue-500/20 rounded-lg text-blue-300 text-sm text-center"
            >
              This interpretation was generated on-the-fly. Upload more pairs in the Admin panel for curated meanings.
            </motion.div>
          )}
        </motion.div>
      )}

      {/* AI Placeholder */}
      {showAIPlaceholder && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mystical-card rounded-xl p-6"
        >
          <h3 className="text-white font-semibold mb-4 flex items-center">
            <SafeIcon icon={FiZap} className="w-5 h-5 mr-2 text-mystical-300" />
            AI Interpretation
          </h3>
          <div className="bg-mystical-600/20 rounded-lg p-4 border border-mystical-400/30">
            <p className="text-mystical-200 text-center italic">
              AI interpretation feature coming soon! This will provide personalized insights based on your selected card combination.
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

export default ExplorePairs;