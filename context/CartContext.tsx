
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { CartItem, MenuItem } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  discount: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children?: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('foodwagon_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    return localStorage.getItem('foodwagon_coupon');
  });
  const [discount, setDiscount] = useState<number>(() => {
    const saved = localStorage.getItem('foodwagon_discount');
    return saved ? Number(saved) : 0;
  });
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('foodwagon_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('foodwagon_coupon', appliedCoupon);
    } else {
      localStorage.removeItem('foodwagon_coupon');
    }
  }, [appliedCoupon]);

  useEffect(() => {
    localStorage.setItem('foodwagon_discount', discount.toString());
  }, [discount]);

  const addToCart = useCallback((item: MenuItem) => {
    const existingItem = items.find((i) => i.id === item.id);
    if (!existingItem) {
      showToast(`Added ${item.name} to cart`, 'success');
    }
    setItems((prevItems) => {
      const isAlreadyInCart = prevItems.some((i) => i.id === item.id);
      if (isAlreadyInCart) {
        return prevItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevItems, { ...item, quantity: 1 }];
    });
  }, [items, showToast]);

  const removeFromCart = useCallback((itemId: number) => {
    const itemToRemove = items.find(i => i.id === itemId);
    if (itemToRemove && itemToRemove.quantity === 1) {
      showToast(`Removed ${itemToRemove.name} from cart`, 'info');
    }
    setItems((prevItems) => {
      const existingItem = prevItems.find((i) => i.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevItems.filter((i) => i.id !== itemId);
    });
  }, [items, showToast]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
    setDiscount(0);
  }, []);

  const cartTotal = useMemo(() => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const cartCount = useMemo(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
  }, [items]);

  const applyCoupon = useCallback((code: string): boolean => {
    const normalizedCode = code.toUpperCase();
    
    // Simple coupon logic
    if (normalizedCode === 'WELCOME50' && cartTotal >= 200) {
      setAppliedCoupon(normalizedCode);
      setDiscount(50);
      showToast('Coupon applied successfully! ₹50 off', 'success');
      return true;
    } else if (normalizedCode === 'FOODIE100' && cartTotal >= 500) {
      setAppliedCoupon(normalizedCode);
      setDiscount(100);
      showToast('Coupon applied successfully! ₹100 off', 'success');
      return true;
    } else if (normalizedCode === 'SAVE20' && cartTotal >= 300) {
      const disc = Math.round(cartTotal * 0.2);
      setAppliedCoupon(normalizedCode);
      setDiscount(disc);
      showToast(`Coupon applied successfully! ₹${disc} off`, 'success');
      return true;
    }
    
    showToast('Invalid coupon code or minimum order value not met', 'error');
    return false;
  }, [cartTotal, showToast]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscount(0);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  const contextValue = useMemo(() => ({
    items, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartCount,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  }), [
    items, 
    addToCart, 
    removeFromCart, 
    clearCart, 
    cartTotal, 
    cartCount,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  ]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};