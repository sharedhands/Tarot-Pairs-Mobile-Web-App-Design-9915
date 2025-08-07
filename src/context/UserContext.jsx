import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [dailyDrawHistory, setDailyDrawHistory] = useState([]);

  useEffect(() => {
    if (user) {
      // Load user data from localStorage
      const storedFavorites = localStorage.getItem(`favorites_${user.id}`);
      const storedHistory = localStorage.getItem(`dailyDraw_${user.id}`);
      
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      if (storedHistory) {
        setDailyDrawHistory(JSON.parse(storedHistory));
      }
    } else {
      setFavorites([]);
      setDailyDrawHistory([]);
    }
  }, [user]);

  const addToFavorites = (cardPair) => {
    if (!user) return;
    
    const newFavorites = [...favorites, { ...cardPair, id: Date.now() }];
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
  };

  const removeFromFavorites = (pairId) => {
    if (!user) return;
    
    const newFavorites = favorites.filter(fav => fav.id !== pairId);
    setFavorites(newFavorites);
    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
  };

  const addToDailyDrawHistory = (draw) => {
    if (!user) return;
    
    const newHistory = [{ ...draw, date: new Date().toISOString() }, ...dailyDrawHistory.slice(0, 29)];
    setDailyDrawHistory(newHistory);
    localStorage.setItem(`dailyDraw_${user.id}`, JSON.stringify(newHistory));
  };

  const value = {
    favorites,
    dailyDrawHistory,
    addToFavorites,
    removeFromFavorites,
    addToDailyDrawHistory,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};