
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Restaurant } from '../types';
import { fetchFavorites, toggleFavorite as apiToggleFavorite } from '../services/api';

interface FavoritesContextType {
  favorites: Restaurant[];
  toggleFavorite: (restaurant: Restaurant) => Promise<void>;
  isFavorite: (restaurantId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<Restaurant[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const load = async () => {
      const data = await fetchFavorites();
      setFavorites(data);
    };
    load();
  }, []);

  const toggleFavorite = async (restaurant: Restaurant) => {
    const updated = await apiToggleFavorite(restaurant);
    setFavorites(updated);
    const exists = updated.some(f => f.id === restaurant.id);
    if (!exists) {
      console.log(`Removed ${restaurant.name} from favorites`);
    } else {
      console.log(`Added ${restaurant.name} to favorites`);
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