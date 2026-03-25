
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAddress } from '../types';

interface AddressContextType {
  addresses: UserAddress[];
  addAddress: (address: Omit<UserAddress, 'id'>) => void;
  removeAddress: (id: string) => void;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children?: ReactNode }) => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem('foodwagon_addresses');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAddresses(parsed);
        if (parsed.length > 0) setSelectedAddressId(parsed[0].id);
      } catch (e) {
        console.error("Failed to parse addresses", e);
      }
    }
  }, []);

  const addAddress = (newAddr: Omit<UserAddress, 'id'>) => {
    const addressWithId: UserAddress = {
      ...newAddr,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    setAddresses(prev => {
      const updated = [...prev, addressWithId];
      localStorage.setItem('foodwagon_addresses', JSON.stringify(updated));
      return updated;
    });
    
    setSelectedAddressId(addressWithId.id);
  };

  const removeAddress = (id: string) => {
    setAddresses(prev => {
      const updated = prev.filter(a => a.id !== id);
      localStorage.setItem('foodwagon_addresses', JSON.stringify(updated));
      return updated;
    });
    
    if (selectedAddressId === id) {
      setAddresses(prev => {
        setSelectedAddressId(prev.length > 0 ? prev[0].id : null);
        return prev;
      });
    }
  };

  return (
    <AuthAwareAddressProvider 
      addresses={addresses} 
      addAddress={addAddress} 
      removeAddress={removeAddress}
      selectedAddressId={selectedAddressId}
      setSelectedAddressId={setSelectedAddressId}
    >
      {children}
    </AuthAwareAddressProvider>
  );
};

// Helper component to provide the context value
const AuthAwareAddressProvider = ({ 
  children, 
  addresses, 
  addAddress, 
  removeAddress, 
  selectedAddressId, 
  setSelectedAddressId 
}: AddressContextType & { children: ReactNode }) => {
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