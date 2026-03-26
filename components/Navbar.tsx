
import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, User, Utensils, MapPin, Loader2, ChevronDown, Crosshair, Info, Store, Menu, X, Heart, CreditCard, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocationContext } from '../context/LocationContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const { city, address, setCity, setAddress, isLoading, setIsLoading, error, setError } = useLocationContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [animateCart, setAnimateCart] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availableCities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad"];

  const mobileMenuItems = [
    { label: 'Orders', path: '/profile?tab=orders', icon: ShoppingBag },
    { label: 'Favorites', path: '/profile?tab=favorites', icon: Heart },
    { label: 'Addresses', path: '/profile?tab=addresses', icon: MapPin },
    { label: 'Payments', path: '/profile?tab=payments', icon: CreditCard },
    { label: 'Settings', path: '/profile?tab=profile', icon: Settings },
  ];
  
  useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detectLocation = () => {
    setShowCityDropdown(false);
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Use OpenStreetMap Nominatim API for reverse geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          
          if (!response.ok) {
            throw new Error('Geocoding service unavailable');
          }

          const data = await response.json();
          const addr = data.address;
          
          // Logic to extract city name reliably
          const detectedCity = addr.city || addr.town || addr.village || addr.state_district || 'Bangalore';
          const area = addr.suburb || addr.neighbourhood || addr.road || '';
          
          // Format: "Indiranagar, Bangalore" or just "Bangalore"
          const displayDetails = area ? `${area}, ${detectedCity}` : detectedCity;

          setCity(detectedCity);
          setAddress(displayDetails);
          setIsLoading(false);
        } catch (error) {
          console.error("Reverse geocoding failed:", error);
          // Fallback
          setCity('Current Location');
          setAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Error detecting location:", error.message);
        let errorMsg = 'Location detection failed';
        switch (error.code) {
          case 1: errorMsg = 'Permission denied'; break;
          case 2: errorMsg = 'Position unavailable'; break;
          case 3: errorMsg = 'Request timed out'; break;
          default: errorMsg = error.message || 'Unknown error';
        }
        setIsLoading(false);
        setError(errorMsg);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleManualCitySelect = (cityName: string) => {
    setCity(cityName);
    setAddress(`${cityName}, India`);
    setShowCityDropdown(false);
    setError(null);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 flex items-center">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between gap-4">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="bg-orange-500 p-1.5 rounded-xl transform group-hover:rotate-12 transition-transform duration-300">
            <Utensils className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">FoodWagon</span>
        </Link>

        {/* Location Selector - Minimal Version */}
        <div className="flex-1 flex items-center max-w-md" ref={dropdownRef}>
          <button 
            onClick={() => setShowCityDropdown(!showCityDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-all group overflow-hidden border border-transparent hover:border-gray-200"
          >
            <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <div className="flex flex-col items-start overflow-hidden">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-gray-900 truncate">
                  {isLoading ? 'Detecting...' : city}
                </span>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform duration-300 ${showCityDropdown ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showCityDropdown && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 mt-2 w-72 bg-white shadow-2xl rounded-2xl border border-gray-100 py-3 z-50 overflow-hidden"
              >
                <button 
                  onClick={detectLocation}
                  className="w-full text-left px-4 py-3 hover:bg-orange-50 flex items-center gap-3 group/btn transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover/btn:bg-orange-500 group-hover/btn:text-white transition-colors">
                    <Crosshair className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Current Location</p>
                    <p className="text-[10px] text-gray-500">Using GPS</p>
                  </div>
                </button>
                
                <div className="px-4 py-2 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Popular Cities
                </div>
                
                <div className="max-h-60 overflow-y-auto scrollbar-hide">
                  {availableCities.map(c => (
                    <button
                      key={c}
                      onClick={() => handleManualCitySelect(c)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm font-medium flex items-center gap-3 transition-colors ${city === c ? 'text-orange-500' : 'text-gray-700'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${city === c ? 'bg-orange-500' : 'bg-transparent'}`} />
                      {c}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav Links - Minimal */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/search" className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all">
            <Search className="w-5 h-5" />
          </Link>
          
          <Link to="/cart" className="p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-all relative">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to="/profile" className="flex items-center gap-2 pl-2 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 overflow-hidden border border-gray-200">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-bold text-gray-900 hidden lg:block">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-full hover:bg-gray-800 transition-all active:scale-95">
              Sign In
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="sm:hidden p-2 text-gray-600 hover:bg-gray-50 rounded-full"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileMenu(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-64 bg-white z-50 shadow-2xl p-6 flex flex-col gap-6"
            >
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Menu</span>
                <button onClick={() => setShowMobileMenu(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {mobileMenuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 p-3 hover:bg-orange-50 rounded-xl transition-colors group"
                  >
                    <item.icon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                    <span className="font-bold text-gray-700 group-hover:text-gray-900">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-gray-100">
                <Link to="/join-us" className="flex items-center gap-3 p-3 text-orange-500 font-bold">
                  <Store className="w-5 h-5" />
                  Join as Partner
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;