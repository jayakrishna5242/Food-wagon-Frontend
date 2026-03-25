
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, User, Info } from 'lucide-react';
import { useCart } from '../context/CartContext';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { cartCount } = useCart();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
    { path: '/profile', icon: User, label: 'Account' },
  ];

  const hideOnPaths = ['/login', '/forgot-password', '/partner/login', '/partner/register', '/partner/dashboard'];
  if (hideOnPaths.includes(location.pathname)) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-white text-[8px] font-bold px-1 py-0.5 rounded-full min-w-[14px] text-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
