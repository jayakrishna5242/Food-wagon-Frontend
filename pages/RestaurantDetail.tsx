
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Search, Heart, ArrowLeft } from 'lucide-react';
import MenuItem from '../components/MenuItem';
import { fetchMenu, fetchRestaurants } from '../services/api';
import { Restaurant, MenuItem as MenuItemType } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // In a real app, we'd have a separate endpoint for fetching restaurant by ID
        const allRestaurants = await fetchRestaurants();
        const found = allRestaurants.find(r => r.id === Number(id));
        setRestaurant(found || null);
        
        if (found) {
          const menu = await fetchMenu(Number(id));
          setMenuItems(menu);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading menu...</div>;
  if (!restaurant) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-xl font-bold text-dark">Restaurant not found</p>
      <button 
        onClick={() => navigate('/')}
        className="text-primary font-bold hover:underline"
      >
        Go back to Home
      </button>
    </div>
  );

  const favorited = isFavorite(restaurant.id);

  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group items by category for realistic layout
  const categories: string[] = Array.from(new Set(filteredItems.map(item => item.category)));

  const scrollToCategory = (category: string) => {
    const element = document.getElementById(`category-${category}`);
    if (element) {
      const offset = 100; // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveCategory(category);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-8">
      {/* Hero Section with Image */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img 
          src={restaurant.image} 
          alt={restaurant.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => toggleFavorite(restaurant)}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30"
          >
            <Heart className={`w-5 h-5 ${favorited ? 'fill-orange-500 text-orange-500' : ''}`} />
          </motion.button>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <h1 className="text-2xl md:text-4xl font-bold text-white tracking-tight mb-1">{restaurant.name}</h1>
          <p className="text-white/80 text-sm md:text-base font-medium">{restaurant.cuisines.join(', ')}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-3xl -mt-4 relative z-10">
        {/* Quick Info Card */}
        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-between mb-8">
          <div className="flex flex-col items-center gap-1 border-r border-gray-100 flex-1">
            <div className="flex items-center gap-1 text-orange-500 font-bold">
              <Star className="w-4 h-4 fill-orange-500" />
              <span>{restaurant.rating || '--'}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{restaurant.ratingCount}+ Ratings</span>
          </div>
          
          <div className="flex flex-col items-center gap-1 border-r border-gray-100 flex-1">
            <div className="flex items-center gap-1 text-gray-900 font-bold">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Delivery</span>
          </div>

          <div className="flex flex-col items-center gap-1 flex-1">
            <div className="flex items-center gap-1 text-gray-900 font-bold">
              <span className="text-lg">₹</span>
              <span>{restaurant.costForTwo}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">For Two</span>
          </div>
        </div>

        {/* Menu Search */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search in menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-orange-500/20 transition-all"
          />
        </div>

        {/* Category Navigation */}
        {!searchQuery && categories.length > 1 && (
          <div className="sticky top-16 z-30 bg-white/80 backdrop-blur-md py-4 -mx-4 px-4 mb-8 overflow-x-auto scrollbar-hide flex gap-3 border-b border-gray-50">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => scrollToCategory(category)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === category 
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Menu Items */}
        <div className="space-y-12">
          {categories.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">No items found</p>
            </div>
          ) : (
            categories.map((category) => {
              const itemsInCategory = filteredItems.filter(item => item.category === category);
              return (
                <div key={category} id={`category-${category}`} className="scroll-mt-32">
                  <div className="flex items-center gap-4 mb-6">
                    <h3 className="font-bold text-xl text-gray-900">{category}</h3>
                    <div className="h-px bg-gray-100 flex-1" />
                    <span className="text-xs font-bold text-gray-400">{itemsInCategory.length} items</span>
                  </div>
                  <div className="space-y-8">
                     {itemsInCategory.map(item => (
                       <MenuItem key={item.id} item={item} />
                     ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;