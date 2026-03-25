
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ChevronRight, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { searchGlobal } from '../services/api';
import { Restaurant, MenuItem } from '../types';
import RestaurantCard from '../components/RestaurantCard';
import MenuItemComponent from '../components/MenuItem';

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        setHasSearched(true);
        try {
          const results = await searchGlobal(query);
          setRestaurants(results.restaurants);
          setDishes(results.items);
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
    <div className="min-h-screen bg-white pt-8 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {/* Search Header with Back Button */}
        <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-10">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 md:p-3 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition-all active:scale-95 flex-shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 text-dark" strokeWidth={2.5} />
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for restaurants and food"
              className="w-full h-10 md:h-12 pl-10 md:pl-12 pr-8 md:pr-10 border border-gray-300 rounded-lg text-sm md:text-base text-dark placeholder-gray-500 focus:outline-none focus:shadow-md transition-shadow"
              autoFocus
            />
            <SearchIcon className="absolute left-3 md:left-4 top-2.5 md:top-3.5 text-gray-500 w-4 h-4 md:w-5 md:h-5" />
            {query && (
              <button 
                onClick={clearSearch}
                className="absolute right-3 md:right-4 top-2.5 md:top-3.5 text-gray-500 hover:text-dark"
              >
                <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && hasSearched && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* No Results */}
            {restaurants.length === 0 && dishes.length === 0 && (
              <div className="text-center py-10">
                <p className="text-lg font-bold text-gray-700">No matches found for "{query}"</p>
                <p className="text-gray-500 text-sm mt-1">Try checking your spelling or use different keywords.</p>
              </div>
            )}

            {/* Restaurant Results */}
            {restaurants.length > 0 && (
              <section>
                <h2 className="text-lg md:text-xl font-extrabold text-dark mb-4 md:mb-6">Restaurants</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {restaurants.map(restaurant => (
                    <div key={restaurant.id} className="border border-gray-100 rounded-xl md:rounded-2xl hover:shadow-lg transition-all duration-200 bg-white">
                       <Link to={`/restaurant/${restaurant.id}`} className="flex items-center p-3 md:p-4 gap-3 md:gap-4">
                          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden flex-shrink-0">
                             <img src={restaurant.imageUrl} alt={restaurant.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <h3 className="font-bold text-dark text-base md:text-lg truncate">{restaurant.name}</h3>
                             <p className="text-xs md:text-sm text-gray-500 truncate">{restaurant.cuisines.join(', ')}</p>
                             <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-gray-400">
                                <span className="flex items-center gap-0.5">
                                   <span className="text-dark font-semibold">★ {restaurant.rating}</span>
                                </span>
                                <span>•</span>
                                <span>{restaurant.deliveryTime}</span>
                             </div>
                          </div>
                          <ChevronRight className="text-gray-300 w-4 h-4 md:w-5 md:h-5" />
                       </Link>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Dish Results */}
            {dishes.length > 0 && (
              <section>
                <h2 className="text-xl font-extrabold text-dark mb-4">Dishes</h2>
                <div className="space-y-6">
                  {dishes.map(dish => (
                    <div key={dish.id} className="bg-white border-b border-gray-100 pb-6 last:border-0">
                       <div className="flex justify-between items-center mb-2">
                          <Link to={`/restaurant/${dish.restaurantId}`} className="text-xs font-bold text-gray-500 hover:text-primary transition-colors flex items-center gap-1">
                             By {dish.restaurantName} <ChevronRight className="w-3 h-3" />
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
           <div className="py-10">
              <h3 className="font-bold text-dark text-lg mb-4">Popular Cuisines</h3>
              <div className="flex flex-wrap gap-3">
                 {["Biryani", "Pizza", "Burger", "Chinese", "Cake", "Ice Cream", "North Indian", "Salad"].map(cuisine => (
                    <button 
                      key={cuisine}
                      onClick={() => setQuery(cuisine)}
                      className="px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {cuisine}
                    </button>
                 ))}
              </div>
           </div>
        )}

      </div>
    </div>
  );
};

export default Search;