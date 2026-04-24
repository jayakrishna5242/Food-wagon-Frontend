
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect, useCallback } from 'react';
import { CartItem, MenuItem } from '../types';
import { fetchCart, saveCart, fetchAppliedCoupon, saveAppliedCoupon, fetchCartDiscount, saveCartDiscount } from '../services/api';

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
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const savedItems = await fetchCart();
      const savedCoupon = await fetchAppliedCoupon();
      const savedDiscount = await fetchCartDiscount();
      setItems(savedItems);
      setAppliedCoupon(savedCoupon);
      setDiscount(savedDiscount);
    };
    load();
  }, []);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  useEffect(() => {
    saveAppliedCoupon(appliedCoupon);
  }, [appliedCoupon]);

  useEffect(() => {
    saveCartDiscount(discount);
  }, [discount]);

  const addToCart = useCallback((item: MenuItem) => {
    const existingItem = items.find((i) => i.id === item.id);
    if (!existingItem) {
      console.log(`Added ${item.name} to cart`);
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
  }, [items]);

  const removeFromCart = useCallback((itemId: number) => {
    const itemToRemove = items.find(i => i.id === itemId);
    if (itemToRemove && itemToRemove.quantity === 1) {
      console.log(`Removed ${itemToRemove.name} from cart`);
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
  }, [items]);

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
      console.log('Coupon applied successfully! ₹50 off');
      return true;
    } else if (normalizedCode === 'FOODIE100' && cartTotal >= 500) {
      setAppliedCoupon(normalizedCode);
      setDiscount(100);
      console.log('Coupon applied successfully! ₹100 off');
      return true;
    } else if (normalizedCode === 'SAVE20' && cartTotal >= 300) {
      const disc = Math.round(cartTotal * 0.2);
      setAppliedCoupon(normalizedCode);
      setDiscount(disc);
      console.log(`Coupon applied successfully! ₹${disc} off`);
      return true;
    }
    
    console.log('Invalid coupon code or minimum order value not met');
    return false;
  }, [cartTotal]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscount(0);
    console.log('Coupon removed');
  }, []);

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