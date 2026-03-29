
import React, { useState, useEffect } from 'react';
import { X, Home, Briefcase, MapPin, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { UserAddress } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

interface AddressFormProps {
  onSave: (address: Omit<UserAddress, 'id'>) => void;
  onClose?: () => void;
  className?: string;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSave, onClose, className = '' }) => {
  const { city: currentCity, address: currentAddress, setCity: setGlobalCity, setAddress: setGlobalAddress } = useLocationContext();
  const { showToast } = useToast();
  
  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill from global location
  useEffect(() => {
    setCity(currentCity || '');
    
    // Try to extract area from current address
    if (currentAddress) {
      const parts = currentAddress.split(',').map(p => p.trim());
      const areaPart = parts[0];
      
      // If the first part isn't just the city, use it as area
      if (areaPart && areaPart.toLowerCase() !== currentCity.toLowerCase()) {
        setArea(areaPart);
      } else if (parts.length > 1) {
        // If first part was city, try second part if it exists
        setArea(parts[1]);
      }
    }
  }, [currentCity, currentAddress]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast("Geolocation is not supported by your browser", "error");
      return;
    }
    
    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error("Failed to fetch address");
          
          const data = await response.json();
          const addr = data.address;
          
          const detectedCity = addr.city || addr.town || addr.village || addr.state_district || '';
          const detectedArea = addr.suburb || addr.neighbourhood || addr.road || addr.quarter || '';
          
          setCity(detectedCity);
          setArea(detectedArea);
          
          // Also update global context for consistency
          setGlobalCity(detectedCity);
          setGlobalAddress(detectedArea ? `${detectedArea}, ${detectedCity}` : detectedCity);
          showToast("Location detected successfully", "success");
        } catch (error) {
          console.error("Detection failed", error);
          showToast("Could not determine your exact address. Please enter manually.", "info");
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error", error);
        setIsDetecting(false);
        showToast("Location access denied or unavailable", "error");
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedFlatNo = flatNo.trim();
    const trimmedArea = area.trim();
    const trimmedCity = city.trim();

    if (trimmedFlatNo.length < 2) {
      showToast("Flat/House No. must be at least 2 characters", "error");
      return;
    }
    if (trimmedArea.length < 3) {
      showToast("Area must be at least 3 characters", "error");
      return;
    }
    if (trimmedCity.length < 3) {
      showToast("City must be at least 3 characters", "error");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedCity)) {
      showToast("City should only contain letters and spaces", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      // Small delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 400));
      onSave({ flatNo: trimmedFlatNo, area: trimmedArea, city: trimmedCity, type });
      setFlatNo('');
      setArea('');
      setCity('');
    } catch (err) {
      showToast("Failed to save address", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`bg-white p-0 relative ${className}`}>
      <div className="mb-10 relative z-10">
        <h2 className="text-xl font-black text-gray-900 tracking-tighter uppercase">Save Address</h2>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-2">Where should we deliver your food?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
        {/* Address Type Selector */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Address Label</label>
          <div className="flex gap-2">
            {(['Home', 'Work', 'Other'] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 py-4 border font-black text-[10px] uppercase tracking-widest flex flex-col items-center justify-center gap-2 transition-all ${
                  type === t 
                    ? 'border-primary bg-primary text-white' 
                    : 'border-gray-200 text-gray-400 bg-white hover:border-primary/50'
                }`}
              >
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
          className="w-full flex items-center justify-center gap-3 py-4 border border-primary text-primary text-[10px] font-black uppercase tracking-widest hover:bg-orange-50/30 transition-all disabled:opacity-50"
        >
          {isDetecting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4" />
          )}
          {isDetecting ? "Detecting..." : "Use Current Location"}
        </button>

        <div className="grid grid-cols-1 gap-6">
          <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Flat / House No.</label>
            <input 
              required 
              placeholder="e.g. 402, Building 7"
              value={flatNo} 
              onChange={e => setFlatNo(e.target.value)} 
              type="text" 
              className="w-full px-4 py-3 bg-white border border-gray-200 outline-none focus:border-primary transition-all font-bold text-gray-900 placeholder:text-gray-300 text-xs" 
            />
          </div>
          
          <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Area / Locality</label>
            <input 
              required 
              placeholder="e.g. Indiranagar 100ft Rd"
              value={area} 
              onChange={e => setArea(e.target.value)} 
              type="text" 
              className="w-full px-4 py-3 bg-white border border-gray-200 outline-none focus:border-primary transition-all font-bold text-gray-900 placeholder:text-gray-300 text-xs" 
            />
          </div>

          <div className="relative group">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">City</label>
            <input 
              required 
              placeholder="e.g. Bangalore"
              value={city} 
              onChange={e => setCity(e.target.value)} 
              type="text" 
              className="w-full px-4 py-3 bg-white border border-gray-200 outline-none focus:border-primary transition-all font-bold text-gray-900 placeholder:text-gray-300 text-xs" 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isSaving}
          className="w-full bg-primary text-white font-black py-5 flex items-center justify-center gap-3 mt-6 disabled:opacity-70 uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20"
        >
          {isSaving ? (
            <>Saving... <Loader2 size={16} className="animate-spin" /></>
          ) : (
            <>Save Address</>
          )}
        </button>
      </form>
    </div>
  );
};

export default AddressForm;