
import React from 'react';
import { Utensils, Store, ShoppingBag, Bike, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocationContext } from '../../context/LocationContext';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  const { city } = useLocationContext();

  const categories = [
    {
      id: 'food',
      title: 'Food',
      subtitle: 'UP TO 20% OFF',
      icon: Utensils,
      image: 'https://picsum.photos/seed/food-delivery/800/800',
      link: '/restaurants',
      gradient: 'from-orange-600/90 to-red-700/90',
      actionText: 'ORDER NOW'
    },
    {
      id: 'stores',
      title: 'Stores',
      subtitle: 'CLEAN & FRESH',
      icon: Store,
      image: 'https://picsum.photos/seed/fresh-grocery/800/800',
      link: '/fresh-stores',
      gradient: 'from-emerald-600/90 to-teal-700/90',
      actionText: 'SHOP NOW'
    },
    {
      id: 'mart',
      title: 'Mart',
      subtitle: 'GROCERY DELIVERY',
      icon: ShoppingBag,
      image: 'https://picsum.photos/seed/mart-shopping/800/800',
      link: '/supermarket',
      gradient: 'from-blue-600/90 to-indigo-700/90',
      actionText: 'ORDER NOW'
    },
    {
      id: 'genie',
      title: 'Genie',
      subtitle: 'SEND & RECEIVE',
      icon: Bike,
      image: 'https://picsum.photos/seed/delivery-bike/800/800',
      link: '/delivery-service',
      gradient: 'from-pink-600/90 to-rose-700/90',
      actionText: 'BOOK NOW'
    }
  ];

  return (
    <div className="min-h-screen bg-white overflow-y-auto">
      <div className="container mx-auto px-4 max-w-7xl py-12">
        {/* Global Search Bar */}
        <div className="mb-16 max-w-2xl mx-auto">
          <div className="relative group">
            <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search for restaurants, stores, or items..." 
              className="w-full py-4 pl-8 pr-4 bg-transparent border-b border-gray-200 focus:border-primary focus:outline-none transition-all text-lg font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {categories.map((category, index) => (
            <Link key={category.id} to={category.link} className="group">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col gap-4"
              >
                <div className="aspect-square relative overflow-hidden rounded-[2rem] bg-gray-100 shadow-sm group-hover:shadow-xl transition-all duration-500">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                </div>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{category.title}</h3>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{category.subtitle}</p>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Promotional Banner */}
      </div>
      <div className="w-full">
        <img 
          src="https://res.cloudinary.com/dlbyx3pta/image/upload/v1774625971/1774625440295_lpnkje.png" 
          alt="Attractive Banner" 
          className="w-full"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default Home;