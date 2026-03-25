import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LocationContextType {
  city: string;
  address: string;
  setCity: (city: string) => void;
  setAddress: (address: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children?: ReactNode }) => {
  // Default to Bangalore for initial experience if nothing detected
  const [city, setCity] = useState<string>('Bangalore');
  const [address, setAddress] = useState<string>('Bangalore, India');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <LocationContext.Provider 
      value={{ 
        city, 
        setCity, 
        address, 
        setAddress, 
        isLoading, 
        setIsLoading, 
        error, 
        setError 
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};