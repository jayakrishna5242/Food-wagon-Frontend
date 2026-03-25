
import React, { useState, useEffect } from 'react';
import { X, Home, Briefcase, MapPin, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { UserAddress } from '../types';
import { useLocationContext } from '../context/LocationContext';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<UserAddress, 'id'>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ isOpen, onClose, onSave }) => {
  const { city: currentCity, address: currentAddress, setCity: setGlobalCity, setAddress: setGlobalAddress } = useLocationContext();
  
  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDetecting, setIsDetecting] = useState(false);

  // Pre-fill from global location when modal opens
  useEffect(() => {
    if (isOpen) {
      setCity(currentCity || '');
      // Try to extract area from current address (e.g. "Indiranagar, Bangalore" -> "Indiranagar")
      const areaPart = currentAddress.split(',')[0];
      if (areaPart && areaPart !== currentCity) {
        setArea(areaPart);
      }
    }
  }, [isOpen, currentCity, currentAddress]);

  if (!isOpen) return null;

  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await response.json();
          const addr = data.address;
          
          const detectedCity = addr.city || addr.town || addr.village || addr.state_district || '';
          const detectedArea = addr.suburb || addr.neighbourhood || addr.road || '';
          
          setCity(detectedCity);
          setArea(detectedArea);
          
          // Also update global context for consistency
          setGlobalCity(detectedCity);
          setGlobalAddress(detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity);
        } catch (error) {
          console.error("Detection failed", error);
        } finally {
          setIsDetecting(false);
        }
      },
      () => setIsDetecting(false),
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNo || !area || !city) return;
    
    onSave({ flatNo, area, city, type });
    setFlatNo('');
    setArea('');
    setCity('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-dark tracking-tight">Save Address</h2>
            <p className="text-xs text-graytext font-medium mt-1">Provide your delivery details</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-dark"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Address Type Selector */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Address Label</label>
            <div className="flex gap-3">
              {(['Home', 'Work', 'Other'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-3.5 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    type === t 
                      ? 'border-primary bg-orange-50 text-primary shadow-lg shadow-orange-500/10' 
                      : 'border-gray-100 text-gray-400 hover:border-gray-200'
                  }`}
                >
                  {t === 'Home' && <Home size={18} />}
                  {t === 'Work' && <Briefcase size={18} />}
                  {t === 'Other' && <MapPin size={18} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Detect Button */}
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {isDetecting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
            {isDetecting ? "Fetching..." : "Use Current Location"}
          </button>

          <div className="grid grid-cols-1 gap-5">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Flat / House No.</label>
              <input 
                required 
                placeholder="e.g. 402, Building 7"
                value={flatNo} 
                onChange={e => setFlatNo(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Area / Locality</label>
              <input 
                required 
                placeholder="e.g. Indiranagar 100ft Rd"
                value={area} 
                onChange={e => setArea(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">City</label>
              <input 
                required 
                placeholder="e.g. Bangalore"
                value={city} 
                onChange={e => setCity(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4"
          >
            Save & Continue <CheckCircle2 size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;