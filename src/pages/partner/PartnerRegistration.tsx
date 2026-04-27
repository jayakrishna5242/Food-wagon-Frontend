
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Utensils, 
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import { registerPartner } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'motion/react';

const DEFAULT_RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=800',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80&w=800'
];

const PartnerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    restaurantName: '',
    city: '',
    location: '',
    cuisines: '',
    fssaiLicense: '',
    imageUrl: '',
    locationCoordinates: ''
  });

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPartnerForm(prev => ({
            ...prev,
            locationCoordinates: `${position.coords.latitude}, ${position.coords.longitude}`
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          console.error('Could not fetch location. Please enable location services.');
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (partnerForm.name.trim().length < 3) {
      console.error('Name must be at least 3 characters');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerForm.email)) {
      console.error('Please enter a valid email address');
      return;
    }
    if (partnerForm.phone.length !== 10) {
      console.error('Phone number must be 10 digits');
      return;
    }
    if (partnerForm.restaurantName.trim().length < 3) {
      console.error('Restaurant name must be at least 3 characters');
      return;
    }
    if (partnerForm.fssaiLicense.length !== 14) {
      console.error('FSSAI License must be 14 digits');
      return;
    }
    if (!partnerForm.imageUrl) {
      console.error('Please select or provide a restaurant image');
      return;
    }
    if (!partnerForm.locationCoordinates) {
      console.error('Please fetch your location');
      return;
    }

    const [lat, lng] = partnerForm.locationCoordinates.split(',').map(s => parseFloat(s.trim()));

    setLoading(true);
    try {
      const response = await registerPartner({
        ...partnerForm,
        latitude: lat,
        longitude: lng,
        cuisines: partnerForm.cuisines.split(',').map(c => c.trim())
      });
      if (response.user) {
        login(response.user, response.token);
      }
      setSuccess(true);
      setTimeout(() => navigate('/partner/dashboard'), 3000);
    } catch (err: any) {
      console.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-black text-dark mb-2">Registration Successful!</h1>
        <p className="text-gray-400 font-medium max-w-xs">Welcome to the FoodWagon family. Your account is pending verification by our admin. Redirecting you to login...</p>
        <button 
          onClick={() => navigate('/login')}
          className="mt-8 text-primary font-bold hover:underline"
        >
          Go to Login now
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-20 px-6">
      {/* Back Button */}
      <div className="hidden md:block fixed top-6 left-6 z-50">
        <motion.button 
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-gray-100 text-dark px-4 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl relative z-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-tighter mb-2 text-dark">
            Join <span className="text-primary">FoodWagon</span>
          </h1>
          <p className="text-gray-400 font-medium">
            Fill in the details below to get started.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="p-8 md:p-10">
            <form onSubmit={handlePartnerSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="text" 
                      placeholder="Owner's Name" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.name}
                      onChange={e => setPartnerForm({...partnerForm, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Restaurant Name</label>
                  <div className="relative">
                    <Utensils className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Spice Garden" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.restaurantName}
                      onChange={e => setPartnerForm({...partnerForm, restaurantName: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="email" 
                      placeholder="email@example.com" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.email}
                      onChange={e => setPartnerForm({...partnerForm, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.phone}
                      onChange={e => setPartnerForm({...partnerForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Delhi" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.city}
                      onChange={e => setPartnerForm({...partnerForm, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">FSSAI License Number</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      type="text" 
                      placeholder="14-digit FSSAI Number" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                      value={partnerForm.fssaiLicense}
                      onChange={e => setPartnerForm({...partnerForm, fssaiLicense: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Restaurant Image</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {DEFAULT_RESTAURANT_IMAGES.map((img, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPartnerForm({...partnerForm, imageUrl: img})}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${partnerForm.imageUrl === img ? 'border-primary' : 'border-transparent'}`}
                    >
                      <img src={img} alt={`Default ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
                <input 
                  type="url" 
                  placeholder="Or paste image URL here" 
                  className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                  value={partnerForm.imageUrl}
                  onChange={e => setPartnerForm({...partnerForm, imageUrl: e.target.value})}
                />
                {partnerForm.imageUrl && (
                  <div className="rounded-2xl overflow-hidden aspect-video">
                    <img src={partnerForm.imageUrl} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location (Lat, Long)</label>
                  <div className="relative flex gap-2">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                    <input 
                      required
                      readOnly
                      type="text"
                      placeholder="latitude, longitude" 
                      className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all opacity-50 cursor-not-allowed"
                      value={partnerForm.locationCoordinates}
                    />
                    <button 
                      type="button"
                      onClick={fetchLocation}
                      className="bg-primary text-white px-4 py-3.5 rounded-2xl text-xs font-bold hover:bg-orange-600 transition-all"
                    >
                      Fetch
                    </button>
                  </div>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Register Restaurant'}
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegistration;
