
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Utensils,
  Truck,
  ShoppingBag, 
  User, 
  LayoutDashboard, 
  ClipboardList, 
  Store, 
  Settings,
  BarChart3,
  Users,
  CheckCircle2,
  Bike,
  Clock,
  History
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { user } = useAuth();

  const isPartner = location.pathname.startsWith('/partner');
  const isAdmin = location.pathname.startsWith('/admin');
  const isDelivery = location.pathname.startsWith('/delivery');

  let navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Food', icon: Utensils, path: '/restaurants' },
    { label: 'Pickup', icon: Bike, path: '/delivery-service' },
    { label: 'Cart', icon: ShoppingBag, path: '/cart', badge: cartCount },
    { label: 'Account', icon: User, path: user ? (user.role === 'partner' ? '/partner/dashboard' : user.role === 'admin' ? '/admin/dashboard' : user.role === 'delivery' ? '/delivery/dashboard' : '/profile') : '/login' },
  ];

  if (isPartner) {
    navItems = [
      { label: 'Home', icon: Home, path: '/' },
      { label: 'Dash', icon: LayoutDashboard, path: '/partner/dashboard' },
      { label: 'Orders', icon: ClipboardList, path: '/partner/dashboard?tab=orders' },
      { label: 'Menu', icon: Store, path: '/partner/dashboard?tab=menu' },
      { label: 'Settings', icon: Settings, path: '/partner/dashboard?tab=settings' },
    ];
  } else if (isAdmin) {
    navItems = [
      { label: 'Home', icon: Home, path: '/' },
      { label: 'Overview', icon: BarChart3, path: '/admin/dashboard' },
      { label: 'Shops', icon: Store, path: '/admin/dashboard?tab=restaurants' },
      { label: 'Users', icon: Users, path: '/admin/dashboard?tab=users' },
      { label: 'Verify', icon: CheckCircle2, path: '/admin/dashboard?tab=verification' },
    ];
  } else if (isDelivery) {
    navItems = [
      { label: 'Home', icon: Home, path: '/' },
      { label: 'Pickups', icon: Truck, path: '/delivery/dashboard' },
      { label: 'Profile', icon: User, path: '/profile' },
    ];
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-[100] flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
        
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            <motion.div 
              whileTap={{ scale: 0.8 }}
              className="relative"
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </motion.div>
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
