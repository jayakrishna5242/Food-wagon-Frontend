import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchLocationFromDB, saveLocationToDB } from '../services/api';

interface LocationContextType {
  city: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  setCity: (city: string) => void;
  setAddress: (address: string) => void;
  setCoordinates: (coords: { latitude: number; longitude: number } | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children?: ReactNode }) => {
  const [city, setCity] = useState<string>('Select Location');
  const [address, setAddress] = useState<string>('Please select your city');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    const load = async () => {
      const data = await fetchLocationFromDB();
      setCity(data.city);
      setAddress(data.address);
      setCoordinates(data.coordinates);
    };
    load();
  }, []);

  // Sync with localStorage
  useEffect(() => {
    if (city !== 'Select Location') {
      saveLocationToDB(city, address, coordinates);
    }
  }, [city, address, coordinates]);

  return (
    <LocationContext.Provider 
      value={{ 
        city, 
        setCity, 
        address, 
        setAddress, 
        coordinates,
        setCoordinates,
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