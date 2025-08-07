import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CardSelector from '../components/CardSelector';
import PairResult from '../components/PairResult';
import { generatePairMeaning } from '../data/pairMeanings';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShuffle, FiZap } = FiIcons;

const ExplorePairs = () => {
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
      const meaning = generatePairMeaning(selectedCards[0], selectedCards[1]);
      setPairResult(meaning);
    }
  };

  const handleRandomPair = () => {
    // Implementation for random pair selection
    const randomCards = [];
    const availableCards = Array.from({ length: 78 }, (_, i) => i);
    
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      randomCards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    
    // This would need to be implemented with actual card data
    console.log('Random pair:', randomCards);
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
          Explore Card Pairs
        </h1>
        <p className="text-mystical-200">
          Select two cards to discover their combined meaning
        </p>
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
              AI interpretation feature coming soon! This will provide personalized insights 
              based on your selected card combination.
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