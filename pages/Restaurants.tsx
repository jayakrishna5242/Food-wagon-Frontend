
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronDown, X, MapPin, Search as SearchIcon, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/RestaurantCard';
import { Restaurant } from '../types';
import { fetchRestaurants, calculateDistance } from '../services/api';
import { useLocationContext } from '../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';

type SortOption = 'Relevance' | 'Nearest' | 'Delivery Time' | 'Rating' | 'Cost: Low to High' | 'Cost: High to Low';

const Restaurants: React.FC = () => {
  const { city, coordinates, setCoordinates } = useLocationContext();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('Relevance');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation && !coordinates) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setSortBy('Nearest');
        },
        (error) => {
          console.error("Error detecting location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchRestaurants(city);
        setRestaurants(data);
      } catch (err) {
        console.error("Failed to load restaurants", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [city]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filters = [
    "Fast Delivery", 
    "New on FoodWagon", 
    "Ratings 4.0+", 
    "Pure Veg", 
    "Offers", 
    "Rs. 300-Rs. 600", 
    "Less than Rs. 300"
  ];

  const sortOptions: SortOption[] = [
    'Relevance', 
    'Nearest',
    'Delivery Time', 
    'Rating', 
    'Cost: Low to High', 
    'Cost: High to Low'
  ];

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
    setVisibleCount(12);
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    setIsSortOpen(false);
    setVisibleCount(12);
  };

  const clearFilters = () => {
    setActiveFilters([]);
    setSortBy('Relevance');
    setVisibleCount(12);
    setSearchQuery('');
  };

  const processedRestaurants = useMemo(() => {
    let result = [...restaurants];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.name.toLowerCase().includes(query) || 
        r.cuisines.some(c => c.toLowerCase().includes(query))
      );
    }

    if (activeFilters.length > 0) {
      if (activeFilters.includes("Fast Delivery")) {
        result = result.filter(r => parseInt(r.deliveryTime) <= 30);
      }
      if (activeFilters.includes("New on FoodWagon")) {
        result = result.filter(r => r.isNew);
      }
      if (activeFilters.includes("Ratings 4.0+")) {
        result = result.filter(r => r.rating >= 4.0);
      }
      if (activeFilters.includes("Pure Veg")) {
        result = result.filter(r => r.isPureVeg);
      }
      if (activeFilters.includes("Offers")) {
        result = result.filter(r => !!r.aggregatedDiscountInfo);
      }
      if (activeFilters.includes("Rs. 300-Rs. 600")) {
        result = result.filter(r => {
          const cost = parseInt(r.costForTwo.replace(/\D/g, ''));
          return cost >= 300 && cost <= 600;
        });
      }
      if (activeFilters.includes("Less than Rs. 300")) {
        result = result.filter(r => {
          const cost = parseInt(r.costForTwo.replace(/\D/g, ''));
          return cost < 300;
        });
      }
    }

    switch (sortBy) {
      case 'Nearest':
        if (coordinates) {
          result.sort((a, b) => {
            const distA = a.latitude && a.longitude ? calculateDistance(coordinates.latitude, coordinates.longitude, a.latitude, a.longitude) : Infinity;
            const distB = b.latitude && b.longitude ? calculateDistance(coordinates.latitude, coordinates.longitude, b.latitude, b.longitude) : Infinity;
            return distA - distB;
          });
        }
        break;
      case 'Delivery Time':
        result.sort((a, b) => parseInt(a.deliveryTime) - parseInt(b.deliveryTime));
        break;
      case 'Rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'Cost: Low to High':
        result.sort((a, b) => parseInt(a.costForTwo.replace(/\D/g, '')) - parseInt(b.costForTwo.replace(/\D/g, '')));
        break;
      case 'Cost: High to Low':
        result.sort((a, b) => parseInt(b.costForTwo.replace(/\D/g, '')) - parseInt(a.costForTwo.replace(/\D/g, '')));
        break;
      default:
        break;
    }

    return result;
  }, [restaurants, activeFilters, sortBy, coordinates, searchQuery]);

  const displayedRestaurants = processedRestaurants.slice(0, visibleCount);
  const hasMore = processedRestaurants.length > visibleCount;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header with Search */}
      <div className="bg-white sticky top-20 z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={city === 'Select Location' ? "Select a location to search..." : `Search for restaurants in ${city}...`}
                disabled={city === 'Select Location'}
                className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl py-3.5 pl-12 pr-4 text-dark font-semibold transition-all outline-none shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {city === 'Select Location' ? (
          <div className="py-20 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-32 h-32 bg-orange-50 rounded-full flex items-center justify-center mb-8 relative">
              <MapPin className="w-12 h-12 text-primary animate-bounce" />
              <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
            </div>
            <h2 className="text-3xl font-black text-dark uppercase tracking-tight mb-4">
              Where are you?
            </h2>
            <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 text-lg leading-relaxed">
              Please select your location to discover the best restaurants delivering to your doorstep.
            </p>
            <button 
              onClick={() => {
                // Trigger the dropdown in Navbar if possible, but for now just show a message
                const dropdownBtn = document.querySelector('[onClick*="setShowCityDropdown"]');
                if (dropdownBtn instanceof HTMLElement) {
                  dropdownBtn.click();
                }
              }}
              className="bg-primary text-white font-black py-5 px-12 rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 uppercase text-sm tracking-widest active:scale-95"
            >
              Select Location Above
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-dark uppercase">
                  Restaurants in {city}
                </h1>
                <p className="text-gray-500 font-medium mt-1">
                  {processedRestaurants.length} local favorites discovered
                </p>
              </div>

              {/* Filters & Sort */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                <div className="relative" ref={sortRef}>
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-wider shadow-sm whitespace-nowrap transition-all ${sortBy !== 'Relevance' ? 'bg-dark text-white border-dark' : 'bg-white text-dark border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span>{sortBy === 'Relevance' ? 'Sort By' : sortBy}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-[60]"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSortChange(option)}
                            className={`w-full text-left px-5 py-3.5 text-[11px] md:text-xs hover:bg-gray-50 border-b last:border-0 border-gray-50 font-bold uppercase tracking-wider ${sortBy === option ? 'text-primary' : 'text-dark'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>

                {filters.map((filter, index) => {
                  const isActive = activeFilters.includes(filter);
                  return (
                    <button 
                      key={index}
                      onClick={() => toggleFilter(filter)}
                      className={`border rounded-xl px-4 py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-wider shadow-sm whitespace-nowrap transition-all ${
                        isActive 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white text-dark border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {filter}
                    </button>
                  );
                })}
              </div>
            </div>

            {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 gap-y-10">
                 {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                   <RestaurantCardSkeleton key={i} />
                 ))}
               </div>
            ) : (
              <>
                {displayedRestaurants.length === 0 ? (
                  <div className="text-center py-24 flex flex-col items-center bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <SearchIcon className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-dark uppercase">No Restaurants Found</h3>
                    <p className="text-gray-500 mt-3 mb-10 max-w-md mx-auto font-medium">
                      We couldn't find any restaurants matching your search or filters in {city}.
                    </p>
                    <button 
                      onClick={clearFilters}
                      className="bg-dark text-white font-bold py-4 px-10 rounded-2xl hover:bg-gray-800 transition-all uppercase text-xs tracking-widest"
                    >
                      Clear All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 gap-y-6 md:gap-y-10">
                    {displayedRestaurants.map((restaurant) => (
                      <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                    ))}
                  </div>
                )}

                {hasMore && (
                  <div className="flex justify-center mt-16">
                    <button 
                      onClick={() => setVisibleCount(prev => prev + 8)}
                      className="px-12 py-4 bg-white border-2 border-dark text-dark font-bold rounded-2xl hover:bg-dark hover:text-white transition-all uppercase text-xs tracking-widest shadow-lg shadow-dark/5"
                    >
                      Load More Restaurants
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
