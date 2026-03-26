
import React from 'react';
import { Star, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface FoodCardProps {
  item: MenuItem;
}

const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col h-full"
    >
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-[10px] font-bold text-gray-800">4.5</span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-1">{item.name}</h3>
        </div>
        <p className="text-gray-500 text-xs line-clamp-2 mb-3 flex-grow">{item.description}</p>
        
        <div className="flex justify-between items-center mt-auto pt-2">
          <span className="font-bold text-gray-900 text-base">₹{item.price}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => addToCart(item)}
            className="bg-primary text-white p-2 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center justify-center"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;
