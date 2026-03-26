
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, MapPin } from 'lucide-react';
import { Restaurant } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { useLocationContext } from '../context/LocationContext';
import { calculateDistance } from '../services/api';

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
    <Link to={`/restaurant/${restaurant.id}`} className="block group hover:scale-[0.98] transition-transform duration-100">
      <div className="bg-transparent hover:shadow-none p-0 rounded-2xl overflow-hidden relative">
        <div className="relative h-40 md:h-48 w-full rounded-2xl overflow-hidden shadow-lg">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>
          
          {/* Distance Badge */}
          {distance !== null && (
            <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg flex items-center gap-1 shadow-sm">
              <MapPin className="w-2.5 h-2.5 text-primary" />
              <span className="text-[9px] md:text-[10px] font-black text-dark">{distance} km</span>
            </div>
          )}

          {/* Favorite Toggle */}
          <button 
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 z-10 p-1.5 md:p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-all active:scale-125"
            aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${favorited ? 'fill-primary text-primary' : 'text-white'}`} />
          </button>

          {restaurant.aggregatedDiscountInfo && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-white font-extrabold text-xs md:text-xl font-sans uppercase leading-tight drop-shadow-md truncate">
                {restaurant.aggregatedDiscountInfo.header} {restaurant.aggregatedDiscountInfo.subHeader}
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-3 px-1">
          <h3 className="font-bold text-base md:text-lg text-dark/90 truncate">{restaurant.name}</h3>
          
          <div className="flex items-center gap-1 font-semibold text-dark/80 text-xs md:text-sm mt-0.5">
            <div className="bg-green-600 rounded-full p-0.5">
              <Star className="w-2.5 h-2.5 text-white fill-white" />
            </div>
            <span>{restaurant.rating > 0 ? restaurant.rating : '--'}</span>
            <span className="mx-1">•</span>
            <span>{restaurant.deliveryTime}</span>
          </div>

          <p className="text-graytext text-xs md:text-sm truncate mt-1">
            {restaurant.cuisines.join(', ')}
          </p>
          <p className="text-graytext text-[10px] md:text-sm mt-0.5">
            {restaurant.location}
          </p>
        </div>
      </div>
    </Link>
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