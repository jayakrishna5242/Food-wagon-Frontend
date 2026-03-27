
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
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  return (
    <nav className="bg-white border-b border-gray-100 flex items-center w-full h-20">
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group mr-2 flex-shrink-0">
          <div className="bg-primary p-2 rounded-lg transform group-hover:rotate-12 transition-transform">
            <Utensils className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-dark tracking-tight hidden md:block">
            FoodWagon
          </span>
        </Link>

        {/* Location Selector (Dropdown) - Visible on Home page */}
        {location.pathname === '/' && (
          <div className="flex flex-1 items-center ml-2 md:ml-8" ref={dropdownRef}>
             <div className="relative w-full max-w-[200px] md:max-w-none">
               <div 
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 cursor-pointer group p-1 md:p-2 rounded-md hover:bg-gray-50 transition-colors overflow-hidden"
               >
                  {isLoading ? (
                    <div className="flex items-center gap-2 text-graytext">
                      <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-primary" />
                      <span className="text-[10px] md:text-xs">Detecting...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col overflow-hidden">
                      <div className="flex items-center gap-1 border-b-2 border-transparent group-hover:border-primary transition-all pb-0.5">
                        <span className="text-xs md:text-sm font-bold text-dark group-hover:text-primary transition-colors truncate">
                          {city}
                        </span>
                        <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-primary transition-transform duration-200 ${showCityDropdown ? 'rotate-180' : ''}`} />
                      </div>
                      <span className="text-[9px] md:text-[10px] text-graytext truncate max-w-[120px] md:max-w-[200px]">
                        {error ? <span className="text-red-500">{error}</span> : address}
                      </span>
                    </div>
                  )}
               </div>

                {/* Dropdown Menu */}
               {showCityDropdown && (
                 <div className="absolute top-full left-0 mt-2 w-64 md:w-72 bg-white shadow-xl rounded-lg border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button 
                       onClick={detectLocation}
                       className="w-full text-left px-5 py-4 hover:bg-gray-50 flex items-start gap-3 group/btn border-b border-gray-100"
                    >
                       <Crosshair className="w-5 h-5 text-primary mt-0.5" />
                       <div>
                          <p className="text-sm font-bold text-primary group-hover/btn:text-[#e66f0f]">Detect Current Location</p>
                          <p className="text-xs text-gray-400 font-normal mt-0.5">Using GPS</p>
                       </div>
                    </button>
                    
                    <div className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50/50">
                       Current Location
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto no-scrollbar">
                       <button
                          onClick={() => setShowCityDropdown(false)}
                          className="w-full text-left px-5 py-3 hover:bg-gray-50 text-sm font-medium flex items-center gap-3 transition-colors bg-orange-50 text-primary"
                       >
                          <MapPin className="w-4 h-4 text-primary" />
                          {city}
                       </button>
                    </div>
                 </div>
               )}
             </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="flex items-center gap-4 sm:gap-8 ml-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/search" className="hidden md:flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors">
              <Search className="w-5 h-5" />
              <span>Search</span>
            </Link>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/about" className="hidden md:flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors">
              <Info className="w-5 h-5" />
              <span>About</span>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/cart" className="hidden md:flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors relative">
              <div className={`relative transition-transform duration-300 ${animateCart ? 'scale-125' : 'scale-100'}`}>
                <ShoppingBag className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
          </motion.div>


          {user ? (
            <div className="flex items-center gap-4">
              {user.role === 'ADMIN' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/admin/dashboard" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline transition-all">
                    <Settings className="w-5 h-5" />
                    <span>Admin</span>
                  </Link>
                </motion.div>
              )}
              {user.role === 'PARTNER' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/partner/dashboard" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline transition-all">
                    <Store className="w-5 h-5" />
                    <span>Partner</span>
                  </Link>
                </motion.div>
              )}
              {user.role === 'DELIVERY' && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/delivery/dashboard" className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline transition-all">
                    <ShoppingBag className="w-5 h-5" />
                    <span>Delivery</span>
                  </Link>
                </motion.div>
              )}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/profile" className="hidden md:flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors">
                  <User className="w-5 h-5" />
                  <span className="font-bold">{user.name}</span>
                </Link>
              </motion.div>
            </div>
          ) : (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" className="hidden md:flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors">
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            </motion.div>
          )}

          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/join-us" className="flex items-center gap-2 text-dark hover:text-primary font-medium transition-colors">
              <Store className="w-5 h-5" />
              <span className="hidden sm:inline">Join Us</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Mobile Location Bar - Removed as it's now integrated in the main navbar */}
    </nav>
  );
};

export default Navbar;