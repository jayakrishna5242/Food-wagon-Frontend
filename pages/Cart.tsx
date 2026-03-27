
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { placeOrder, fetchOffers } from '../services/api';
import { Minus, Plus, ArrowRight, MapPin, Plus as PlusIcon, CheckCircle2, Loader2, Banknote, CreditCard, Tag, Ticket, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AddressForm from '../components/AddressForm';
import { Offer } from '../types';

type PaymentMethod = 'COD' | 'ONLINE';

const Cart: React.FC = () => {
  const { items, cartTotal, addToCart, removeFromCart, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addresses, addAddress, selectedAddressId, setSelectedAddressId } = useAddresses();
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

  const deliveryFee = 35;
  const platformFee = 5;
  const gst = Math.round(cartTotal * 0.05);
  
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
          className="w-64 h-64 mb-6 relative"
        >
          <img 
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0" 
            alt="Empty Cart" 
            className="w-full h-full object-contain opacity-80"
          />
        </motion.div>
        <h2 className="text-xl font-bold text-dark">Your cart is empty</h2>
        <p className="text-graytext text-sm mt-2 mb-8 text-center max-w-xs">Explore restaurants near you to add some delicious food!</p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Link 
            to="/" 
            className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:shadow-lg transition-all duration-200 uppercase text-sm tracking-wide block"
          >
            See Restaurants
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-40 md:py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 tracking-tight">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column: Details */}
          <div className="flex-1 space-y-12">
            {/* User Info */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-bold text-lg text-gray-900">Account</h2>
                <div className="h-px bg-gray-100 flex-1" />
              </div>
              
              <div className="bg-gray-50 rounded-3xl p-6 flex items-center justify-between">
                {isAuthenticated && user ? (
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <p className="text-sm text-gray-500">Ordering as guest</p>
                    <Link to="/login" className="text-sm font-bold text-orange-500 hover:underline">Sign in for rewards</Link>
                  </div>
                )}
              </div>
            </section>

            {/* Address Selection */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-bold text-lg text-gray-900">Delivery Address</h2>
                <div className="h-px bg-gray-100 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <button 
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`text-left p-5 rounded-3xl border-2 transition-all relative group ${
                      selectedAddressId === addr.id 
                        ? 'border-orange-500 bg-orange-50/50' 
                        : 'border-gray-100 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MapPin className={`w-5 h-5 mt-0.5 ${selectedAddressId === addr.id ? 'text-orange-500' : 'text-gray-400'}`} />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{addr.type}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed line-clamp-2">
                          {addr.flatNo}, {addr.area}, {addr.city}
                        </p>
                      </div>
                    </div>
                    {selectedAddressId === addr.id && (
                      <div className="absolute top-4 right-4 text-orange-500">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </button>
                ))}

                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="p-5 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-orange-500 hover:border-orange-500 transition-all group min-h-[110px]"
                >
                  <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold uppercase tracking-wider">Add New</span>
                </button>
              </div>
            </section>

            {/* Payment Method */}
            <section className={!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="font-bold text-lg text-gray-900">Payment</h2>
                <div className="h-px bg-gray-100 flex-1" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${
                    paymentMethod === 'COD' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">Cash on Delivery</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pay on arrival</p>
                  </div>
                </button>

                <button 
                  onClick={() => setPaymentMethod('ONLINE')}
                  className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all ${
                    paymentMethod === 'ONLINE' ? 'border-orange-500 bg-orange-50/50' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900 text-sm">Online Payment</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Secure checkout</p>
                  </div>
                </button>
              </div>
            </section>
          </div>

          {/* Right Column: Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-gray-50 rounded-[40px] p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-8">Order Summary</h2>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto scrollbar-hide pr-2">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`mt-1.5 w-3 h-3 border flex-shrink-0 flex items-center justify-center p-[2px] ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 leading-tight">{item.name}</p>
                          <p className="text-xs text-gray-500 mt-1">₹{item.price} × {item.quantity}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white rounded-full border border-gray-200 p-1 shadow-sm">
                          <button onClick={() => removeFromCart(item.id)} className="p-1 hover:text-orange-500 transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                          <button onClick={() => addToCart(item)} className="p-1 hover:text-orange-500 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-16 text-right">₹{item.price * item.quantity}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Coupons */}
              <div className="mb-8">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Coupon code"
                    className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-wider focus:ring-2 focus:ring-orange-500/20 transition-all outline-none"
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={!couponInput.trim()}
                    className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase tracking-wide">{couponError}</p>}
                
                {selectedOffer && (
                  <div className="mt-4 bg-green-50 border border-green-100 rounded-2xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-bold text-green-700 uppercase tracking-wider">{selectedOffer.code} Applied</span>
                    </div>
                    <button onClick={() => setSelectedOffer(null)} className="text-green-700 hover:text-red-500"><X className="w-4 h-4" /></button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pt-6 border-t border-gray-200 mb-8">
                <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{cartTotal}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>Delivery & Fees</span><span>₹{deliveryFee + platformFee}</span></div>
                <div className="flex justify-between text-sm text-gray-500"><span>GST</span><span>₹{gst}</span></div>
                {selectedOffer && (
                  <div className="flex justify-between text-sm text-green-600 font-bold"><span>Discount</span><span>-₹{discountAmount}</span></div>
                )}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-bold text-gray-900 text-2xl">₹{finalTotal}</span>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={isPlacingOrder || !selectedAddressId}
                className="w-full bg-orange-500 text-white font-bold py-5 rounded-3xl flex items-center justify-center gap-3 hover:bg-orange-600 transition-all disabled:opacity-50 shadow-xl shadow-orange-500/20"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="uppercase tracking-widest text-sm">Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">Place Order</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <AddressForm 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSave={(newAddr) => {
          addAddress(newAddr);
          showToast(`Address saved.`, "success");
          setIsAddressModalOpen(false);
        }} 
      />

      {/* Mobile Sticky Checkout Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4 z-40 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col">
          <span className="text-[10px] text-graytext font-bold uppercase tracking-widest">Total Payable</span>
          <span className="text-xl font-black text-dark">₹{finalTotal}</span>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isPlacingOrder || !selectedAddressId}
          className="bg-primary text-white font-black px-8 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
        >
          <span className="uppercase text-xs tracking-widest">
            {isPlacingOrder ? 'Processing' : 'Checkout'}
          </span>
          {isPlacingOrder ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

export default Cart;
