
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ShoppingBag, Search, Star, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Supermarket: React.FC = () => {
  const categories = [
    { name: 'Fruits & Veggies', image: 'https://picsum.photos/seed/fruits/400/300' },
    { name: 'Dairy & Eggs', image: 'https://picsum.photos/seed/dairy/400/300' },
    { name: 'Snacks & Drinks', image: 'https://picsum.photos/seed/snacks/400/300' },
    { name: 'Household', image: 'https://picsum.photos/seed/household/400/300' },
    { name: 'Personal Care', image: 'https://picsum.photos/seed/care/400/300' },
    { name: 'Pet Supplies', image: 'https://picsum.photos/seed/pet/400/300' },
  ];

  const stores = [
    { id: 1, name: 'Feasti Mart Express', rating: 4.6, time: '15-20 mins', distance: '1.2 km', image: 'https://picsum.photos/seed/mart1/800/600' },
    { id: 2, name: 'Reliance Fresh', rating: 4.4, time: '25-35 mins', distance: '3.5 km', image: 'https://picsum.photos/seed/mart2/800/600' },
    { id: 3, name: 'Big Bazaar', rating: 4.1, time: '40-50 mins', distance: '5.2 km', image: 'https://picsum.photos/seed/mart3/800/600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark">Feasti Mart</h1>
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
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-dark uppercase">Shop by Category</h2>
            <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <motion.div 
                key={cat.name}
                whileHover={{ y: -5 }}
                className="flex flex-col items-center group cursor-pointer"
              >
                <div className="w-full aspect-square rounded-full overflow-hidden mb-3 shadow-md group-hover:shadow-lg transition-shadow border-4 border-white">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                </div>
                <span className="text-xs font-bold text-dark text-center group-hover:text-primary transition-colors">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mart Stores */}
        <div>
          <h2 className="text-2xl font-bold text-dark mb-6 uppercase">Mart Stores Near You</h2>
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
                  <div className="flex items-center gap-4 text-gray-500 text-sm mb-6">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{store.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{store.distance}</span>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#e66f0f] transition-colors shadow-md active:scale-95">
                    Shop Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supermarket;
