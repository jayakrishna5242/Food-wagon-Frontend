
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, MapPin, Star, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fetchFreshStoreCategories, fetchFreshStores } from '../../services/api';
import { FreshStore, FreshStoreCategory } from '../../types';

const FreshStores: React.FC = () => {
  const { cartCount } = useCart();
  const [categories, setCategories] = useState<FreshStoreCategory[]>([]);
  const [stores, setStores] = useState<FreshStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      const cats = await fetchFreshStoreCategories();
      setCategories(cats);
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      setLoading(true);
      const storeData = await fetchFreshStores(selectedCategory);
      setStores(storeData);
      setLoading(false);
    };
    loadStores();
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-white relative z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark flex-grow">Fresh Stores</h1>
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

      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Category Selection */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-dark uppercase">What are you looking for?</h2>
            {selectedCategory && (
              <button 
                onClick={() => setSelectedCategory(null)}
                className="text-primary font-bold text-sm hover:underline"
              >
                Clear Filter
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <motion.div 
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-md border-4 transition-all ${selectedCategory === cat.name ? 'border-primary' : 'border-transparent'}`}
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-lg">{cat.name}</span>
                </div>
                {selectedCategory === cat.name && (
                  <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Stores List */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <h2 className="text-2xl font-bold text-dark uppercase">
                  {selectedCategory ? `${selectedCategory} Stores` : 'Stores Near You'}
                </h2>
                {selectedCategory && (
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                    {stores.length} Results
                  </span>
                )}
              </div>
              {stores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {stores.map((store) => (
                    <motion.div 
                      key={store.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow group"
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img src={store.image} alt={store.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-bold">{store.rating}</span>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">{store.name}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-gray-500 text-sm mb-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{store.time}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{store.distance}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                          {store.items.map(item => (
                            <span key={item} className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                              {item}
                            </span>
                          ))}
                        </div>
                        <Link to={`/restaurant/${store.id}`} className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#e66f0f] transition-colors shadow-md active:scale-95 text-center block">
                          View Store
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-10 h-10 text-gray-300" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">No stores nearby</h3>
                  <p className="text-gray-500">We couldn't find any fresh stores in your area yet. Check back soon!</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FreshStores;
