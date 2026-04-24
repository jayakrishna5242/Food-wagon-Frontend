import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ChevronLeft, ChevronUp, ChevronDown, ThumbsUp, ThumbsDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { fetchOrders, rateOrder } from '../../services/api';
import { Order } from '../../types';

const OrderRating: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('dishes');
  const [itemRatings, setItemRatings] = useState<Record<number, boolean | null>>({});
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
        } else {
          console.error('Order not found');
          navigate('/profile?tab=orders');
        }
      } catch (error) {
        console.error('Failed to load order details');
      } finally {
        setIsLoading(false);
      }
    };
    loadOrder();
  }, [orderId, user, navigate]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      console.error('Please provide a rating');
      return;
    }
    console.log('Thank you for your feedback!');
    navigate('/profile?tab=orders');
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f1f3f6] p-4">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)}><ChevronLeft className="w-6 h-6" /></button>
        <h1 className="text-lg font-semibold text-gray-800">Meal from {order.restaurantName}</h1>
      </div>

      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-10 h-10 cursor-pointer ${
              (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          />
        ))}
      </div>

      <div className="space-y-4">
        {/* Rate Dishes */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button onClick={() => toggleSection('dishes')} className="w-full flex justify-between items-center font-semibold text-gray-700">
            Rate your ordered dishes
            {expandedSection === 'dishes' ? <ChevronUp /> : <ChevronDown />}
          </button>
          <AnimatePresence>
            {expandedSection === 'dishes' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-center mt-4 pt-4 border-t">
                    <span className="text-gray-600">{item.name}</span>
                    <div className="flex gap-4">
                      <ThumbsUp className={`w-6 h-6 cursor-pointer ${itemRatings[item.id] === true ? 'text-green-500' : 'text-gray-300'}`} onClick={() => setItemRatings({...itemRatings, [item.id]: true})} />
                      <ThumbsDown className={`w-6 h-6 cursor-pointer ${itemRatings[item.id] === false ? 'text-red-500' : 'text-gray-300'}`} onClick={() => setItemRatings({...itemRatings, [item.id]: false})} />
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Detailed Review */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button onClick={() => toggleSection('review')} className="w-full flex justify-between items-center font-semibold text-gray-700">
            Add a detailed review
            {expandedSection === 'review' ? <ChevronUp /> : <ChevronDown />}
          </button>
          <AnimatePresence>
            {expandedSection === 'review' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <textarea className="w-full mt-4 p-2 border rounded-lg" rows={3} placeholder="Write your review here..." />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rate Delivery Partner */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <button onClick={() => toggleSection('delivery')} className="w-full flex justify-between items-center font-semibold text-gray-700">
            Rate your delivery partner
            {expandedSection === 'delivery' ? <ChevronUp /> : <ChevronDown />}
          </button>
          <AnimatePresence>
            {expandedSection === 'delivery' && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                <p className="mt-4 text-gray-600">Delivery partner rating content...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button 
        onClick={handleSubmit}
        className="fixed bottom-4 left-4 right-4 bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg"
      >
        Submit
      </button>
    </div>
  );
};

export default OrderRating;
