
import React from 'react';
import { Utensils, Store, ShoppingBag, Bike, ArrowRight } from 'lucide-react';
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
        <div className="mb-12 overflow-x-auto no-scrollbar">
          <div className="min-w-[300px] w-full">
            <input 
              type="text" 
              placeholder="Search for restaurants, stores, or items..." 
              className="w-full p-4 rounded-none border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link key={category.id} to={category.link} className="group">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="relative overflow-hidden p-8 h-64 flex flex-col justify-between shadow-2xl rounded-3xl transition-all"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={category.image} 
                    alt={category.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} mix-blend-multiply`} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                </div>

                <div className="z-10 relative">
                  <div className="flex flex-col">
                    <h3 className="text-4xl font-black tracking-tighter uppercase leading-none drop-shadow-md">{category.title}</h3>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90 mt-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded self-start">{category.subtitle}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between z-10 relative">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black border-b-2 border-white/40 group-hover:border-white transition-all tracking-widest uppercase">{category.actionText}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                    <category.icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
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
