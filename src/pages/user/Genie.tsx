import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { placeGenieBooking, calculateDistance } from '../../services/api';
import { GenieBooking } from '../../types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Bike, 
  MapPin, 
  Package, 
  ChevronRight, 
  ArrowLeft, 
  Info,
  Clock,
  Navigation
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Fix for default leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const GeniePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [bookingType, setBookingType] = useState<'pickup' | 'buy'>('pickup');
  const [pickup, setPickup] = useState<[number, number] | null>(null);
  const [dropoff, setDropoff] = useState<[number, number] | null>(null);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [description, setDescription] = useState('');
  const [distance, setDistance] = useState<number>(0);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
          setPickupAddress(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        } else if (!dropoff) {
          setDropoff([e.latlng.lat, e.latlng.lng]);
          setDropAddress(`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`);
        }
      },
    });
    return null;
  };

  useEffect(() => {
    if (pickup && dropoff) {
      const d = calculateDistance(pickup[0], pickup[1], dropoff[0], dropoff[1]);
      setDistance(d);
      // Pricing logic: Base 40 + 15 per km
      setEstimatedCost(40 + Math.round(d * 15));
    }
  }, [pickup, dropoff]);

  const handleBooking = async () => {
    if (!user || !pickupAddress || !dropAddress || !description) return;

    setLoading(true);
    try {
      const bookingData: Partial<GenieBooking> = {
        userId: user.id,
        type: bookingType,
        pickupLocation: pickupAddress,
        dropLocation: dropAddress,
        description: description,
        status: 'PENDING',
        estimatedCost: estimatedCost
      };

      await placeGenieBooking(bookingData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (err) {
      console.error('Booking failed', err);
      alert('Failed to book Genie. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
        >
          <Bike className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-black text-dark mb-4">Genie is on the way!</h2>
        <p className="text-gray-500 font-medium">Your request has been placed successfully. Redirecting to your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans">
      {/* Header */}
      <div className="bg-white sticky top-0 z-[1000] border-b border-gray-100">
        <div className="container mx-auto max-w-2xl px-4 h-20 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-dark" />
          </button>
          <div>
            <h1 className="text-xl font-black text-dark tracking-tight leading-none">Genie Service</h1>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Send anything, anywhere</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Type Selection */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setBookingType('pickup')}
            className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${bookingType === 'pickup' ? 'border-primary bg-primary/5' : 'border-white bg-white shadow-sm hover:border-gray-100'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bookingType === 'pickup' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Package className="w-6 h-6" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Pick & Drop</span>
          </button>
          <button 
            onClick={() => setBookingType('buy')}
            className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${bookingType === 'buy' ? 'border-primary bg-primary/5' : 'border-white bg-white shadow-sm hover:border-gray-100'}`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${bookingType === 'buy' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
              <Navigation className="w-6 h-6" />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Buy Anything</span>
          </button>
        </div>

        {/* Map Header */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center uppercase font-black text-primary text-xs">
                Map
              </div>
              <p className="text-sm font-black text-dark tracking-tight">Select points on map</p>
            </div>
            <button 
              onClick={() => { setPickup(null); setDropoff(null); setPickupAddress(''); setDropAddress(''); }}
              className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
            >
              Reset
            </button>
          </div>
          <div className="h-64 relative">
            <MapContainer center={[12.9716, 77.5946]} zoom={13} className="h-full w-full z-0" attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapEvents />
              {pickup && <Marker position={pickup} />}
              {dropoff && <Marker position={dropoff} />}
              {pickup && dropoff && <Polyline positions={[pickup, dropoff]} color="#ff5200" dashArray="5, 10" />}
            </MapContainer>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center p-1">
                  <div className="w-full h-full bg-primary rounded-full"></div>
                </div>
                <div className="w-0.5 h-10 border-l-2 border-dashed border-gray-200"></div>
                <MapPin className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-grow space-y-4">
                <input 
                  type="text"
                  placeholder="Pickup Location"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <input 
                  type="text"
                  placeholder="Drop Location"
                  value={dropAddress}
                  onChange={(e) => setDropAddress(e.target.value)}
                  className="w-full bg-gray-50 border-0 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 space-y-6">
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">
              What should Genie do?
            </label>
            <textarea 
              placeholder={bookingType === 'pickup' ? "e.g. Please pick up my keys from home" : "e.g. Buy 1kg Apples from nearby store"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 border-0 rounded-[32px] p-6 text-sm font-medium focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px]"
            />
          </div>

          <div className="bg-primary/5 rounded-3xl p-6 flex items-start gap-4">
            <Info className="w-5 h-5 text-primary shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-black text-dark uppercase tracking-tight">Fair Price Policy</p>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                Prices are calculated based on distance and item complexity. No hidden charges.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <AnimatePresence>
          {distance > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="bg-dark text-white p-6 rounded-[32px] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Distance</p>
                  <p className="text-2xl font-black">{distance.toFixed(1)} km</p>
                </div>
                <Clock className="w-8 h-8 text-white/20" />
              </div>
              <div className="bg-primary text-white p-6 rounded-[32px] flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Estimate</p>
                  <p className="text-2xl font-black">₹{estimatedCost}</p>
                </div>
                <div className="w-8 h-8 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Action */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 md:relative md:bg-transparent md:border-t-0 md:p-0">
          <button 
            disabled={!pickupAddress || !dropAddress || !description || loading}
            onClick={handleBooking}
            className={`w-full py-6 rounded-[32px] font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 ${
              (!pickupAddress || !dropAddress || !description || loading) 
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-primary text-white shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Book Genie Task
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeniePage;
