
import React from 'react';
import { Star } from 'lucide-react';
import { MenuItem as MenuItemType } from '../types';
import { useCart } from '../context/CartContext';

interface MenuItemProps {
  item: MenuItemType;
}

const MenuItem: React.FC<MenuItemProps> = ({ item }) => {
  const { items, addToCart, removeFromCart } = useCart();
  const cartItem = items.find(i => i.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="flex justify-between items-start py-4 md:py-6 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-3 md:pr-4">
        <div className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[1.5px] mb-1 md:mb-1.5`}>
          <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
        </div>
        <h3 className="text-sm md:text-lg font-bold text-dark leading-tight">{item.name}</h3>
        {item.rating !== undefined && (
          <div className="flex items-center gap-1 text-yellow-600 text-[9px] md:text-xs font-black mt-0.5">
            <Star className="w-2 md:w-2.5 h-2 md:h-2.5 fill-yellow-600" />
            <span>{item.rating > 0 ? item.rating : '--'}</span>
            <span className="text-gray-300 font-medium ml-0.5">({item.ratingCount || 0})</span>
          </div>
        )}
        <p className="text-xs md:text-sm font-bold text-dark mt-0.5">₹{item.price}</p>
        <p className="text-[10px] md:text-xs text-gray-400 mt-1.5 md:mt-2 leading-relaxed line-clamp-2">{item.description}</p>
      </div>
      <div className="relative w-24 h-20 md:w-32 md:h-24 flex-shrink-0">
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          className={`w-full h-full object-cover rounded-lg transition-all duration-300 ${item.inStock === false ? 'grayscale opacity-60' : ''}`} 
          referrerPolicy="no-referrer"
        />
        {item.inStock === false && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg pointer-events-none">
            <div className="bg-white/95 text-dark px-1.5 py-0.5 rounded-md text-[9px] md:text-[10px] font-black uppercase tracking-tighter shadow-lg border border-gray-100">
              Sold Out
            </div>
          </div>
        )}
        <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 bg-white shadow-md rounded-lg border border-gray-200 w-16 md:w-20 overflow-hidden">
          {item.inStock === false ? (
            <button 
              disabled
              className="w-full py-1 md:py-1.5 text-gray-400 font-extrabold text-[9px] md:text-[10px] uppercase text-center bg-gray-50 cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : quantity === 0 ? (
            <button 
              onClick={() => addToCart(item)}
              className="w-full py-1 md:py-1.5 text-green-600 font-extrabold text-[10px] md:text-xs uppercase hover:bg-gray-50 transition-colors"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center justify-between px-1.5 md:px-2 py-1 md:py-1.5 text-green-600 font-extrabold text-[10px] md:text-xs">
              <button onClick={() => removeFromCart(item.id)} className="hover:scale-125 transition-transform">-</button>
              <span>{quantity}</span>
              <button onClick={() => addToCart(item)} className="hover:scale-125 transition-transform">+</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuItem;