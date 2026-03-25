
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAddress } from '../types';
import { useAuth } from './AuthContext';

interface AddressContextType {
  addresses: UserAddress[];
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Key for localStorage, unique per user if logged in
  const storageKey = user ? `foodwagon_addresses_${user.id}` : 'foodwagon_addresses_guest';

  // Initial load when user changes
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddresses(parsed);
        if (parsed.length > 0) {
          setSelectedAddressId(parsed[0].id);
        } else {
          setSelectedAddressId(null);
        }
      } catch (e) {
        console.error("Failed to parse addresses", e);
        setAddresses([]);
        setSelectedAddressId(null);
      }
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
    }
  }, [storageKey]);

  const addAddress = (newAddr: Omit<UserAddress, 'id'>) => {
    const addressWithId: UserAddress = {
      ...newAddr,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    setAddresses(prev => {
      const updated = [...prev, addressWithId];
      localStorage.setItem(storageKey, JSON.stringify(updated));
      return updated;
    });
    
    setSelectedAddressId(addressWithId.id);
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem(storageKey, JSON.stringify(updated));
      
      // If the removed address was selected, select another one or null
      if (selectedAddressId === id) {
        setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
      }
      
      return updated;
    });
  };

  return (
    <AddressContext.Provider value={{ addresses, addAddress, removeAddress, selectedAddressId, setSelectedAddressId }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddresses = () => {
  const context = useContext(AddressContext);
  if (context === undefined) throw new Error('useAddresses must be used within an AddressProvider');
  return context;
};
