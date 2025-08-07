import React, { createContext, useContext, useState, useEffect } from 'react';
import { samplePairs } from '../data/pairMeanings';
import { tarotCards } from '../data/tarotCards';

const PairDataContext = createContext();

export const usePairData = () => {
  const context = useContext(PairDataContext);
  if (!context) {
    throw new Error('usePairData must be used within a PairDataProvider');
  }
  return context;
};

export const PairDataProvider = ({ children }) => {
  const [pairData, setPairData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('sample'); // 'sample', 'uploaded', or 'custom'

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const storedPairs = localStorage.getItem('tarotPairs');
        if (storedPairs) {
          const parsedPairs = JSON.parse(storedPairs);
          if (Array.isArray(parsedPairs) && parsedPairs.length > 0) {
            console.log(`Loaded ${parsedPairs.length} pairs from localStorage`);
            setPairData(parsedPairs);
            setDataSource('uploaded');
          } else {
            console.log('No valid pairs in localStorage, using sample data');
            setPairData(samplePairs);
            setDataSource('sample');
          }
        } else {
          console.log('No stored pairs, using sample data');
          setPairData(samplePairs);
          setDataSource('sample');
        }
      } catch (error) {
        console.error('Error loading pair data:', error);
        setPairData(samplePairs);
        setDataSource('sample');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Save uploaded data to localStorage
  const updatePairData = (newPairs) => {
    setPairData(newPairs);
    setDataSource('uploaded');
    localStorage.setItem('tarotPairs', JSON.stringify(newPairs));
  };

  // Generate a pair meaning for any two cards
  const generatePairMeaning = (card1, card2) => {
    // First check if this pair exists in our data
    const existingPair = pairData.find(
      pair => 
        (pair.card1.id === card1.id && pair.card2.id === card2.id) || 
        (pair.card1.id === card2.id && pair.card2.id === card1.id)
    );

    if (existingPair) {
      return existingPair;
    }

    // If not found in our data, generate a new meaning
    const meanings = [
      "This powerful combination suggests a time of transformation and new beginnings. The energy between these cards creates a dynamic that encourages you to embrace change while staying grounded in your values.",
      "Together, these cards speak to the balance between intuition and action. Trust your inner wisdom while taking practical steps toward your goals.",
      "This pairing indicates a period of emotional growth and spiritual awakening. Pay attention to the messages your heart is sending you.",
      "The combination of these energies suggests that success comes through patience and perseverance. Your efforts are building toward something meaningful.",
      "These cards together represent the harmony between your conscious and unconscious mind. Meditation and reflection will bring clarity.",
      "This powerful duo speaks to the importance of relationships and partnerships in your current journey. Collaboration will lead to success.",
      "The energy of this combination encourages you to break free from limiting beliefs and embrace your true potential.",
      "Together, these cards suggest that material and spiritual abundance are within reach. Align your actions with your highest values.",
    ];

    return {
      id: `${card1.id}-${card2.id}`,
      card1,
      card2,
      meaning: meanings[Math.floor(Math.random() * meanings.length)],
      keywords: ["transformation", "balance", "growth", "harmony", "potential"],
      theme: "Personal Development",
      isPremium: Math.random() > 0.7, // 30% chance of being premium
      generatedOnTheFly: true, // Flag to indicate this was generated, not from the database
    };
  };

  // Get a random pair from the data
  const getRandomPair = () => {
    if (pairData.length === 0) return null;
    return pairData[Math.floor(Math.random() * pairData.length)];
  };

  // Get a random daily draw (two random cards)
  const getRandomDailyDraw = () => {
    const availableCards = [...tarotCards];
    const drawnCards = [];
    
    // Draw two random cards
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * availableCards.length);
      drawnCards.push(availableCards.splice(randomIndex, 1)[0]);
    }
    
    // Check if this combination exists in our data
    const existingPair = pairData.find(
      pair => 
        (pair.card1.id === drawnCards[0].id && pair.card2.id === drawnCards[1].id) || 
        (pair.card1.id === drawnCards[1].id && pair.card2.id === drawnCards[0].id)
    );

    if (existingPair) {
      return existingPair;
    }
    
    // If not found, generate a meaning for these cards
    return generatePairMeaning(drawnCards[0], drawnCards[1]);
  };

  const value = {
    pairData,
    updatePairData,
    isLoading,
    dataSource,
    generatePairMeaning,
    getRandomPair,
    getRandomDailyDraw
  };

  return (
    <PairDataContext.Provider value={value}>
      {children}
    </PairDataContext.Provider>
  );
};