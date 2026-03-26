
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ChevronRight, ArrowLeft, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchGlobal } from '../services/api';
import { Restaurant, MenuItem } from '../types';
import RestaurantCard from '../components/RestaurantCard';
import MenuItemComponent from '../components/MenuItem';

const RECENT_SEARCHES_KEY = 'foodwagon_recent_searches';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

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
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 px-4 py-3 md:py-6 safe-top">
        <div className="container mx-auto max-w-4xl flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 md:p-3 bg-gray-50 border border-gray-100 rounded-full shadow-sm hover:bg-gray-100 transition-all active:scale-90 flex-shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-dark" strokeWidth={2.5} />
          </button>
          
          <div className="relative flex-1 group">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants and food"
              className="w-full h-12 md:h-16 pl-11 md:pl-16 pr-11 md:pr-14 bg-gray-100/80 border-2 border-transparent rounded-2xl text-sm md:text-lg text-dark placeholder-gray-500 focus:outline-none focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"
              autoFocus
            />
            <SearchIcon className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 md:w-6 md:h-6 group-focus-within:text-primary transition-colors" />
            {query && (
              <button 
                onClick={clearSearch}
                className="absolute right-3.5 md:right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark p-1 bg-gray-200/50 rounded-full hover:bg-gray-200 transition-all"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl pt-6">

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* No Results */}
            {restaurants.length === 0 && dishes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <SearchIcon className="w-10 h-10 text-gray-200" />
                </div>
                <p className="text-xl font-black text-dark tracking-tight">No matches found for "{query}"</p>
                <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Try checking your spelling or use different keywords.</p>
                <button 
                  onClick={clearSearch}
                  className="mt-8 px-8 py-3 bg-dark text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
                >
                  Clear Search
                </button>
              </div>
            )}

            {/* Restaurant Results */}
            {restaurants.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-3 md:mb-6">
                  <h2 className="text-base md:text-xl font-extrabold text-dark tracking-tight">Restaurants</h2>
                  <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest">{restaurants.length} Results</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                  {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="group border border-gray-100 rounded-xl md:rounded-2xl hover:shadow-xl hover:shadow-gray-100 transition-all duration-300 bg-white overflow-hidden">
                       <Link to={`/restaurant/${restaurant.id}`} className="flex items-center p-2.5 md:p-4 gap-3 md:gap-4">
                          <div className="w-14 h-14 md:w-24 md:h-24 rounded-lg md:rounded-xl overflow-hidden flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-300">
                             <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-dark text-sm md:text-lg truncate group-hover:text-primary transition-colors">{restaurant.name}</h3>
                             <p className="text-[10px] md:text-sm text-gray-500 truncate mt-0.5">{restaurant.cuisines.join(', ')}</p>
                             <div className="flex items-center gap-2 md:gap-3 mt-1.5 md:mt-2 text-[9px] md:text-xs text-gray-400 font-bold uppercase tracking-tighter">
                                <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded">
                                   ★ {restaurant.rating}
                                </span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                <span>{restaurant.deliveryTime}</span>
                             </div>
                          </div>
                          <ChevronRight className="text-gray-300 w-4 h-4 md:w-5 md:h-5 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                       </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dish Results */}
            {dishes.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4 md:mb-6">
                  <h2 className="text-lg md:text-xl font-extrabold text-dark tracking-tight">Dishes</h2>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{dishes.length} Results</span>
                </div>
                <div className="space-y-4 md:space-y-8">
                  {dishes.map(dish => (
                    <div key={dish.id} className="bg-white border border-gray-100 rounded-2xl p-4 md:p-6 hover:shadow-xl hover:shadow-gray-100 transition-all duration-300">
                       <div className="flex justify-between items-center mb-4">
                          <Link to={`/restaurant/${dish.restaurantId}`} className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-1.5">
                             From {dish.restaurantName} <ChevronRight className="w-3 h-3" />
                          </Link>
                       </div>
                       <MenuItemComponent item={dish} />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* Default State */}
        {!hasSearched && !loading && (
           <div className="py-2 md:py-10">
              {recentSearches.length > 0 ? (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-black text-dark text-[10px] md:text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                      <span className="w-6 md:w-8 h-[1px] bg-gray-200"></span>
                      Recent Searches
                    </h3>
                    <button 
                      onClick={clearAllRecent}
                      className="text-[10px] md:text-xs font-bold text-primary hover:underline uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map(term => (
                      <div 
                        key={term}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group cursor-pointer"
                        onClick={() => setQuery(term)}
                      >
                        <History className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs font-bold text-gray-700">{term}</span>
                        <button 
                          onClick={(e) => removeRecentSearch(e, term)}
                          className="p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-16 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <SearchIcon className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">Search for your favorite food or restaurant</p>
                </div>
              )}
           </div>
        )}

      </div>
    </div>
  );
};

export default Search;