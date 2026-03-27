import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, Send, Utensils, MapPin, Clock, CheckCircle2, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchOrders, rateOrder } from '../services/api';
import { Order } from '../types';

const OrderRating: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [restaurantRating, setRestaurantRating] = useState<number>(0);
  const [riderRating, setRiderRating] = useState<number>(0);
  const [itemRatings, setItemRatings] = useState<Record<number, number>>({});
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrder = async () => {
      try {
        const orders = await fetchOrders();
        const foundOrder = orders.find(o => o.id === Number(orderId));
        if (foundOrder) {
          setOrder(foundOrder);
          if (foundOrder.rating) setRestaurantRating(foundOrder.rating);
          // Initialize item ratings
          const initialItemRatings: Record<number, number> = {};
          foundOrder.items.forEach(item => {
            initialItemRatings[item.id] = 0;
          });
          setItemRatings(initialItemRatings);
        } else {
          showToast('Order not found', 'error');
          navigate('/profile?tab=orders');
        }
      } catch (error) {
        showToast('Failed to load order details', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [orderId, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (restaurantRating === 0) {
      showToast('Please rate the restaurant', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // We'll pass the restaurant rating as the main rating, and rider rating separately
      await rateOrder(Number(orderId), restaurantRating, review, riderRating, itemRatings);
      showToast('Thank you for your feedback!', 'success');
      navigate('/profile?tab=orders');
    } catch (error) {
      showToast('Failed to submit rating', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    size = "w-12 h-12" 
  }: { 
    value: number, 
    onChange: (val: number) => void, 
    label: string,
    size?: string
  }) => {
    const [hover, setHover] = useState(0);
    return (
      <div className="text-center space-y-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{label}</p>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              type="button"
              whileHover={{ scale: 1.25 }}
              whileTap={{ scale: 0.9 }}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => onChange(star)}
              className="transition-all duration-200"
            >
              <Star 
                className={`${size} ${
                  (hover || value) >= star 
                    ? 'fill-yellow-400 text-yellow-400' 
                    : 'text-gray-100'
                }`} 
              />
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-50">
        <div className="container mx-auto px-4 max-w-2xl h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:bg-gray-50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-dark" />
          </button>
          <h1 className="text-sm font-black text-dark uppercase tracking-[0.2em]">Rate Your Order</h1>
          <div className="w-10"></div> {/* Spacer */}
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-2xl mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
        >
          {/* Restaurant Summary */}
          <div className="p-8 bg-gray-900 text-white flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl flex-shrink-0">
              <img 
                src={order.restaurantImageUrl || (order.items && order.items[0]?.imageUrl)} 
                alt={order.restaurantName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{order.restaurantName}</h2>
              <div className="flex items-center gap-3 mt-2 opacity-70 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.date).toLocaleDateString()}</span>
                <span className="w-1 h-1 bg-white/30 rounded-full"></span>
                <span>Order #{order.id}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-12">
            {/* Restaurant Rating */}
            <StarRating 
              value={restaurantRating} 
              onChange={setRestaurantRating} 
              label="Rate the Restaurant" 
            />

            {/* Rider Rating */}
            {order.deliveryBoyId && (
              <div className="pt-8 border-t border-gray-100">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bike className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-black text-dark uppercase tracking-widest text-xs">Delivery Partner</h4>
                    <p className="text-sm font-bold text-gray-500">{order.deliveryBoyName || 'Assigned Rider'}</p>
                  </div>
                </div>
                <StarRating 
                  value={riderRating} 
                  onChange={setRiderRating} 
                  label="Rate the Delivery Experience" 
                  size="w-10 h-10"
                />
              </div>
            )}

            {/* Item Ratings */}
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Rate the Items</h3>
              <div className="space-y-8">
                {order.items.map((item) => (
                  <div key={item.id} className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-dark">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">₹{item.price}</p>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setItemRatings(prev => ({ ...prev, [item.id]: star }))}
                            className="transition-all duration-200"
                          >
                            <Star 
                              className={`w-5 h-5 ${
                                (itemRatings[item.id] || 0) >= star 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'text-gray-100'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div className="space-y-3 pt-8 border-t border-gray-100">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Add a comment (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us what you liked or what we can improve..."
                className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-primary transition-colors resize-none text-sm font-medium"
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              whileHover={!(isSubmitting || restaurantRating === 0) ? { scale: 1.02, y: -4 } : {}}
              whileTap={!(isSubmitting || restaurantRating === 0) ? { scale: 0.98 } : {}}
              disabled={isSubmitting || restaurantRating === 0}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all flex items-center justify-center gap-3 ${
                isSubmitting || restaurantRating === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-primary text-white hover:bg-[#e26e10]'
              }`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Submit All Reviews <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
        </motion.div>

        {/* Success Message Placeholder */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Your feedback helps us improve</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderRating;
