
import React from 'react';
import { Utensils, Store, ShoppingBag, Bike, ArrowRight, Heart, ChefHat } from 'lucide-react';
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
      link: '/restaurants',
      gradient: 'from-orange-500 to-red-600',
      actionText: 'ORDER NOW'
    },
    {
      id: 'stores',
      title: 'Stores',
      subtitle: 'CLEAN & FRESH',
      icon: Store,
      link: '/fresh-stores',
      gradient: 'from-emerald-500 to-teal-600',
      actionText: 'SHOP NOW'
    },
    {
      id: 'mart',
      title: 'Mart',
      subtitle: 'GROCERY DELIVERY',
      icon: ShoppingBag,
      link: '/supermarket',
      gradient: 'from-blue-500 to-indigo-600',
      actionText: 'ORDER NOW'
    },
    {
      id: 'genie',
      title: 'Genie',
      subtitle: 'SEND & RECEIVE',
      icon: Bike,
      link: '/delivery-service',
      gradient: 'from-pink-500 to-rose-600',
      actionText: 'BOOK NOW'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="bg-[#171a29] text-white py-12 md:py-20 px-4">
        <div className="container mx-auto max-w-7xl text-center md:text-left">
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-6xl font-bold mb-4 tracking-tight uppercase"
           >
             Build Your Food Network
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto md:mx-0 font-medium"
           >
              {city === 'Select Location' ? (
                "Select a location to explore"
              ) : (
                <>
                  Currently exploring <span className="text-white font-bold border-b-2 border-primary">{city}</span>. 
                  Discover local favorites delivered to your doorstep.
                </>
              )}
           </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-16">
        {/* Category Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link key={category.id} to={category.link} className="group">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`relative overflow-hidden p-6 md:p-8 h-44 md:h-60 flex flex-col justify-between shadow-xl bg-gradient-to-br ${category.gradient} text-white transition-all`}
              >
                <div className="z-10">
                  <div className="flex flex-col">
                    <h3 className="text-2xl md:text-4xl font-bold tracking-tight uppercase leading-none">{category.title}</h3>
                    <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest opacity-80 mt-1">{category.subtitle}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 z-10">
                  <span className="text-xs md:text-sm font-bold border-b-2 border-white/40 group-hover:border-white transition-all tracking-widest uppercase">{category.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-30 transition-opacity">
                   <category.icon className="w-24 h-24 md:w-[160px] md:h-[160px]" strokeWidth={1.5} />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Promotional Banner */}
      </div>

      {/* New Image */}
      <div className="w-full">
        <img 
          src="https://res.cloudinary.com/dlbyx3pta/image/upload/v1774626995/1774626954957_lcvvoy.png" 
          alt="New Banner" 
          className="w-full shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Made for you / Crafted by us */}
      <div className="container mx-auto px-4 max-w-7xl py-12 md:py-16 flex justify-center gap-12">
        <div className="flex flex-col items-center gap-2">
          <Heart className="w-10 h-10 text-primary" />
          <span className="font-bold text-lg">Made for you</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <ChefHat className="w-10 h-10 text-primary" />
          <span className="font-bold text-lg">Crafted by us</span>
        </div>
      </div>

      {/* New Image at Bottom */}
      <div className="w-full">
        <img 
          src="https://res.cloudinary.com/dlbyx3pta/image/upload/v1774625971/1774625440295_lpnkje.png" 
          alt="Attractive Banner" 
          className="w-full shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};

export default Home;
