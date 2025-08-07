import React from 'react';
import { motion } from 'framer-motion';
import { getSuitColor, getSuitIcon } from '../data/tarotCards';

const TarotCard = ({ card, isSelected, onClick, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-16 h-24',
    md: 'w-20 h-30',
    lg: 'w-24 h-36',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`${sizeClasses[size]} cursor-pointer`}
      onClick={() => onClick && onClick(card)}
    >
      <div
        className={`tarot-card-image ${
          isSelected ? 'tarot-card-selected' : ''
        } h-full flex flex-col items-center justify-center p-2 transition-all duration-300`}
      >
        <div className={`${getSuitColor(card.suit)} text-2xl mb-2`}>
          {getSuitIcon(card.suit)}
        </div>
        <div className={`text-center ${textSizes[size]} font-medium text-gray-700`}>
          {card.name}
        </div>
        <div className={`${getSuitColor(card.suit)} ${textSizes[size]} font-semibold mt-1 capitalize`}>
          {card.suit}
        </div>
      </div>
    </motion.div>
  );
};

export default TarotCard;