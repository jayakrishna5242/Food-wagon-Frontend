
import React, { useState, useEffect } from 'react';
import { X, Home, Briefcase, MapPin, Crosshair, Loader2, CheckCircle2 } from 'lucide-react';
import { UserAddress } from '../types';
import { useLocationContext } from '../context/LocationContext';
import { useToast } from '../context/ToastContext';

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Omit<UserAddress, 'id'>) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ isOpen, onClose, onSave }) => {
  const { city: currentCity, address: currentAddress, setCity: setGlobalCity, setAddress: setGlobalAddress } = useLocationContext();
  const { showToast } = useToast();
  
  const [flatNo, setFlatNo] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill from global location when modal opens
  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen, currentCity, currentAddress]);

  if (!isOpen) return null;

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
    if (!flatNo || flatNo.length < 1) {
      showToast("Flat/House No. is required", "error");
      return;
    }
    if (!area || area.length < 3) {
      showToast("Area must be at least 3 characters", "error");
      return;
    }
    if (!city || city.length < 3) {
      showToast("City must be at least 3 characters", "error");
      return;
    }
    
    setIsSaving(true);
    try {
      // Small delay for better UX feel
      await new Promise(resolve => setTimeout(resolve, 400));
      onSave({ flatNo, area, city, type });
      setFlatNo('');
      setArea('');
      setCity('');
      onClose();
    } catch (err) {
      showToast("Failed to save address", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-dark w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden border border-white/10 animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-white/5 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Save Address</h2>
            <p className="text-xs text-gray-500 font-medium mt-1">Provide your delivery details</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
          {/* Address Type Selector */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Address Label</label>
            <div className="flex gap-3">
              {(['Home', 'Work', 'Other'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-3.5 rounded-2xl border-2 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                    type === t 
                      ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-orange-500/10' 
                      : 'border-white/5 text-gray-500 hover:border-white/10'
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
            className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 text-white border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-70"
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
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Flat / House No.</label>
              <input 
                required 
                placeholder="e.g. 402, Building 7"
                value={flatNo} 
                onChange={e => setFlatNo(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-white placeholder:text-gray-600" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Area / Locality</label>
              <input 
                required 
                placeholder="e.g. Indiranagar 100ft Rd"
                value={area} 
                onChange={e => setArea(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-white placeholder:text-gray-600" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">City</label>
              <input 
                required 
                placeholder="e.g. Bangalore"
                value={city} 
                onChange={e => setCity(e.target.value)} 
                type="text" 
                className="w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-white placeholder:text-gray-600" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:scale-100"
          >
            {isSaving ? (
              <>Saving... <Loader2 size={18} className="animate-spin" /></>
            ) : (
              <>Save & Continue <CheckCircle2 size={18} /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;