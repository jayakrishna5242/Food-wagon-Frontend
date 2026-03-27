
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronDown, X, MapPin, Store, Utensils, ShoppingBag, Bike, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/RestaurantCard';
import { Restaurant } from '../types';
import { fetchRestaurants, calculateDistance } from '../services/api';
import { useLocationContext } from '../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';

type SortOption = 'Relevance' | 'Nearest' | 'Delivery Time' | 'Rating' | 'Cost: Low to High' | 'Cost: High to Low';

const Home: React.FC = () => {
  const { city, coordinates, setCoordinates } = useLocationContext();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('Relevance');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect user location on mount
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
  };

  const processedRestaurants = useMemo(() => {
    let result = [...restaurants];

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
  }, [restaurants, activeFilters, sortBy, coordinates]);

  const displayedRestaurants = processedRestaurants.slice(0, visibleCount);
  const hasMore = processedRestaurants.length > visibleCount;

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-[#171a29] text-white py-8 md:py-12 px-4">
        <div className="container mx-auto max-w-7xl text-center md:text-left">
           <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Build Your Food Network</h1>
           <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto md:mx-0">
              Currently exploring <span className="text-white font-bold border-b border-primary">{city}</span>. 
              {restaurants.length === 0 ? " No restaurants have registered here yet." : ` Discover ${restaurants.length} local favorites.`}
           </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-8">
        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
           <Link to="/search" className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden p-4 md:p-6 h-32 md:h-44 flex flex-col justify-between shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white"
              >
                <div className="z-10">
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">Food</h3>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-90">UP TO 20% OFF</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10 mt-2 md:mt-4">
                  <span className="text-xs md:text-sm font-bold border-b-2 border-white/40 group-hover:border-white transition-all">ORDER NOW</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                   <Utensils className="w-20 h-20 md:w-[120px] md:h-[120px]" strokeWidth={1} />
                </div>
              </motion.div>
           </Link>

           <Link to="/fresh-stores" className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden p-4 md:p-6 h-32 md:h-44 flex flex-col justify-between shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
              >
                <div className="z-10">
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">Stores</h3>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-90">CLEAN & FRESH</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10 mt-2 md:mt-4">
                  <span className="text-xs md:text-sm font-bold border-b-2 border-white/40 group-hover:border-white transition-all">SHOP NOW</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                   <Store className="w-20 h-20 md:w-[120px] md:h-[120px]" strokeWidth={1} />
                </div>
              </motion.div>
           </Link>

           <Link to="/supermarket" className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden p-4 md:p-6 h-32 md:h-44 flex flex-col justify-between shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white"
              >
                <div className="z-10">
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">Mart</h3>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-90">GROCERY DELIVERY</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10 mt-2 md:mt-4">
                  <span className="text-xs md:text-sm font-bold border-b-2 border-white/40 group-hover:border-white transition-all">ORDER NOW</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                   <ShoppingBag className="w-20 h-20 md:w-[120px] md:h-[120px]" strokeWidth={1} />
                </div>
              </motion.div>
           </Link>

           <Link to="/delivery-service" className="group">
              <motion.div 
                whileHover={{ y: -5 }}
                className="relative overflow-hidden p-4 md:p-6 h-32 md:h-44 flex flex-col justify-between shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white"
              >
                <div className="z-10">
                  <div className="flex flex-col">
                    <h3 className="text-lg md:text-2xl font-black tracking-tighter uppercase">Genie</h3>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-wide opacity-90">SEND & RECEIVE</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10 mt-2 md:mt-4">
                  <span className="text-xs md:text-sm font-bold border-b-2 border-white/40 group-hover:border-white transition-all">BOOK NOW</span>
                  <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-2 -bottom-2 md:-right-4 md:-bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                   <Bike className="w-20 h-20 md:w-[120px] md:h-[120px]" strokeWidth={1} />
                </div>
              </motion.div>
           </Link>
        </div>
        
        {restaurants.length > 0 && (
          <div className="sticky top-20 bg-white z-40 py-3 md:py-4 mb-6 md:mb-8 border-b border-gray-100">
            <div className="flex items-center">
              <div className="flex items-center gap-2 md:gap-3 flex-shrink-0 relative z-50 mr-2 md:mr-4">
                {(activeFilters.length > 0 || sortBy !== 'Relevance') && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="flex items-center gap-1 border border-primary text-primary bg-orange-50 rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-bold shadow-sm whitespace-nowrap hover:bg-orange-100 transition-colors"
                  >
                    <span className="hidden xs:inline">Clear</span>
                    <X className="w-3 h-3" />
                  </motion.button>
                )}

                <div className="relative" ref={sortRef}>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-1 border rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium shadow-sm whitespace-nowrap transition-colors ${sortBy !== 'Relevance' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-dark border-gray-300 hover:bg-gray-50'}`}
                  >
                    <span>{sortBy === 'Relevance' ? 'Sort' : sortBy}</span>
                    <ChevronDown className="w-3 h-3" />
                  </motion.button>
                  
                  <AnimatePresence>
                    {isSortOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-2 overflow-hidden z-[60]"
                      >
                        {sortOptions.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleSortChange(option)}
                            className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b last:border-0 border-gray-50 ${sortBy === option ? 'text-primary font-bold' : 'text-dark'}`}
                          >
                            {option}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="h-6 w-[1px] bg-gray-300 flex-shrink-0 hidden sm:block mr-2 md:mr-4"></div>

              <div className="flex-1 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 md:gap-3 pb-1">
                  {filters.map((filter, index) => {
                     const isActive = activeFilters.includes(filter);
                     return (
                      <motion.button 
                        key={index} 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleFilter(filter)}
                        className={`border rounded-full px-3 md:px-4 py-1.5 text-xs md:text-sm font-medium shadow-sm whitespace-nowrap transition-all ${
                          isActive 
                            ? 'bg-gray-800 text-white border-gray-800' 
                            : 'bg-white text-dark border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {filter}
                        {isActive && <span className="ml-1.5 inline-block text-[10px]">✕</span>}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 gap-y-10">
             {[1, 2, 3, 4].map((i) => (
               <RestaurantCardSkeleton key={i} />
             ))}
           </div>
        ) : (
          <>
            {displayedRestaurants.length === 0 ? (
              <div className="text-center py-16 md:py-24 flex flex-col items-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                  <MapPin className="w-10 h-10 md:w-12 md:h-12 text-primary/20" />
                </div>
                <h3 className="text-xl md:text-3xl font-black text-dark tracking-tight">We Will Come At Your home Town</h3>
                <p className="text-sm md:text-lg text-gray-500 mt-3 mb-10 max-w-md mx-auto font-medium">
                  Please wait for us. We are expanding rapidly to bring the best flavors of {city} to your doorstep!
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                   {activeFilters.length > 0 ? (
                     <button onClick={clearFilters} className="bg-dark text-white font-black py-4 px-10 rounded-2xl hover:bg-gray-800 transition-all uppercase text-xs tracking-widest">
                        Clear Filters
                     </button>
                   ) : (
                     <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-primary font-bold">
                           <span className="w-2 h-2 bg-primary rounded-full animate-ping"></span>
                           <span>Coming Soon to {city}</span>
                        </div>
                        <div className="mt-4 p-6 bg-white rounded-3xl shadow-sm border border-gray-100 max-w-xs">
                           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">#goFeastigo</p>
                           <div className="flex items-center gap-2 text-sm font-bold text-dark">
                              <span>🇮🇳 Made for {city}</span>
                           </div>
                           <div className="flex items-center gap-2 text-sm font-bold text-dark mt-1">
                              <span>❤️ Crafted by Feastigo</span>
                           </div>
                        </div>
                     </div>
                   )}
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-xl md:text-2xl font-bold text-dark mb-6">
                  {processedRestaurants.length} Restaurant{processedRestaurants.length > 1 ? 's' : ''} in {city}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 gap-y-6 md:gap-y-10">
                  {displayedRestaurants.map((restaurant) => (
                    <RestaurantCard key={restaurant.id} restaurant={restaurant} />
                  ))}
                </div>
              </>
            )}

            {hasMore && (
              <div className="flex justify-center mt-12">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVisibleCount(prev => prev + 8)}
                  className="px-8 py-3 bg-white border border-gray-300 text-dark font-bold rounded-md hover:bg-gray-50 hover:shadow-md transition-all"
                >
                  Show More
                </motion.button>
              </div>
            )}
            
            {!hasMore && displayedRestaurants.length > 0 && (
              <div className="flex justify-center mt-12 mb-8">
                <div className="text-gray-400 text-sm uppercase tracking-widest border-b border-gray-200 pb-1">
                   All {city} Restaurants Shown
                </div>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Home;