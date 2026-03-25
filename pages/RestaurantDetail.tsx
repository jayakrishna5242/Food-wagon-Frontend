
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, MapPin, Search, Heart, ArrowLeft } from 'lucide-react';
import MenuItem from '../components/MenuItem';
import { fetchMenu, fetchRestaurants } from '../services/api';
import { Restaurant, MenuItem as MenuItemType } from '../types';
import { useFavorites } from '../context/FavoritesContext';

const RestaurantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [loading, setLoading] = useState(true);
  
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

  // Group items by category for realistic layout
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="container mx-auto px-4 max-w-3xl pt-4 md:pt-8">
        
        {/* Top Navigation Row */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-dark hover:text-primary transition-colors font-bold text-xs md:text-sm bg-white px-3 md:px-4 py-2 rounded-full shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          
          {/* Breadcrumb - Simplified */}
          <div className="text-[9px] md:text-[10px] uppercase tracking-widest font-black text-gray-400 truncate max-w-[150px] md:max-w-none">
            {restaurant.location} / {restaurant.name}
          </div>
        </div>

        {/* Restaurant Header Info */}
        <div className="bg-white rounded-2xl md:rounded-[24px] p-4 md:p-8 shadow-sm mb-6 md:mb-8 border border-gray-100">
            <div className="flex justify-between items-start gap-3 md:gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <h1 className="text-lg md:text-3xl font-black text-dark tracking-tight truncate">{restaurant.name}</h1>
                  <button 
                    onClick={() => toggleFavorite(restaurant)}
                    className="p-1 md:p-2 hover:bg-orange-50 rounded-full transition-all active:scale-125 flex-shrink-0"
                    title={favorited ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Heart className={`w-4 h-4 md:w-6 md:h-6 transition-colors ${favorited ? 'fill-primary text-primary' : 'text-gray-300'}`} />
                  </button>
                </div>
                <p className="text-[10px] md:text-sm font-semibold text-graytext mb-2 md:mb-3 truncate">{restaurant.cuisines.join(', ')}</p>
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-graytext">
                   <div className="bg-gray-100 p-0.5 md:p-1 rounded">
                    <MapPin className="w-2.5 h-2.5 md:w-4 md:h-4" />
                   </div>
                   <span className="font-medium truncate">{restaurant.location}, 2.5 km</span>
                </div>
              </div>
              
              <div className="border border-gray-100 rounded-lg md:rounded-xl p-1.5 md:p-3 flex flex-col items-center justify-center shadow-sm min-w-[50px] md:min-w-[80px] bg-white flex-shrink-0">
                 <div className="flex items-center gap-0.5 md:gap-1 font-black text-green-700 border-b border-gray-100 pb-1 md:pb-2 mb-1 md:mb-2 w-full justify-center text-xs md:text-base">
                   <Star className="w-2.5 h-2.5 md:w-4 md:h-4 fill-green-700" />
                   <span>{restaurant.rating}</span>
                 </div>
                 <span className="text-[7px] md:text-[10px] text-graytext font-black tracking-tight uppercase text-center">1K+ ratings</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 my-4 md:my-6"></div>

            <div className="flex items-center gap-6 md:gap-8">
               <div className="flex items-center gap-2 md:gap-3 text-dark font-black text-xs md:text-sm">
                 <div className="bg-gray-100 p-1 md:p-1.5 rounded-lg">
                    <Clock className="w-4 h-4 md:w-5 md:h-5" />
                 </div>
                 <span>{restaurant.deliveryTime}</span>
               </div>
               <div className="flex items-center gap-2 md:gap-3 text-dark font-black text-xs md:text-sm">
                 <div className="bg-gray-100 p-1 md:p-1.5 rounded-lg flex items-center justify-center w-6 h-6 md:w-8 md:h-8">
                    <span className="text-base md:text-lg">₹</span>
                 </div>
                 <span>{restaurant.costForTwo}</span>
               </div>
            </div>
        </div>

        {/* Menu Search */}
        <div className="text-center mb-10">
           <p className="text-[10px] font-black tracking-[0.2em] text-gray-400 mb-6 uppercase">Explorable Menu</p>
           <div className="relative group max-w-md mx-auto">
             <input 
               type="text" 
               placeholder="Search for your favorites..." 
               className="w-full bg-white border border-gray-200 rounded-2xl py-3 md:py-4 px-10 md:px-12 text-xs md:text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all shadow-sm group-hover:shadow-md"
             />
             <Search className="absolute left-3.5 md:left-4 top-3 md:top-4 text-gray-400 w-4 h-4 md:w-5 md:h-5 group-hover:text-primary transition-colors" />
           </div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-6">
          {categories.map((category) => {
            const itemsInCategory = menuItems.filter(item => item.category === category);
            return (
              <div key={category} className="bg-white rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex justify-between items-center cursor-pointer mb-4 border-b border-gray-50 pb-4">
                  <h3 className="font-black text-lg md:text-xl text-dark tracking-tight">{category} <span className="text-gray-300 ml-1">{itemsInCategory.length}</span></h3>
                </div>
                <div className="divide-y divide-gray-50">
                   {itemsInCategory.map(item => (
                     <MenuItem key={item.id} item={item} />
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;