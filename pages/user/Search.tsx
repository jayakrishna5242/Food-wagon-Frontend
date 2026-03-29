
import React, { useState, useEffect, useMemo } from 'react';
import { Search as SearchIcon, X, ChevronRight, ArrowLeft, History, Star, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchGlobal, calculateDistance, calculateDeliveryTime } from '../../services/api';
import { Restaurant, MenuItem } from '../../types';
import RestaurantCard from '../../components/RestaurantCard';
import MenuItemComponent from '../../components/MenuItem';
import { useLocationContext } from '../../context/LocationContext';

const RECENT_SEARCHES_KEY = 'foodwagon_recent_searches';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const { coordinates } = useLocationContext();

  const getDeliveryTime = (restaurant: Restaurant) => {
    if (coordinates && restaurant.latitude && restaurant.longitude) {
      const distance = calculateDistance(coordinates.latitude, coordinates.longitude, restaurant.latitude, restaurant.longitude);
      return calculateDeliveryTime(distance);
    }
    return restaurant.deliveryTime;
  };

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const saveSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    const updated = [
      searchTerm,
      ...recentSearches.filter(s => s !== searchTerm)
    ].slice(0, 5); // Keep last 5 searches
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const removeRecentSearch = (e: React.MouseEvent, searchTerm: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        setHasSearched(true);
        try {
          const results = await searchGlobal(query);
          setRestaurants(results.restaurants);
          setDishes(results.items);
          if (results.restaurants.length > 0 || results.items.length > 0) {
            saveSearch(query);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        setRestaurants([]);
        setDishes([]);
        setHasSearched(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setRestaurants([]);
    setDishes([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-white pb-28 md:pb-10">
      {/* Search Header */}
      <div className="sticky top-20 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-4 safe-top">
        <div className="container mx-auto max-w-2xl flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants or dishes"
              className="w-full h-12 pl-12 pr-12 bg-gray-50 border-none rounded-none text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 transition-all"
              autoFocus
            />
            {query && (
              <button 
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl pt-8">
        {/* Recent Searches Section */}
        {recentSearches.length > 0 && (
          <div className="py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs text-gray-400 uppercase tracking-widest">Recent Searches</h3>
              <button 
                onClick={clearAllRecent}
                className="text-xs font-bold text-orange-500 hover:underline"
              >
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(term => (
                <div 
                  key={term}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-all group cursor-pointer"
                  onClick={() => setQuery(term)}
                >
                  <History className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">{term}</span>
                  <button 
                    onClick={(e) => removeRecentSearch(e, term)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Searching...</p>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* No Results */}
            {restaurants.length === 0 && dishes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-bold">No results found</p>
                <p className="text-gray-400 text-sm mt-1">Try different keywords or check spelling</p>
              </div>
            )}

            {/* Restaurant Results */}
            {restaurants.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-bold text-lg text-gray-900">Restaurants</h2>
                  <div className="h-px bg-gray-100 flex-1" />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {restaurants.map(restaurant => (
                    <Link 
                      key={restaurant.id} 
                      to={`/restaurant/${restaurant.id}`}
                      className="flex items-center p-3 gap-4 hover:bg-gray-50 rounded-2xl transition-all group"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                        <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate group-hover:text-orange-500 transition-colors">{restaurant.name}</h3>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{restaurant.cuisines.join(', ')}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1 text-orange-500">
                            <Star className="w-3 h-3 fill-orange-500" /> {restaurant.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {getDeliveryTime(restaurant)}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="text-gray-300 w-5 h-5 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Dish Results */}
            {dishes.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-bold text-lg text-gray-900">Dishes</h2>
                  <div className="h-px bg-gray-100 flex-1" />
                </div>
                <div className="space-y-8">
                  {dishes.map(dish => (
                    <div key={dish.id} className="group">
                      <Link to={`/restaurant/${dish.restaurantId}`} className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:text-orange-500 mb-4 transition-colors">
                        From {dish.restaurantName} <ChevronRight className="w-3 h-3" />
                      </Link>
                      <MenuItemComponent item={dish} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Default State (Empty) */}
        {!hasSearched && !loading && recentSearches.length === 0 && (
          <div className="mt-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Search for food or restaurants</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
