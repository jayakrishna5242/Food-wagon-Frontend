
import React from 'react';
import { MenuItem as MenuItemType } from '../types';
import { useCart } from '../context/CartContext';
import { motion } from 'motion/react';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { items, addToCart, removeFromCart } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="flex justify-between items-center py-6 border-b border-gray-50 last:border-0 group"
    >
      <div className="flex-1 pr-6">
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1.5px]`}>
            <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
          </div>
        </div>
        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
        <p className="text-sm font-bold text-gray-900 mb-2">₹{item.price}</p>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.description}</p>
      </div>
      
      <div className="relative w-32 h-28 flex-shrink-0">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className={`w-full h-full object-cover rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-105 ${item.inStock === false ? 'grayscale opacity-60' : ''}`} 
          referrerPolicy="no-referrer"
        />
        
        <motion.div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24">
          {item.inStock === false ? (
            <div className="bg-gray-100 text-gray-400 py-2 rounded-xl text-[10px] font-bold uppercase text-center shadow-sm border border-gray-200">
              Sold Out
            </div>
          ) : quantity === 0 ? (
            <motion.button 
              layoutId={`add-btn-${item.id}`}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => addToCart(item)}
              className="w-full bg-white text-primary py-2 rounded-xl text-xs font-bold uppercase shadow-md border border-gray-100 hover:bg-gray-50 transition-all"
            >
              Add
            </motion.button>
          ) : (
            <motion.div 
              layoutId={`add-btn-${item.id}`}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center justify-between px-2 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-md"
            >
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => removeFromCart(item.id)} className="w-6 h-6 flex items-center justify-center">-</motion.button>
              <span>{quantity}</span>
              <motion.button whileTap={{ scale: 0.8 }} onClick={() => addToCart(item)} className="w-6 h-6 flex items-center justify-center">+</motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MenuItem;
