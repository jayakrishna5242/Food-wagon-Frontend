
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { placeOrder, fetchOffers } from '../services/api';
import { Minus, Plus, ArrowRight, MapPin, Plus as PlusIcon, CheckCircle2, Loader2, Banknote, CreditCard, Tag, Ticket, X } from 'lucide-react';
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
        const data = await fetchOffers();
        setOffers(data);
      } catch (err) {
        console.error("Failed to fetch offers", err);
      } finally {
        setIsLoadingOffers(false);
      }
    };
    loadOffers();
  }, []);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="w-64 h-64 mb-6 relative">
          <img 
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/2xempty_cart_yfxml0" 
            alt="Empty Cart" 
            className="w-full h-full object-contain opacity-80"
          />
        </div>
        <h2 className="text-xl font-bold text-dark">Your cart is empty</h2>
        <p className="text-graytext text-sm mt-2 mb-8 text-center max-w-xs">Explore restaurants near you to add some delicious food!</p>
        <Link 
          to="/" 
          className="bg-primary text-white font-bold py-3 px-6 rounded-md hover:shadow-lg hover:scale-105 transition-all duration-200 uppercase text-sm tracking-wide"
        >
          See Restaurants
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e9ecee] py-4 md:py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          
          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="bg-white p-6 md:p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden">
               <div className="absolute left-0 top-6 bottom-6 w-1 bg-black"></div>
               {isAuthenticated && user ? (
                 <div className="ml-4">
                   <h3 className="font-bold text-lg text-dark mb-1">Logged in as {user.name}</h3>
                   <div className="flex items-center gap-2">
                      <span className="text-graytext text-xs uppercase font-black tracking-widest">{user.role || 'Customer'}</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span className="text-graytext text-sm">{user.email}</span>
                   </div>
                 </div>
               ) : (
                 <div className="ml-4">
                   <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-lg text-dark">Checkout as Guest</h3>
                    <Link to="/login" className="text-primary text-xs font-bold hover:underline uppercase">Login for rewards</Link>
                   </div>
                   <p className="text-graytext text-sm">You are ordering as a guest. Your order history will not be saved.</p>
                 </div>
               )}
            </div>
            
            <div className="bg-white p-6 md:p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden">
              <div className={`absolute left-0 top-6 bottom-6 w-1 ${selectedAddressId ? 'bg-black' : 'bg-gray-200'}`}></div>
              <div className="ml-4">
                <h3 className="font-bold text-lg text-dark mb-4 flex items-center gap-2">
                  Select Delivery Address
                  {selectedAddressId && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                   {addresses.map((addr) => (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`border-2 p-4 rounded-md cursor-pointer transition-all relative group ${
                          selectedAddressId === addr.id ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                         <div className="flex items-start gap-3">
                            <MapPin className={`w-5 h-5 mt-1 ${selectedAddressId === addr.id ? 'text-primary' : 'text-gray-400'}`} />
                            <div>
                               <p className="font-bold text-sm text-dark">{addr.type}</p>
                               <p className="text-xs text-graytext mt-1 leading-relaxed">
                                 {addr.flatNo}, {addr.area}, {addr.city}
                               </p>
                            </div>
                         </div>
                      </div>
                   ))}

                   <button 
                     onClick={() => setIsAddressModalOpen(true)}
                     className="border-2 border-dashed border-gray-200 p-4 rounded-md flex flex-col items-center justify-center gap-2 text-graytext hover:text-primary hover:border-primary transition-all group min-h-[100px]"
                   >
                      <PlusIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold uppercase">Add New Address</span>
                   </button>
                </div>
              </div>
            </div>

            {/* Offers Section - Visible only at checkout */}
            <div className="bg-white p-6 md:p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden">
               <div className={`absolute left-0 top-6 bottom-6 w-1 ${selectedOffer ? 'bg-primary' : 'bg-gray-200'}`}></div>
               <div className="ml-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-dark flex items-center gap-2">
                      Apply Coupons
                      <Tag className="w-5 h-5 text-primary" />
                    </h3>
                    {selectedOffer && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse">
                        ₹{discountAmount} Saved!
                      </span>
                    )}
                  </div>

                  {/* Coupon Input Field */}
                  <div className="mb-6">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input 
                          type="text" 
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Enter coupon code"
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg font-bold text-sm uppercase tracking-widest outline-none transition-all ${couponError ? 'border-red-500' : 'border-gray-100 focus:border-primary'}`}
                        />
                        {couponInput && (
                          <button 
                            onClick={() => setCouponInput('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={!couponInput.trim()}
                        className="bg-dark text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-[10px] font-bold mt-1 uppercase tracking-wide">{couponError}</p>}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Ticket className="w-4 h-4 text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Offers</span>
                  </div>
                  
                  {isLoadingOffers ? (
                    <div className="flex items-center gap-2 text-graytext">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm">Fetching best deals...</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {offers.length === 0 ? (
                        <p className="text-sm text-graytext italic">No offers available right now.</p>
                      ) : (
                        offers.map((offer) => {
                          const isEligible = cartTotal >= offer.minOrderValue;
                          const isSelected = selectedOffer?.id === offer.id;
                          
                          return (
                            <div 
                              key={offer.id}
                              onClick={() => isEligible && setSelectedOffer(isSelected ? null : offer)}
                              className={`border-2 p-3 md:p-4 rounded-xl transition-all relative group ${
                                isSelected 
                                  ? 'border-primary bg-orange-50 shadow-md' 
                                  : isEligible 
                                    ? 'border-gray-100 cursor-pointer hover:border-orange-200 hover:bg-gray-50' 
                                    : 'border-gray-50 opacity-60 grayscale cursor-not-allowed'
                              }`}
                            >
                               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0">
                                     <div className={`p-2 rounded-lg flex-shrink-0 ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <Ticket className="w-4 h-4 md:w-5 md:h-5" />
                                     </div>
                                     <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-black text-xs md:text-sm text-dark tracking-tight truncate">{offer.code}</p>
                                          {isSelected && (
                                            <div className="flex items-center gap-1 bg-primary text-white text-[7px] md:text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase whitespace-nowrap">
                                              <CheckCircle2 className="w-2 h-2" />
                                              Applied
                                            </div>
                                          )}
                                        </div>
                                        <p className="text-[10px] md:text-xs text-graytext mt-1 font-medium line-clamp-2">{offer.description}</p>
                                        {!isEligible && (
                                          <div className="mt-2 flex items-center gap-1.5">
                                            <div className="w-16 md:w-24 bg-gray-100 h-1 rounded-full overflow-hidden">
                                              <div 
                                                className="bg-primary h-full transition-all duration-500" 
                                                style={{ width: `${(cartTotal / offer.minOrderValue) * 100}%` }}
                                              ></div>
                                            </div>
                                            <p className="text-[8px] md:text-[9px] text-red-500 font-bold whitespace-nowrap uppercase">
                                              ₹{offer.minOrderValue - cartTotal} more
                                            </p>
                                          </div>
                                        )}
                                     </div>
                                  </div>
                                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2 border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
                                    <span className="text-[10px] md:text-xs font-black text-primary whitespace-nowrap">
                                      {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                                    </span>
                                    {isEligible && (
                                      <button 
                                        className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${
                                          isSelected 
                                            ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
                                            : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
                                        }`}
                                      >
                                        {isSelected ? 'Remove' : 'Apply'}
                                      </button>
                                    )}
                                  </div>
                               </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
               </div>
            </div>
            
            <div className={`bg-white p-6 md:p-8 shadow-sm rounded-none md:rounded-sm relative overflow-hidden ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
               <div className={`absolute left-0 top-6 bottom-6 w-1 ${selectedAddressId ? 'bg-black' : 'bg-gray-200'}`}></div>
               <div className="ml-4">
                  <h3 className="font-bold text-lg text-dark mb-4">Choose Payment Method</h3>
                  
                  <div className="space-y-3">
                     <label 
                        className={`flex items-center justify-between p-4 border-2 rounded-md cursor-pointer transition-all ${
                          paymentMethod === 'COD' ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('COD')}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 flex items-center justify-center rounded-full ${paymentMethod === 'COD' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <Banknote className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-dark">Cash on Delivery</p>
                              <p className="text-[10px] text-graytext uppercase tracking-wider font-bold">Pay on arrival</p>
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-primary' : 'border-gray-300'}`}>
                           {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </label>

                     <label 
                        className={`flex items-center justify-between p-4 border-2 rounded-md cursor-pointer transition-all ${
                          paymentMethod === 'ONLINE' ? 'border-primary bg-orange-50' : 'border-gray-100 hover:border-gray-200'
                        }`}
                        onClick={() => setPaymentMethod('ONLINE')}
                     >
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 flex items-center justify-center rounded-full ${paymentMethod === 'ONLINE' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                              <CreditCard className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="font-bold text-sm text-dark">Online Payment</p>
                              <p className="text-[10px] text-graytext uppercase tracking-wider">Pay securely</p>
                           </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-primary' : 'border-gray-300'}`}>
                           {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                     </label>
                  </div>
               </div>
            </div>
          </div>

          <div className="w-full md:w-[380px]">
             <div className="bg-white shadow-sm pt-6 pb-0 rounded-none md:rounded-sm relative sticky top-24">
                <div className="flex items-center gap-3 mb-6 px-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                     <img src="https://picsum.photos/id/163/100/100" className="w-full h-full object-cover" alt="restaurant" />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-dark text-base truncate relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-[2px] after:bg-black pb-1">Order Summary</h3>
                    <p className="text-xs text-graytext mt-1">{items.length} items selected</p>
                  </div>
                </div>

                <div className="space-y-0 max-h-[300px] overflow-y-auto px-6 no-scrollbar">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-4 group border-b border-gray-50 last:border-0">
                       <div className="flex items-start gap-3 w-3/5">
                         <div className={`mt-1.5 flex-shrink-0 w-3 h-3 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} flex items-center justify-center p-[2px]`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
                         </div>
                         <div className="flex flex-col">
                            <span className="text-sm text-dark font-medium">{item.name}</span>
                            <span className="text-xs text-graytext">₹{item.price}</span>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-200 bg-white shadow-sm rounded-[4px] h-8 w-[70px] justify-between overflow-hidden">
                             <button onClick={() => removeFromCart(item.id)} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-green-600 transition-all"><Minus className="w-3 h-3" /></button>
                             <span className="text-green-600 font-bold text-xs">{item.quantity}</span>
                             <button onClick={() => addToCart(item)} className="w-8 h-full flex items-center justify-center text-green-600 hover:bg-green-50 transition-all"><Plus className="w-3 h-3" /></button>
                          </div>
                          <span className="text-xs text-graytext w-12 text-right">₹{item.price * item.quantity}</span>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 space-y-3 bg-white border-t border-gray-100">
                  <div className="flex justify-between text-xs text-graytext"><span>Item Total</span><span>₹{cartTotal}</span></div>
                  <div className="flex justify-between text-xs text-graytext"><span>Delivery Fee</span><span>₹{deliveryFee}</span></div>
                  <div className="flex justify-between text-xs text-graytext"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                  <div className="flex justify-between text-xs text-graytext"><span>Taxes</span><span>₹{gst}</span></div>
                  
                  {selectedOffer && (
                    <div className="flex justify-between text-xs text-green-600 font-bold bg-green-50 p-2 rounded-md border border-green-100">
                      <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Offer Applied ({selectedOffer.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                     <span className="font-bold text-dark text-sm uppercase">Amount Payable</span>
                     <span className="font-bold text-dark text-lg">₹{finalTotal}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isPlacingOrder || !selectedAddressId}
                  className="w-full bg-primary text-white font-bold py-5 px-6 text-sm flex items-center justify-between hover:bg-[#e66f0f] transition-all disabled:opacity-80 active:scale-[0.98]"
                >
                  <div className="flex flex-col items-start leading-none">
                     <span className="text-[10px] opacity-80 uppercase tracking-widest mb-1">Final Amount</span>
                     <span className="text-xl">₹{finalTotal}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest font-black">
                      {isPlacingOrder ? 'Processing...' : (!selectedAddressId ? 'Choose Address' : 'Complete Order')}
                    </span>
                    {isPlacingOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </div>
                </button>
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
