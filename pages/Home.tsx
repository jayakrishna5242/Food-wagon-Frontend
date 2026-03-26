
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronDown, X, MapPin, Search as SearchIcon, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import RestaurantCard, { RestaurantCardSkeleton } from '../components/RestaurantCard';
import FoodCard from '../components/FoodCard';
import CategoryChips from '../components/CategoryChips';
import { Restaurant, MenuItem } from '../types';
import { fetchRestaurants, calculateDistance } from '../services/api';
import { MOCK_MENU_ITEMS } from '../mockData';
import { useLocationContext } from '../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';

const Home: React.FC = () => {
  const { city, coordinates } = useLocationContext();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const categories = ['All', 'Pizza', 'Burgers', 'Drinks', 'Desserts', 'Sides', 'Main Course'];

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

  const filteredFoodItems = useMemo(() => {
    let result = [...MOCK_MENU_ITEMS];
    if (activeCategory !== 'All') {
      result = result.filter(item => item.category.toLowerCase().includes(activeCategory.toLowerCase().slice(0, -1)));
      // Special handling for plural categories
      if (activeCategory === 'Burgers') result = MOCK_MENU_ITEMS.filter(i => i.category === 'Burgers');
      if (activeCategory === 'Pizzas') result = MOCK_MENU_ITEMS.filter(i => i.category === 'Pizzas');
    }
    if (searchQuery) {
      result = result.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return result;
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 py-4 border-b border-gray-50">
        <div className="container mx-auto max-w-7xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-xl">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Deliver to</p>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-gray-900">{city}</span>
                  <ChevronDown className="w-4 h-4 text-primary" />
                </div>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
              <img src="https://picsum.photos/seed/user/100/100" alt="User" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for food, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => navigate('/search')}
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-sm"
            />
            <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white p-1.5 rounded-lg shadow-sm border border-gray-100">
              <Filter className="w-4 h-4 text-primary" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Categories */}
        <section className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-900">Categories</h2>
            <button className="text-primary text-xs font-bold">See All</button>
          </div>
          <CategoryChips
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </section>

        {/* Food Items */}
        <section className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Popular Dishes</h2>
            <button className="text-primary text-xs font-bold">View All</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredFoodItems.map((item) => (
              <FoodCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Restaurants */}
        <section className="mt-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Nearby Restaurants</h2>
            <button className="text-primary text-xs font-bold">View All</button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <RestaurantCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;