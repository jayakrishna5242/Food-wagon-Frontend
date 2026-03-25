
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '/search' },
    { label: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartCount },
    { label: 'Account', icon: User, path: user ? '/profile' : '/login' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 z-[100] flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            <div className="relative">
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
