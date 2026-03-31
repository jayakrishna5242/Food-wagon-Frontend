import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeniePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [dropoff, setDropoff] = useState<[number, number] | null>(null);
  const [distance, setDistance] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        if (!pickup) {
          setPickup([e.latlng.lat, e.latlng.lng]);
        } else if (!dropoff) {
          setDropoff([e.latlng.lat, e.latlng.lng]);
        }
      },
    });
    return null;
  };

  useEffect(() => {
    if (pickup && dropoff) {
      const d = calculateDistance(pickup[0], pickup[1], dropoff[0], dropoff[1]);
      setDistance(d);
      setPrice(d * 10); // Example pricing: $10 per km
    }
  }, [pickup, dropoff]);

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Genie Delivery</h1>
      <div className="h-64 mb-4">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapEvents />
          {pickup && <Marker position={pickup} />}
          {dropoff && <Marker position={dropoff} />}
        </MapContainer>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <p>Pickup: {pickup ? `${pickup[0].toFixed(4)}, ${pickup[1].toFixed(4)}` : 'Select on map'}</p>
        <p>Dropoff: {dropoff ? `${dropoff[0].toFixed(4)}, ${dropoff[1].toFixed(4)}` : 'Select on map'}</p>
        <p className="font-bold">Distance: {distance.toFixed(2)} km</p>
        <p className="font-bold text-primary">Price: ${price.toFixed(2)}</p>
        <p>Estimated Delivery: {(distance * 5).toFixed(0)} mins</p>
        <button 
          onClick={() => { setPickup(null); setDropoff(null); }}
          className="mt-4 bg-primary text-white px-4 py-2 rounded"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default GeniePage;
