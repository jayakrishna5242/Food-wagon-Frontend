
import React from 'react';
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
  Tag, 
  Settings,
  BarChart3,
  Users,
  CheckCircle2,
  Navigation,
  Clock
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
    { label: 'Pickups', icon: Truck, path: '/delivery-service' },
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
      { label: 'History', icon: Clock, path: '/delivery/dashboard?tab=history' },
      { label: 'Profile', icon: User, path: '/profile' },
    ];
  }

  return (
    <div className="hidden md:flex fixed left-0 top-20 bottom-0 w-20 bg-white border-r border-gray-100 flex-col items-center py-8 z-[100] gap-8 shadow-[4px_0_12px_rgba(0,0,0,0.02)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path.includes('?') && location.pathname + location.search === item.path);
        return (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`flex flex-col items-center gap-1.5 transition-all group ${isActive ? 'text-primary' : 'text-gray-400 hover:text-dark'}`}
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-3 rounded-2xl transition-colors ${isActive ? 'bg-primary/10' : 'group-hover:bg-gray-50'}`}
            >
              <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </motion.div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-primary' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNav;
