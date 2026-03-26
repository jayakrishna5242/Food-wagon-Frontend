
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X, ChevronRight, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartBottomSheet: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { items, cartTotal, cartCount, addToCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartCount === 0 && !isOpen) return null;

  return (
    <>
      {/* Mini Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && !isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-24 left-4 right-4 z-50 md:bottom-8 md:right-8 md:left-auto md:w-80"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-full bg-primary text-white p-4 rounded-2xl shadow-lg flex items-center justify-between hover:bg-orange-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium opacity-90">{cartCount} items</p>
                  <p className="text-sm font-bold">₹{cartTotal}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">View Cart</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Cart Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-[32px] max-h-[85vh] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
                  <p className="text-sm text-gray-500">{cartCount} items selected</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearCart}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear Cart"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingBag className="w-10 h-10 text-gray-300" />
                    </div>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                        <p className="text-primary font-bold text-sm">₹{item.price}</p>
                      </div>
                      <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-500 font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">₹{cartTotal}</span>
                </div>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:bg-orange-600 transition-all active:scale-[0.98]"
                >
                  Checkout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default CartBottomSheet;
