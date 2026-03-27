
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin, Clock } from 'lucide-react';
import { Restaurant } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { useLocationContext } from '../context/LocationContext';
import { calculateDistance } from '../services/api';

import { motion } from 'motion/react';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  const { toggleFavorite, isFavorite } = useFavorites();
  const { coordinates } = useLocationContext();
  const favorited = isFavorite(restaurant.id);

  const distance = useMemo(() => {
    if (coordinates && restaurant.latitude && restaurant.longitude) {
      return calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        restaurant.latitude,
        restaurant.longitude
      );
    }
    return null;
  }, [coordinates, restaurant.latitude, restaurant.longitude]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(restaurant);
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full"
    >
      <Link to={`/restaurant/${restaurant.id}`} className="block group h-full">
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
          
          {/* Favorite Toggle */}
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteClick}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 transition-colors ${favorited ? 'fill-primary text-primary' : 'text-gray-400'}`} />
          </motion.button>

          {restaurant.aggregatedDiscountInfo && (
            <div className="absolute bottom-4 left-4 bg-primary text-white px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm">
              {restaurant.aggregatedDiscountInfo.header}
            </div>
          )}
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-primary transition-colors">{restaurant.name}</h3>
            <div className="flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-lg">
              <Star className="w-3 h-3 text-green-600 fill-green-600" />
              <span className="text-xs font-bold text-green-700">{restaurant.rating > 0 ? restaurant.rating : '4.2'}</span>
            </div>
          </div>
          
          <p className="text-gray-500 text-xs mb-2 line-clamp-1">
            {restaurant.cuisines.join(', ')}
          </p>

          <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-widest mb-3">
            <Clock className="w-3 h-3" />
            <span>{restaurant.deliveryTime}</span>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              <span>{distance !== null ? `${distance} km` : restaurant.location}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const RestaurantCardSkeleton: React.FC = () => {
  return (
    <div className="block">
      <div className="bg-transparent p-0 rounded-2xl overflow-hidden relative animate-pulse">
        {/* Image Placeholder */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-200 mb-3"></div>
        
        <div className="px-1">
          {/* Title Placeholder */}
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
          
          {/* Rating and Time Placeholder */}
          <div className="flex items-center gap-1 mt-0.5 mb-2">
            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            <div className="h-4 w-8 bg-gray-200 rounded"></div>
            <div className="h-4 w-4 bg-gray-200 rounded-full mx-1"></div>
            <div className="h-4 w-16 bg-gray-200 rounded"></div>
          </div>

          {/* Cuisines Placeholder */}
          <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
          {/* Location Placeholder */}
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;