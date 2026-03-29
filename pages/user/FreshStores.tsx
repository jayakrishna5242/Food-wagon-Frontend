
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Store, MapPin, Star, Clock, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const FreshStores: React.FC = () => {
  const { cartCount } = useCart();
  const categories = [
    { name: 'Chicken', image: 'https://picsum.photos/seed/chicken/400/300' },
    { name: 'Fish', image: 'https://picsum.photos/seed/fish/400/300' },
    { name: 'Mutton', image: 'https://picsum.photos/seed/mutton/400/300' },
    { name: 'Prawns', image: 'https://picsum.photos/seed/prawns/400/300' },
  ];

  const stores = [
    { id: 1, name: 'Fresh Meat Hub', rating: 4.5, time: '20-30 mins', distance: '2.5 km', items: ['Chicken', 'Mutton'], image: 'https://picsum.photos/seed/meatstore/800/600' },
    { id: 2, name: 'Ocean Catch', rating: 4.8, time: '30-45 mins', distance: '4.1 km', items: ['Fish', 'Prawns'], image: 'https://picsum.photos/seed/fishstore/800/600' },
    { id: 3, name: 'Daily Fresh Meats', rating: 4.2, time: '15-25 mins', distance: '1.2 km', items: ['Chicken', 'Eggs'], image: 'https://picsum.photos/seed/freshmeat/800/600' },
    { id: 4, name: 'Green Valley Farms', rating: 4.6, time: '25-35 mins', distance: '3.0 km', items: ['Organic Veggies', 'Fruits'], image: 'https://picsum.photos/seed/greenvalley/800/600' },
    { id: 5, name: 'The Dairy Barn', rating: 4.7, time: '10-20 mins', distance: '0.8 km', items: ['Milk', 'Cheese', 'Butter'], image: 'https://picsum.photos/seed/dairybarn/800/600' },
  ];

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
          <h2 className="text-2xl font-bold text-dark mb-8 uppercase">What are you looking for?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <motion.div 
                key={cat.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative h-40 rounded-2xl overflow-hidden cursor-pointer group shadow-md"
              >
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-lg">{cat.name}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stores List */}
        <div>
          <h2 className="text-2xl font-bold text-dark mb-8 uppercase">Stores Near You</h2>
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
        </div>
      </div>
    </div>
  );
};

export default FreshStores;
