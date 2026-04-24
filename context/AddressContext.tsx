
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserAddress } from '../types';
import { useAuth } from './AuthContext';
import { fetchAddresses, saveAddress, removeAddress as apiRemoveAddress } from '../services/api';

interface AddressContextType {
  addresses: UserAddress[];
  addAddress: (address: Omit<UserAddress, 'id'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  selectedAddressId: string | null;
  setSelectedAddressId: (id: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({ children }: { children?: ReactNode }) => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Initial load when user changes
  useEffect(() => {
    const load = async () => {
      const data = await fetchAddresses();
      setAddresses(data);
      if (data.length > 0) {
        setSelectedAddressId(data[0].id);
      } else {
        setSelectedAddressId(null);
      }
    };
    load();
  }, [user?.id]);

  const addAddress = async (newAddr: Omit<UserAddress, 'id'>) => {
    const saved = await saveAddress(newAddr);
    setAddresses(prev => [...prev, saved]);
    setSelectedAddressId(saved.id);
  };

  const removeAddress = async (id: string) => {
    await apiRemoveAddress(id);
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    
    if (selectedAddressId === id) {
      setSelectedAddressId(updated.length > 0 ? updated[0].id : null);
    }
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
