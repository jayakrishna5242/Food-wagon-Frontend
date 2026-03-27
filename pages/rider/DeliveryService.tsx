
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Bike, Package, MapPin, Clock, ShieldCheck, ArrowRight, X, Loader2, CheckCircle2, Info, AlertTriangle, Navigation, ChevronLeft, History } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLocationContext } from '../../context/LocationContext';
import { GenieBooking } from '../../types';
import { placeGenieBooking, fetchGenieBookings } from '../../services/api';

type BookingType = 'pickup' | 'buy';

const DeliveryService: React.FC = () => {
  const { address } = useLocationContext();
  const [showForm, setShowForm] = useState(false);
  const [bookingType, setBookingType] = useState<BookingType>('pickup');
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [bookings, setBookings] = useState<GenieBooking[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadBookings = async () => {
      const data = await fetchGenieBookings();
      setBookings(data);
    };
    loadBookings();
  }, [isSuccess]);

  const services = [
    { 
      id: 'pickup',
      title: 'Pick up & Drop', 
      description: 'Anything from anywhere in your city', 
      icon: Package,
      color: 'bg-pink-500'
    },
    { 
      id: 'buy',
      title: 'Buy from any Store', 
      description: 'We will buy and deliver it to you', 
      icon: Bike,
      color: 'bg-orange-500'
    }
  ];

  const handleOpenForm = (type: BookingType) => {
    setBookingType(type);
    setShowForm(true);
    setIsSuccess(false);
    setErrors({});
    // Scroll to form after a short delay to allow for animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleUseCurrentLocation = () => {
    if (address && address !== 'Detecting your location...' && address !== 'Select Location') {
      setPickupLocation(address);
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          setPickupLocation("Current Location (GPS)");
        });
      }
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!pickupLocation.trim()) newErrors.pickup = 'Pickup location is required';
    if (!dropLocation.trim()) newErrors.drop = 'Drop-off location is required';
    if (!itemDescription.trim()) newErrors.description = 'Item description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await placeGenieBooking({
        type: bookingType,
        pickupLocation,
        dropLocation,
        itemDescription
      });
      setIsSuccess(true);
      setPickupLocation('');
      setDropLocation('');
      setItemDescription('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-white sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark">Feasti Genie</h1>
        </div>
      </div>

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
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10 max-w-lg">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4 uppercase tracking-tight">Anything Delivered Instantly</h2>
                  <p className="text-indigo-100 mb-8">Forgot your keys? Need a document delivered? Want something from a specific store? Genie is here to help.</p>
                  <button 
                    onClick={() => handleOpenForm('pickup')}
                    className="bg-white text-indigo-900 font-bold py-3 px-8 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                    Set Pickup Location
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                  <Bike size={300} strokeWidth={1} />
                </div>
              </div>

              {/* Services */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-6">Our Services</h3>
                <div className="flex md:grid md:grid-cols-2 gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 snap-x">
                  {services.map((service) => (
                    <motion.div 
                      key={service.id}
                      whileHover={{ y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleOpenForm(service.id as BookingType)}
                      className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col md:flex-row items-start gap-4 md:gap-6 group cursor-pointer min-w-[280px] md:min-w-0 snap-center"
                    >
                      <div className={`${service.color} p-4 rounded-2xl text-white shadow-lg shrink-0`}>
                        <service.icon className="w-6 h-6 md:w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg md:text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                        <p className="text-gray-500 text-xs md:text-sm mb-4">{service.description}</p>
                        <div className="flex items-center gap-2 text-primary font-bold text-xs md:text-sm">
                          <span>BOOK NOW</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Pickups */}
              {bookings.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                    <History className="text-primary" />
                    Recent Pickups
                  </h3>
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${booking.type === 'pickup' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'}`}>
                            {booking.type === 'pickup' ? <Package className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="font-bold text-dark">{booking.type === 'pickup' ? 'Pick up & Drop' : 'Buy from Store'}</h4>
                            <p className="text-xs text-gray-500">{booking.pickupLocation} → {booking.dropLocation}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(booking.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Tips */}
              <div>
                <h3 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-green-600" />
                  Safety & Guidelines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {safetyTips.map((tip, index) => (
                    <div key={index} className="bg-blue-50/50 p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
                      <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">{tip}</p>
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
             
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-10">
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-dark uppercase tracking-tight mb-2">
                      {bookingType === 'pickup' ? 'Pick up & Drop' : 'Buy from Store'}
                    </h2>
                    <p className="text-gray-500">Fill in the details to book your Genie</p>
                  </div>

                  {isSuccess ? (
                    <div className="py-12 text-center">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <CheckCircle2 className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="text-3xl font-bold text-dark mb-4">Booking Successful!</h3>
                      <p className="text-gray-500 mb-10 max-w-sm mx-auto">Your Genie will be assigned shortly. You can track the progress in your orders.</p>
                      <button 
                        onClick={() => setShowForm(false)}
                        className="w-full bg-dark text-white font-bold py-5 rounded-2xl hover:bg-black transition-colors shadow-xl shadow-black/10"
                      >
                        Back to Genie Home
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="space-y-6">
                        <div className="relative">
                          <div className="flex items-center justify-between ml-1 mb-3">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                              {bookingType === 'pickup' ? 'Pickup Location' : 'Store Location'}
                            </label>
                            <button 
                              type="button"
                              onClick={handleUseCurrentLocation}
                              className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:text-orange-600 transition-colors uppercase tracking-widest"
                            >
                              <Navigation className="w-3 h-3" />
                              Use Current
                            </button>
                          </div>
                          <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                            <input 
                              type="text"
                              value={pickupLocation}
                              onChange={(e) => setPickupLocation(e.target.value)}
                              placeholder={bookingType === 'pickup' ? "Enter pickup address" : "Enter store name or address"}
                              className={`w-full bg-gray-50 border-2 ${errors.pickup ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white rounded-2xl py-5 pl-14 pr-6 text-dark font-bold transition-all outline-none placeholder:text-gray-300`}
                            />
                          </div>
                          {errors.pickup && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.pickup}</p>}
                        </div>

                        <div className="relative">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Drop-off Location</label>
                          <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                            <input 
                              type="text"
                              value={dropLocation}
                              onChange={(e) => setDropLocation(e.target.value)}
                              placeholder="Enter delivery address"
                              className={`w-full bg-gray-50 border-2 ${errors.drop ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white rounded-2xl py-5 pl-14 pr-6 text-dark font-bold transition-all outline-none placeholder:text-gray-300`}
                            />
                          </div>
                          {errors.drop && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.drop}</p>}
                        </div>

                        <div className="relative">
                          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 mb-3 block">Item Description</label>
                          <textarea 
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            placeholder={bookingType === 'pickup' ? "What are we picking up? (e.g., Keys, Documents)" : "What do you want us to buy?"}
                            rows={4}
                            className={`w-full bg-gray-50 border-2 ${errors.description ? 'border-red-500' : 'border-transparent'} focus:border-primary focus:bg-white rounded-2xl py-5 px-6 text-dark font-bold transition-all outline-none resize-none placeholder:text-gray-300`}
                          />
                          {errors.description && <p className="text-red-500 text-xs font-bold mt-2 ml-1">{errors.description}</p>}
                        </div>
                      </div>

                      <div className="bg-orange-50 p-5 rounded-2xl flex items-start gap-4 border border-orange-100">
                        <AlertTriangle className="w-6 h-6 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-800 font-bold leading-relaxed">
                          Estimated delivery fee will be calculated based on distance. Minimum fee applies.
                        </p>
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary text-white font-black py-6 rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-4 disabled:opacity-70 text-sm uppercase tracking-widest"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>BOOKING GENIE...</span>
                          </>
                        ) : (
                          <>
                            <span>BOOK GENIE NOW</span>
                            <ArrowRight className="w-6 h-6" />
                          </>
                        )}
                      </button>
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
