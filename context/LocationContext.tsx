import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  const [address, setAddress] = useState<string>('Detecting your location...');
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCoordinates({ latitude, longitude });
          setAddress('Location detected');
          setCity('Hyderabad'); // Mock city detection for now
          setIsLoading(false);
        },
        (err) => {
          setError(err.message);
          setAddress('Location detection failed');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setAddress('Geolocation not supported');
    }
  }, []);

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