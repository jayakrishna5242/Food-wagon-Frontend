
import React from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { items, addToCart, removeFromCart, cartCount, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md glass-dark z-[101] shadow-2xl flex flex-col border-l border-white/10"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2.5 rounded-2xl shadow-lg shadow-orange-500/10">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tighter">Your Cart</h2>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{cartCount} items selected</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-500 hover:text-white hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-6 no-scrollbar space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-inner"
                  >
                    <ShoppingBag className="w-10 h-10 text-gray-700" />
                  </motion.div>
                  <h3 className="text-2xl font-black text-white tracking-tighter mb-3">Your cart is empty</h3>
                  <p className="text-gray-500 text-sm mb-10 font-medium">Looks like you haven't added anything to your cart yet.</p>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="bg-primary hover:bg-orange-600 text-white font-black py-4 px-10 rounded-2xl transition-all shadow-xl shadow-orange-500/20 uppercase text-xs tracking-widest"
                  >
                    Start Ordering
                  </motion.button>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div 
                      key={item.id} 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 group bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-black text-white text-sm truncate tracking-tight">{item.name}</h4>
                        </div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-3">₹{item.price}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 glass bg-black/20 px-3 py-1.5 rounded-xl border border-white/5">
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-gray-400 hover:text-primary transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-primary min-w-[20px] text-center">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart(item)}
                              className="text-primary hover:text-orange-400 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-black text-white text-sm tracking-tight">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-black/40 backdrop-blur-2xl">
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Subtotal</span>
                    <span className="text-white">₹{cartTotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[10px] font-black uppercase tracking-widest">
                    <span>Delivery Fee</span>
                    <span className="text-green-500">FREE</span>
                  </div>
                  <div className="flex justify-between text-white font-black text-2xl pt-4 border-t border-white/5 tracking-tighter">
                    <span>Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-primary hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-2xl shadow-orange-500/20 flex items-center justify-center gap-3 group transition-all uppercase text-xs tracking-widest"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </div>
            ) }
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
