
import React from 'react';
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
    <div className="flex justify-between items-start py-6 md:py-10 border-b border-gray-100 last:border-0">
      <div className="flex-1 pr-4 md:pr-6">
        <div className={`w-3 h-3 md:w-4 md:h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px] mb-1 md:mb-2`}>
          <div className={`w-full h-full rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
        </div>
        <h3 className="text-base md:text-xl font-bold text-dark leading-tight">{item.name}</h3>
        <p className="text-sm font-bold text-dark mt-0.5 md:mt-1">₹{item.price}</p>
        <p className="text-xs md:text-sm text-gray-400 mt-2 md:mt-3 leading-relaxed line-clamp-2 md:line-clamp-none">{item.description}</p>
      </div>
      <div className="relative w-28 h-24 md:w-36 md:h-28 flex-shrink-0">
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-xl" />
        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border border-gray-200 w-20 md:w-24 overflow-hidden">
          {item.inStock === false ? (
            <div className="w-full py-1.5 md:py-2 text-gray-400 font-extrabold text-[8px] md:text-[10px] uppercase text-center bg-gray-50">
              Sold Out
            </div>
          ) : quantity === 0 ? (
            <button 
              onClick={() => addToCart(item)}
              className="w-full py-1.5 md:py-2 text-green-600 font-extrabold text-xs md:text-sm uppercase hover:bg-gray-50 transition-colors"
            >
              ADD
            </button>
          ) : (
            <div className="flex items-center justify-between px-2 md:px-3 py-1.5 md:py-2 text-green-600 font-extrabold text-xs md:text-sm">
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