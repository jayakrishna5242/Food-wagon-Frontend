
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAddresses } from '../../context/AddressContext';
import { useLocationContext } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import { placeOrder, fetchOffers, getRestaurantsDB, calculateDistance, calculateDeliveryTime } from '../../services/api';
import { Minus, Plus, ArrowRight, MapPin, Plus as PlusIcon, CheckCircle2, Loader2, Banknote, CreditCard, Tag, Ticket, X, User, Clock, ChevronLeft, ShoppingBag, Home, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddressForm from '../../components/AddressForm';
import { Offer } from '../../types';

type PaymentMethod = 'COD' | 'ONLINE';

const Cart: React.FC = () => {
  const { items, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addresses, addAddress, selectedAddressId, setSelectedAddressId } = useAddresses();
  const { coordinates } = useLocationContext();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [deliveryTime, setDeliveryTime] = useState<string>('');

  const deliveryFee = 35;
  const platformFee = 5;
  const gst = Math.round(cartTotal * 0.05);
  
  useEffect(() => {
    if (items.length > 0) {
      const restaurantId = items[0].restaurantId;
      const restaurants = getRestaurantsDB();
      const restaurant = restaurants.find(r => r.id === restaurantId);
      
      if (restaurant && coordinates && restaurant.latitude && restaurant.longitude) {
        const distance = calculateDistance(
          coordinates.latitude,
          coordinates.longitude,
          restaurant.latitude,
          restaurant.longitude
        );
        setDeliveryTime(calculateDeliveryTime(distance));
      } else if (restaurant) {
        setDeliveryTime(restaurant.deliveryTime);
      } else {
        setDeliveryTime('30-40 mins');
      }
    }
  }, [items, coordinates]);
  
  const calculateDiscount = () => {
    if (!selectedOffer) return 0;
    if (cartTotal < selectedOffer.minOrderValue) return 0;
    
    if (selectedOffer.discountType === 'PERCENTAGE') {
      const discount = (cartTotal * selectedOffer.discountValue) / 100;
      // Cap discount if needed, but for mock we'll just use the value
      return Math.round(discount);
    } else {
      return selectedOffer.discountValue;
    }
  };

  const discountAmount = calculateDiscount();
  const finalTotal = cartTotal + deliveryFee + platformFee + gst - discountAmount;

  useEffect(() => {
    const loadOffers = async () => {
      setIsLoadingOffers(true);
      try {
        const restaurantId = items.length > 0 ? items[0].restaurantId : undefined;
        const data = await fetchOffers(restaurantId);
        setOffers(data);
      } catch (err) {
        console.error("Failed to fetch offers", err);
      } finally {
        setIsLoadingOffers(false);
      }
    };
    loadOffers();
  }, [items]);

  // Reset selected offer if cart total falls below min order value
  useEffect(() => {
    if (selectedOffer && cartTotal < selectedOffer.minOrderValue) {
      setSelectedOffer(null);
      showToast(`Offer ${selectedOffer.code} removed as cart total is below ₹${selectedOffer.minOrderValue}`, 'info');
    }
  }, [cartTotal, selectedOffer]);

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    const offer = offers.find(o => o.code.toUpperCase() === code);
    if (!offer) {
      setCouponError('Invalid coupon code');
      return;
    }

    if (cartTotal < offer.minOrderValue) {
      setCouponError(`Min order value for this coupon is ₹${offer.minOrderValue}`);
      return;
    }

    setSelectedOffer(offer);
    setCouponInput('');
    showToast(`Coupon ${offer.code} applied!`, 'success');
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!selectedAddressId) {
      showToast('Please select a delivery address first.', 'error');
      return;
    }
    
    setIsPlacingOrder(true);
    try {
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      const addressString = selectedAddress ? `${selectedAddress.flatNo}, ${selectedAddress.area}, ${selectedAddress.city}` : 'Guest Address';
      
      const firstItem = items[0];

      await placeOrder({
        items: [...items],
        totalAmount: finalTotal,
        deliveryAddress: addressString,
        restaurantName: firstItem.restaurantName || "Local Kitchen",
        restaurantId: firstItem.restaurantId,
        paymentMethod: paymentMethod,
        appliedOffer: selectedOffer?.code
      });
      
      showToast('Order placed successfully!', 'success');
      clearCart();
      
      setTimeout(() => {
        if (isAuthenticated) navigate('/profile');
        else navigate('/');
      }, 800);
    } catch (error: any) {
      showToast(error.message || 'Failed to place order. Please try again.', 'error');
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center bg-white p-4"
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="w-72 h-72 mb-8 relative"
        >
          <div className="absolute inset-0 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
          <img 
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0" 
            alt="Empty Cart" 
            className="w-full h-full object-contain relative z-10"
          />
        </motion.div>
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Your cart is empty</h2>
        <p className="text-gray-400 text-sm mt-3 mb-10 text-center max-w-xs font-medium leading-relaxed">
          Good food is always just a few clicks away. Explore our top restaurants!
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/" 
            className="bg-gray-900 text-white font-black py-4 px-10 rounded-2xl hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 uppercase text-xs tracking-widest block"
          >
            Start Ordering
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 md:relative md:border-none md:bg-transparent">
        <div className="container mx-auto px-4 max-w-5xl py-4 md:py-8 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors md:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 hidden md:flex">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight uppercase">Checkout</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Details */}
          <div className="flex-1 w-full space-y-6">
            {/* User Info */}
            <section className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 hidden md:block">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                    <User className="w-4 h-4" />
                  </div>
                  <h2 className="font-bold text-lg text-gray-900 uppercase tracking-tight">Account</h2>
                </div>
                {!isAuthenticated && (
                  <Link to="/login" className="text-xs font-bold text-orange-500 uppercase tracking-widest hover:underline">Sign In</Link>
                )}
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-md">
                      <span className="font-black text-lg">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">Ordering as guest</p>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                    Verified
                  </div>
                )}
              </div>
            </section>

            {/* Address Selection */}
            <section className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 w-full overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-black text-lg text-gray-900 uppercase tracking-tight">Delivery Address</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Where should we drop it?</p>
                  </div>
                </div>
                {!isAddressModalOpen && (
                  <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:text-orange-600 transition-all flex items-center gap-1.5 bg-orange-50 px-3 py-2 rounded-lg"
                  >
                    <PlusIcon className="w-3 h-3" />
                    Add New
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isAddressModalOpen ? (
                  <motion.div
                    key="address-form"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="bg-gray-50 rounded-3xl p-5 md:p-8 border border-gray-100 shadow-inner"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-black text-sm uppercase tracking-widest text-gray-900">New Address</h3>
                      <button onClick={() => setIsAddressModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <AddressForm 
                      onClose={() => setIsAddressModalOpen(false)} 
                      onSave={(newAddr) => {
                        addAddress(newAddr);
                        showToast(`Address saved.`, "success");
                        setIsAddressModalOpen(false);
                      }} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="address-list"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Mobile: Show selected address or "Select Address" if none */}
                    <div className="md:hidden">
                      {selectedAddressId ? (
                        <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-md">
                              <MapPin className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">Delivering to</p>
                              <p className="text-xs text-gray-500 font-bold truncate w-48">
                                {addresses.find(a => a.id === selectedAddressId)?.flatNo}, {addresses.find(a => a.id === selectedAddressId)?.area}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={() => {
                              // Scroll to address list or just show all
                              const el = document.getElementById('address-grid');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[10px] font-black text-orange-500 uppercase tracking-widest"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <div className="p-4 bg-red-50 rounded-2xl border border-red-100 text-center">
                          <p className="text-xs font-bold text-red-500 uppercase tracking-widest">Please select a delivery address</p>
                        </div>
                      )}
                    </div>

                    <div id="address-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {addresses.map((addr) => (
                        <motion.button 
                          key={addr.id}
                          whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`text-left p-5 rounded-2xl border-2 transition-all relative group w-full overflow-hidden ${
                            selectedAddressId === addr.id 
                              ? 'border-orange-500 bg-white shadow-lg shadow-orange-500/10' 
                              : 'border-gray-100 hover:border-gray-200 bg-white'
                          }`}
                        >
                          {selectedAddressId === addr.id && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500" />
                          )}
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              selectedAddressId === addr.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-gray-50 text-gray-400'
                            }`}>
                              {addr.type.toLowerCase() === 'home' ? <Home className="w-6 h-6" /> : 
                               addr.type.toLowerCase() === 'work' ? <Briefcase className="w-6 h-6" /> : 
                               <MapPin className="w-6 h-6" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">{addr.type}</p>
                                {selectedAddressId === addr.id && (
                                  <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Selected</span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 font-bold leading-relaxed line-clamp-2">
                                {addr.flatNo}, {addr.area}, {addr.city}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      ))}

                      {addresses.length === 0 && (
                        <button 
                          onClick={() => setIsAddressModalOpen(true)}
                          className="p-10 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all group bg-gray-50/30"
                        >
                          <div className="w-14 h-14 rounded-2xl bg-white border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-orange-500 group-hover:scale-110 transition-all shadow-sm">
                            <PlusIcon className="w-7 h-7" />
                          </div>
                          <div className="text-center">
                            <span className="text-xs font-black uppercase tracking-widest block mb-1">Add First Address</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Save your location for faster delivery</span>
                          </div>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Payment Method */}
            <section className={`bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 hidden md:block transition-opacity duration-300 ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-lg text-gray-900 uppercase tracking-tight">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'COD' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-xs uppercase tracking-widest mb-0.5">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pay when food arrives</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${
                    paymentMethod === 'ONLINE' ? 'border-orange-500 bg-orange-50/30' : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${paymentMethod === 'ONLINE' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-xs uppercase tracking-widest mb-0.5">Online Payment</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">UPI, Cards, Netbanking</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div id="bill-details" className="w-full lg:w-[400px] lg:sticky lg:top-8">
            <div className="bg-white rounded-[40px] p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
              {/* Decorative background element */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bill Details</h2>
                  <div className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </div>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="flex items-center gap-3 text-xs text-orange-600 bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-black uppercase tracking-widest text-[10px] mb-0.5">Estimated Arrival</p>
                      <p className="font-bold text-sm">{deliveryTime}</p>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-hide pr-1">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="flex items-center justify-between group"
                        >
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`mt-1 w-3 h-3 border-2 flex-shrink-0 flex items-center justify-center p-[1px] rounded-sm ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 leading-tight truncate">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-bold mt-0.5">₹{item.price} per unit</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 p-1 shadow-inner">
                              <button 
                                onClick={() => removeFromCart(item.id)} 
                                className="w-6 h-6 flex items-center justify-center hover:bg-white hover:text-orange-500 rounded-lg transition-all text-gray-400"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-[10px] font-black w-6 text-center text-gray-900">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="w-6 h-6 flex items-center justify-center hover:bg-white hover:text-orange-500 rounded-lg transition-all text-gray-400"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="text-xs font-black text-gray-900 w-12 text-right">₹{item.price * item.quantity}</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Coupons Section */}
                <div className="mb-8 p-5 bg-gray-50 rounded-[32px] border border-gray-100 hidden md:block">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Ticket className="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest block">Coupons</span>
                      <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Save more on your order</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Enter Code"
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-orange-500/10 transition-all outline-none placeholder:text-gray-300 shadow-sm"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                      className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-lg shadow-black/10 active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[9px] font-bold mt-2 uppercase tracking-widest ml-1">{couponError}</p>}
                  
                  {selectedOffer && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-green-500/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest">'{selectedOffer.code}' Applied!</p>
                          <p className="text-[8px] font-bold opacity-80 uppercase tracking-widest">You saved ₹{discountAmount}</p>
                        </div>
                      </div>
                      <button onClick={() => setSelectedOffer(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </motion.div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-6 border-t border-dashed border-gray-200 mb-8">
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Item Total</span>
                    <span className="text-gray-900 font-black">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Delivery Fee</span>
                    <span className="text-gray-900 font-black">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Taxes & Charges</span>
                    <span className="text-gray-900 font-black">₹{gst + platformFee}</span>
                  </div>
                  {selectedOffer && (
                    <div className="flex justify-between text-[11px] font-black text-green-600 uppercase tracking-widest">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t-2 border-gray-900">
                    <span className="font-black text-gray-900 text-sm uppercase tracking-tighter">To Pay</span>
                    <span className="font-black text-gray-900 text-2xl tracking-tighter">₹{finalTotal}</span>
                  </div>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="hidden md:flex w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-5 rounded-[24px] items-center justify-center gap-3 hover:shadow-2xl hover:shadow-orange-500/40 transition-all disabled:opacity-50 disabled:grayscale shadow-xl shadow-orange-500/20"
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="uppercase tracking-widest text-xs">Confirming...</span>
                    </>
                  ) : (
                    <>
                      <span className="uppercase tracking-widest text-xs">Place Order</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Mobile Sticky Checkout Bar */}
      <div className="md:hidden sticky bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-6 z-40 shadow-[0_-12px_32px_rgba(0,0,0,0.1)] rounded-t-[40px]">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Total Payable</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{finalTotal}</span>
              <button 
                onClick={() => {
                  const el = document.getElementById('bill-details');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[10px] font-bold text-orange-500 uppercase tracking-widest bg-orange-50 px-2 py-0.5 rounded ml-1"
              >
                View Details
              </button>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Delivery In</span>
            <span className="text-sm font-black text-gray-900 tracking-tight">{deliveryTime}</span>
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.96 }}
          onClick={handleCheckout}
          disabled={isPlacingOrder || !selectedAddressId}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:grayscale"
        >
          <span className="uppercase text-xs tracking-widest font-black">
            {isPlacingOrder ? 'Processing Order' : 'Place Order'}
          </span>
          {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
        </motion.button>
      </div>
    </div>
  );
};

export default Cart;
