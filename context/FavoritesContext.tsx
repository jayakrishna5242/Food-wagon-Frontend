
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant } from '../types';
import { useToast } from './ToastContext';

interface FavoritesContextType {
  favorites: Restaurant[];
  toggleFavorite: (restaurant: Restaurant) => void;
  isFavorite: (restaurantId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);
  const { showToast } = useToast();

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem('foodwagon_favorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  // Save favorites whenever they change
  useEffect(() => {
    localStorage.setItem('foodwagon_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (restaurant: Restaurant) => {
    const exists = favorites.some(f => f.id === restaurant.id);
    if (exists) {
      setFavorites(prev => prev.filter(f => f.id !== restaurant.id));
      showToast(`Removed ${restaurant.name} from favorites`, 'info');
    } else {
      setFavorites(prev => [...prev, restaurant]);
      showToast(`Added ${restaurant.name} to favorites`, 'success');
    }
  };

  const isFavorite = (restaurantId: number) => {
    return favorites.some(f => f.id === restaurantId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};