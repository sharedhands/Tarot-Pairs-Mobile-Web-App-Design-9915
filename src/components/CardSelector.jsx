import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { tarotCards } from '../data/tarotCards';
import TarotCard from './TarotCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFilter, FiX } = FiIcons;

const CardSelector = ({ selectedCards, onCardSelect, maxCards = 2 }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCards = tarotCards.filter(card => {
    const matchesFilter = filter === 'all' || card.suit === filter;
    const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters = [
    { value: 'all', label: 'All Cards' },
    { value: 'major', label: 'Major Arcana' },
    { value: 'cups', label: 'Cups' },
    { value: 'wands', label: 'Wands' },
    { value: 'swords', label: 'Swords' },
    { value: 'pentacles', label: 'Pentacles' },
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-mystical-300"
        />

        <div className="flex space-x-2 overflow-x-auto pb-2">
          {filters.map(filterOption => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                filter === filterOption.value
                  ? 'bg-mystical-500 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Cards Display */}
      {selectedCards.length > 0 && (
        <div className="mystical-card rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Selected Cards:</h3>
          <div className="flex space-x-4">
            {selectedCards.map((card, index) => (
              <div key={card.id} className="relative">
                <TarotCard card={card} size="md" />
                <button
                  onClick={() => onCardSelect(card)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs"
                >
                  <SafeIcon icon={FiX} className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
        {filteredCards.map(card => (
          <TarotCard
            key={card.id}
            card={card}
            isSelected={selectedCards.some(selected => selected.id === card.id)}
            onClick={() => {
              if (selectedCards.length < maxCards || selectedCards.some(selected => selected.id === card.id)) {
                onCardSelect(card);
              }
            }}
            size="sm"
          />
        ))}
      </div>

      {selectedCards.length >= maxCards && (
        <p className="text-center text-mystical-200 text-sm">
          Maximum cards selected. Remove a card to select a different one.
        </p>
      )}
    </div>
  );
};

export default CardSelector;