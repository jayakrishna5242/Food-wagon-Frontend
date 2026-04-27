
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bike, Package, MapPin, Clock, ShieldCheck, ArrowRight, X, Loader2, CheckCircle2, Info, AlertTriangle, Navigation, ChevronLeft, History } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocationContext } from '../../context/LocationContext';
import { GenieBooking } from '../../types';
import { placeGenieBooking, fetchGenieBookings } from '../../services/api';
import MapComponent from '../../components/MapComponent';
import LocationSearch from '../../components/LocationSearch';

type BookingType = 'pickup' | 'buy';

const DeliveryService: React.FC = () => {
  const { address } = useLocationContext();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingType, setBookingType] = useState<BookingType>('pickup');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bookings, setBookings] = useState<GenieBooking[]>([]);
  const formRef = useRef<HTMLDivElement>(null);
  
  // New state
  const [pickupCoords, setPickupCoords] = useState<[number, number] | undefined>();
  const [dropCoords, setDropCoords] = useState<[number, number] | undefined>();
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);

  const geocode = async (address: string): Promise<[number, number] | null> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
    return null;
  };

  const calculateDistanceInKm = (coords1: [number, number], coords2: [number, number]): number => {
    const R = 6371; // km
    const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const dLon = (coords2[1] - coords1[1]) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const updateCalculations = async (pCoords: [number, number], dCoords: [number, number]): Promise<boolean> => {
    setIsCalculating(true);
    setErrors(prev => {
      const { general, pickup, drop, ...rest } = prev;
      return rest;
    });

    try {
      // Fetch route from OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${pCoords[1]},${pCoords[0]};${dCoords[1]},${dCoords[0]}?overview=full&geometries=geojson`;
      const routeResponse = await fetch(osrmUrl);
      const routeData = await routeResponse.json();

      let distKm = 0;
      let durationMins = 0;

      if (routeData.routes && routeData.routes.length > 0) {
        const route = routeData.routes[0];
        const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
        setRoutePoints(coordinates);
        
        distKm = route.distance / 1000;
        durationMins = Math.round(route.duration / 60);
      } else {
        // Fallback to straight line
        distKm = calculateDistanceInKm(pCoords, dCoords);
        setRoutePoints([pCoords, dCoords]);
        durationMins = Math.round(distKm * 4);
      }

      setDistance(`${distKm.toFixed(1)} km`);
      setEstimatedTime(`${durationMins} - ${Math.round(durationMins * 1.2)} mins`);
      setEstimatedCost(Math.round(distKm * 25 + 30));

      return true;
    } catch (routeError) {
      console.error("Routing failed:", routeError);
      return false;
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      updateCalculations(pickupCoords, dropCoords);
    }
  }, [pickupCoords, dropCoords]);

  useEffect(() => {
    const loadBookings = async () => {
      if (user?.id) {
        const data = await fetchGenieBookings(user.id);
        setBookings(data);
      }
    };
    loadBookings();
  }, [isSuccess, user]);

  const services = [
    { 
      id: 'pickup',
      title: 'Pick up & Drop', 
      description: 'Anything from anywhere in your city', 
      icon: Package,
      color: 'bg-orange-500'
    },
    { 
      id: 'buy',
      title: 'Buy from any Store', 
      description: 'We will buy and deliver it to you', 
      icon: Bike,
      color: 'bg-gray-900'
    }
  ];

  const handleOpenForm = (type: BookingType) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBookingType(type);
    setShowForm(true);
    setIsSuccess(false);
    setErrors({});
    // Scroll to form after a short delay to allow for animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const simplifyAddress = (address: string) => {
    const parts = address.split(', ');
    if (parts.length > 3) {
      return parts.slice(0, 3).join(', ');
    }
    return address;
  };

  const handleUseCurrentLocation = async () => {
    setIsCalculating(true);
    setErrors(prev => ({ ...prev, pickup: undefined }));

    const onSuccess = async (lat: number, lon: number) => {
      setPickupCoords([lat, lon]);
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        const data = await response.json();
        
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
          const city = addr.city || addr.town || addr.village || addr.state_district || '';
          const state = addr.state || '';
          
          let simplified = '';
          if (road && city) simplified = `${road}, ${city}`;
          else if (city) simplified = city;
          else simplified = data.display_name.split(', ').slice(0, 2).join(', ');

          setPickupLocation(simplified);
        } else if (data && data.display_name) {
          setPickupLocation(simplifyAddress(data.display_name));
        } else {
          setPickupLocation(`Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
        }
      } catch (error) {
        console.error("Reverse geocoding failed:", error);
        setPickupLocation(`Pinned Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`);
      } finally {
        setIsCalculating(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onSuccess(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
          setErrors(prev => ({ ...prev, pickup: "Could not fetch current location. Please check your browser permissions." }));
          setIsCalculating(false);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setErrors(prev => ({ ...prev, pickup: "Geolocation is not supported by your browser." }));
      setIsCalculating(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pickupLocation.trim()) newErrors.pickup = 'Pickup location is required';
    if (!dropLocation.trim()) newErrors.drop = 'Drop-off location is required';
    if (!description.trim()) newErrors.description = 'Item description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!validate()) return;
      
      if (!pickupCoords || !dropCoords) {
        setErrors({ ...errors, general: "Please select valid locations." });
        return;
      }
      
      const success = await updateCalculations(pickupCoords, dropCoords);
      if (!success) {
        setErrors({ ...errors, general: "Could not calculate route. Please try again." });
        return;
      }
      setStep(2);
    } else {
      setIsSubmitting(true);
      try {
        await placeGenieBooking({
          userId: user?.id,
          type: bookingType,
          pickupLocation,
          dropLocation,
          description,
          status: 'PENDING',
          estimatedCost
        });
        setIsSuccess(true);
        setPickupLocation('');
        setDropLocation('');
        setDescription('');
        setPickupCoords(undefined);
        setDropCoords(undefined);
        setRoutePoints([]);
        setStep(1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const safetyTips = [
    "Do not send prohibited items like drugs, weapons, or hazardous materials.",
    "Ensure items are properly packed to avoid damage during transit.",
    "Share the tracking link with the recipient for real-time updates.",
    "Verify the delivery partner's identity before handing over the package."
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!showForm ? (
            <motion.div
              key="selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="py-12 text-center max-w-2xl mx-auto">
                <h2 className="text-5xl md:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-6">
                  Anything <br/> Delivered <span className="text-primary">Instantly</span>
                </h2>
                <p className="text-gray-500 text-lg font-medium mb-10">
                  Forgot your keys? Need a document delivered? Want something from a specific store? Genie is here to help.
                </p>
                <button 
                  onClick={() => handleOpenForm('pickup')}
                  className="bg-primary text-white font-black py-4 px-12 rounded-full hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 uppercase tracking-widest text-xs"
                >
                  Set Pickup Location
                </button>
              </div>

              {/* Services */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {services.map((service) => (
                  <motion.div 
                    key={service.id}
                    onClick={() => handleOpenForm(service.id as BookingType)}
                    className="group cursor-pointer flex flex-col items-center text-center"
                  >
                    <div className={`${service.color} w-20 h-20 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight group-hover:text-primary transition-colors">{service.title}</h3>
                    <p className="text-gray-500 font-medium max-w-xs">{service.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Safety Tips */}
              <div className="pt-16 border-t border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0" />
                      <p className="text-sm text-gray-400 leading-relaxed font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              ref={formRef}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-2xl mx-auto"
            >
             
              <div className="bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-10 md:p-12">
                  <div className="mb-12">
                    <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter leading-none mb-3">
                      {bookingType === 'pickup' ? 'Pick up & Drop' : 'Buy from Store'}
                    </h2>
                    <p className="text-gray-500 font-medium">Fill in the details to book your Genie</p>
                  </div>

                  {isSuccess ? (
                    <div className="py-12 text-center">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-dark mb-4">Booking Successful!</h3>
                      <p className="text-gray-500 mb-10 max-w-sm mx-auto">Your Genie will be assigned shortly. You can track the progress in your orders.</p>
                      <button 
                        onClick={() => { setShowForm(false); setStep(1); }}
                        className="w-full bg-dark text-white font-bold py-5 rounded-2xl hover:bg-black transition-colors shadow-xl shadow-black/10"
                      >
                        Back to Genie Home
                      </button>
                    </div>
                  ) : step === 1 ? (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      {/* ... existing form fields ... */}
                      <div className="space-y-8">
                        <div className="relative">
                          <div className="flex items-center justify-between ml-2 mb-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                              {bookingType === 'pickup' ? 'Pickup Location' : 'Store Location'}
                            </label>
                            <button 
                              type="button"
                              onClick={handleUseCurrentLocation}
                              className="flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-orange-600 transition-colors uppercase tracking-[0.2em]"
                            >
                              <Navigation className="w-3 h-3" />
                              Use Current
                            </button>
                          </div>
                          <LocationSearch 
                            label=""
                            placeholder={bookingType === 'pickup' ? "Enter pickup address" : "Enter store name or address"}
                            initialValue={pickupLocation}
                            onSelect={(address, coords) => {
                              setPickupLocation(address);
                              setPickupCoords(coords);
                            }}
                            error={errors.pickup}
                          />
                        </div>

                        <div className="relative">
                          <LocationSearch 
                            label="Drop-off Location"
                            placeholder="Enter delivery address"
                            initialValue={dropLocation}
                            onSelect={(address, coords) => {
                              setDropLocation(address);
                              setDropCoords(coords);
                            }}
                            error={errors.drop}
                          />
                        </div>

                        <div className="relative">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-2 mb-4 block">Item Description</label>
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={bookingType === 'pickup' ? "What are we picking up? (e.g., Keys, Documents)" : "What do you want us to buy?"}
                            rows={4}
                            className={`w-full bg-gray-50 border-2 ${errors.description ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white rounded-[1.5rem] py-6 px-8 text-gray-900 font-bold transition-all outline-none resize-none placeholder:text-gray-300 shadow-inner`}
                          />
                          {errors.description && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest mt-3 ml-2">{errors.description}</p>}
                        </div>
                        {errors.general && (
                          <div className="bg-red-50 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-xs text-red-600 font-bold uppercase tracking-wider">{errors.general}</p>
                          </div>
                        )}
                      </div>

                      <button 
                        type="submit"
                        disabled={isCalculating}
                        className="w-full bg-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 text-sm uppercase tracking-widest disabled:opacity-70"
                      >
                        {isCalculating ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <>
                            <span>CONTINUE</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <MapComponent pickupCoords={pickupCoords} dropCoords={dropCoords} routePoints={routePoints} />
                      <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Distance:</span>
                          <span className="font-bold text-dark">{distance}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimated Time:</span>
                          <span className="font-bold text-dark">{estimatedTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Estimated Price:</span>
                          <span className="font-bold text-dark">₹{estimatedCost}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <button 
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex-1 bg-gray-200 text-dark font-bold py-6 rounded-2xl hover:bg-gray-300 hover:scale-[1.02] transition-all text-sm uppercase tracking-widest"
                        >
                          Back
                        </button>
                        <button 
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 bg-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all flex items-center justify-center gap-4 disabled:opacity-70 text-sm uppercase tracking-widest"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <span>CONFIRM BOOKING</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Form Safety Tips */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-green-600" />
                  Safety & Guidelines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="bg-white p-4 rounded-2xl flex items-start gap-3 border border-gray-100 shadow-sm">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-600">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryService;
