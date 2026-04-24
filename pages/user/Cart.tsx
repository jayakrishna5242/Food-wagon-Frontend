
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useAddresses } from '../../context/AddressContext';
import { useLocationContext } from '../../context/LocationContext';
import { placeOrder, fetchOffers, fetchRestaurants, calculateDistance, calculateDeliveryTime } from '../../services/api';
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
    const calculateTime = async () => {
      if (items.length > 0) {
        const restaurantId = items[0].restaurantId;
        const restaurants = await fetchRestaurants();
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
    };
    calculateTime();
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
      console.log(`Offer ${selectedOffer.code} removed as cart total is below ₹${selectedOffer.minOrderValue}`);
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
    console.log(`Coupon ${offer.code} applied!`);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    if (!selectedAddressId) {
      console.error('Please select a delivery address first.');
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
      
      console.log('Order placed successfully!');
      clearCart();
      
      setTimeout(() => {
        if (isAuthenticated) navigate('/profile');
        else navigate('/');
      }, 800);
    } catch (error: any) {
      console.error(error.message || 'Failed to place order. Please try again.');
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
            className="bg-primary text-white font-black py-4 px-10 rounded-2xl hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 uppercase text-xs tracking-widest block"
          >
            Start Ordering
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 md:relative md:border-none">
        <div className="container mx-auto px-4 max-w-5xl py-6 md:py-12 flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 transition-colors md:hidden"
          >
            <ChevronLeft className="w-6 h-6 text-gray-900" />
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter uppercase">Checkout</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left Column: Details */}
          <div className="flex-1 w-full space-y-12">
            {/* User Info */}
            <section className="bg-white p-0 hidden md:block">
              <div className="flex items-center gap-3 mb-6 border-b border-primary pb-2">
                <h2 className="font-black text-sm text-primary uppercase tracking-widest">01. Account</h2>
              </div>
              
              <div className="flex items-center justify-between py-4 border-b border-gray-100">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center text-white">
                      <span className="font-black text-sm">{user.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-black text-xs text-gray-900 uppercase tracking-tight">{user.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ordering as guest</p>
                    <Link to="/login" className="text-[10px] font-black text-primary uppercase tracking-widest underline">Sign In</Link>
                  </div>
                )}
                {isAuthenticated && (
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">
                    [ Verified ]
                  </div>
                )}
              </div>
            </section>

            {/* Address Selection */}
            <section className="bg-white p-0 w-full overflow-hidden">
              <div className="flex items-center justify-between mb-6 border-b border-primary pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="font-black text-sm text-primary uppercase tracking-widest">02. Delivery Address</h2>
                </div>
                {!isAddressModalOpen && (
                  <button 
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline transition-all"
                  >
                    + Add New
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isAddressModalOpen ? (
                  <motion.div
                    key="address-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="bg-gray-50 p-6 border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-900">New Address</h3>
                      <button onClick={() => setIsAddressModalOpen(false)} className="text-[10px] font-black uppercase tracking-widest hover:underline">
                        Cancel
                      </button>
                    </div>
                    <AddressForm 
                      onClose={() => setIsAddressModalOpen(false)} 
                      onSave={(newAddr) => {
                        addAddress(newAddr);
                        console.log(`Address saved.`);
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
                    <div id="address-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {addresses.map((addr) => (
                        <button 
                          key={addr.id}
                          onClick={() => setSelectedAddressId(addr.id)}
                          className={`text-left p-6 border transition-all relative w-full ${
                            selectedAddressId === addr.id 
                              ? 'border-primary bg-orange-50/30' 
                              : 'border-gray-200 hover:border-primary/50 bg-white'
                          }`}
                        >
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">{addr.type}</p>
                              {selectedAddressId === addr.id && (
                                <span className="text-primary text-[8px] font-black uppercase tracking-widest underline">Selected</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-bold uppercase tracking-tight leading-relaxed">
                              {addr.flatNo}, {addr.area}, {addr.city}
                            </p>
                          </div>
                        </button>
                      ))}

                      {addresses.length === 0 && (
                        <button 
                          onClick={() => setIsAddressModalOpen(true)}
                          className="p-12 border border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-900 hover:border-gray-900 transition-all bg-gray-50/50"
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest block">Add Delivery Address</span>
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* Payment Method */}
            <section className={`bg-white p-0 hidden md:block transition-opacity duration-300 ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex items-center gap-3 mb-6 border-b border-primary pb-2">
                <h2 className="font-black text-sm text-primary uppercase tracking-widest">03. Payment</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col gap-2 p-6 border transition-all ${
                    paymentMethod === 'COD' ? 'border-primary bg-orange-50/30' : 'border-gray-200 hover:border-primary/50 bg-white'
                  }`}
                >
                  <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">Cash on Delivery</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Pay at your door</p>
                </button>

                <button 
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex flex-col gap-2 p-6 border transition-all ${
                    paymentMethod === 'ONLINE' ? 'border-primary bg-orange-50/30' : 'border-gray-200 hover:border-primary/50 bg-white'
                  }`}
                >
                  <p className="font-black text-gray-900 text-[10px] uppercase tracking-widest">Online Payment</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">UPI, Cards, Netbanking</p>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div id="bill-details" className="w-full lg:w-[380px] lg:sticky lg:top-12">
            <div className="bg-white p-0 relative">
              <div className="relative">
                <div className="flex items-center justify-between mb-8 border-b border-primary pb-2">
                  <h2 className="text-sm font-black text-primary uppercase tracking-widest">Order Summary</h2>
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </div>
                </div>
                
                <div className="space-y-8 mb-12">
                  <div className="flex items-center justify-between text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <span>Estimated Delivery</span>
                    <span className="text-gray-900">{deliveryTime}</span>
                  </div>

                  <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div 
                          key={item.id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 flex-shrink-0 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                              <p className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">{item.name}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-gray-900 transition-colors"><Minus className="w-3 h-3" /></button>
                                <span className="text-[10px] font-black text-gray-900 w-4 text-center">{item.quantity}</span>
                                <button onClick={() => addToCart(item)} className="text-gray-400 hover:text-gray-900 transition-colors"><Plus className="w-3 h-3" /></button>
                              </div>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">₹{item.price}</span>
                            </div>
                          </div>
                          <span className="text-[11px] font-black text-gray-900">₹{item.price * item.quantity}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Coupons Section - Desktop Only */}
                <div className="mb-12 hidden md:block">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Promo Code</span>
                  </div>
                  <div className="flex gap-0">
                    <input 
                      type="text" 
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="CODE"
                      className="flex-1 bg-white border border-primary border-r-0 px-4 py-3 text-[10px] font-black uppercase tracking-widest outline-none placeholder:text-gray-300"
                    />
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                      className="bg-primary text-white px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:bg-[#e66f0f] transition-all disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-[9px] font-bold mt-2 uppercase tracking-widest">{couponError}</p>}
                  
                  {selectedOffer && (
                    <div className="mt-4 flex items-center justify-between border border-primary p-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">'{selectedOffer.code}' Applied</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Saved ₹{discountAmount}</p>
                      </div>
                      <button onClick={() => setSelectedOffer(null)} className="text-gray-400 hover:text-primary"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-4 pt-8 border-t border-primary mb-12">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-gray-900 font-black">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Delivery</span>
                    <span className="text-gray-900 font-black">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <span>Taxes</span>
                    <span className="text-gray-900 font-black">₹{gst + platformFee}</span>
                  </div>
                  {selectedOffer && (
                    <div className="flex justify-between text-[10px] font-black text-primary uppercase tracking-widest">
                      <span>Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                    <span className="font-black text-gray-900 text-xs uppercase tracking-widest">Total</span>
                    <span className="font-black text-primary text-3xl tracking-tighter">₹{finalTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="hidden md:flex w-full bg-primary text-white font-black py-6 items-center justify-center gap-3 hover:bg-[#e66f0f] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {isPlacingOrder ? (
                    <span className="uppercase tracking-widest text-[10px]">Processing...</span>
                  ) : (
                    <span className="uppercase tracking-widest text-[10px]">Place Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    
      {/* Mobile Sticky Checkout Bar */}
      <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-primary p-6 z-40">
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Total</span>
            <span className="text-2xl font-black text-primary tracking-tighter">₹{finalTotal}</span>
          </div>
          <div className="text-right">
            <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Arrival</span>
            <p className="text-xs font-black text-gray-900 uppercase tracking-tight">{deliveryTime}</p>
          </div>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isPlacingOrder || !selectedAddressId}
          className="w-full bg-primary text-white font-black py-5 flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          <span className="uppercase text-[10px] tracking-widest font-black">
            {isPlacingOrder ? 'Processing' : 'Checkout'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default Cart;
