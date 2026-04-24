
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, ChevronRight, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchFeastMartCategories, fetchFeastMartItems } from '../../services/api';
import MenuItem from '../../components/MenuItem';
import { useCart } from '../../context/CartContext';
import { MenuItem as MenuItemType } from '../../types';

const Supermarket: React.FC = () => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState<string[]>([]);
  const [items, setItems] = useState<MenuItemType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await fetchFeastMartCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const data = await fetchFeastMartItems(selectedCategory, searchQuery);
      setItems(data);
      setLoading(false);
    };
    loadItems();
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white relative z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark flex-grow">Feasti Mart</h1>
          <Link to="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ShoppingBag className="w-6 h-6 text-dark" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search for groceries, snacks, household items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-none py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-dark uppercase">Shop by Category</h2>
            <button onClick={() => setSelectedCategory(null)} className={`text-sm font-semibold flex items-center gap-1 transition-colors ${selectedCategory === null ? 'text-primary underline' : 'text-gray-500 hover:text-primary'}`}>
              View All Items <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <motion.button 
                key={cat}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${selectedCategory === cat ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-dark hover:border-primary'} shadow-sm hover:shadow-md`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-xl font-semibold text-dark mb-6 uppercase">{selectedCategory || 'All Items'}</h2>
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <MenuItem 
                  key={item.id} 
                  item={{
                    ...item,
                    id: item.id.toString(),
                    image: item.imageUrl,
                    restaurantName: 'Feasti Mart',
                    restaurantId: item.restaurantId.toString()
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Supermarket;
