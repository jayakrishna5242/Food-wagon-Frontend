
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Bike, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Utensils, 
  Clock, 
  ShieldCheck,
  TrendingUp,
  Globe,
  Zap,
  ArrowLeft,
  CreditCard,
  Hash
} from 'lucide-react';
import { registerPartner, registerDelivery } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';

const JoinWithUs: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'PARTNER' | 'DELIVERY'>('PARTNER');
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
    latitude: 0,
    longitude: 0
  });

  const DEFAULT_RESTAURANT_IMAGES = [
    {
      name: 'Fine Dining',
      url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop'
    },
    {
      name: 'Fast Food',
      url: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?q=80&w=2070&auto=format&fit=crop'
    },
    {
      name: 'Cafe',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2070&auto=format&fit=crop'
    },
    {
      name: 'Bakery',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2070&auto=format&fit=crop'
    },
    {
      name: 'Pizzeria',
      url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop'
    }
  ];

  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    vehicleType: 'Bike',
    vehicleNumber: '',
    drivingLicense: ''
  });

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPartnerForm(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (partnerForm.name.trim().length < 3) {
      showToast('Name must be at least 3 characters', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partnerForm.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (partnerForm.phone.length !== 10) {
      showToast('Phone number must be 10 digits', 'error');
      return;
    }
    if (partnerForm.restaurantName.trim().length < 3) {
      showToast('Restaurant name must be at least 3 characters', 'error');
      return;
    }
    if (partnerForm.fssaiLicense.length !== 14) {
      showToast('FSSAI License must be 14 digits', 'error');
      return;
    }
    if (!partnerForm.imageUrl) {
      showToast('Please select or provide a restaurant image', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerPartner({
        ...partnerForm,
        cuisines: partnerForm.cuisines.split(',').map(c => c.trim())
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deliveryForm.name.trim().length < 3) {
      showToast('Name must be at least 3 characters', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(deliveryForm.email)) {
      showToast('Please enter a valid email address', 'error');
      return;
    }
    if (deliveryForm.phone.length !== 10) {
      showToast('Phone number must be 10 digits', 'error');
      return;
    }
    if (deliveryForm.vehicleNumber.trim().length < 5) {
      showToast('Please enter a valid vehicle number', 'error');
      return;
    }
    if (deliveryForm.drivingLicense.trim().length < 10) {
      showToast('Please enter a valid driving license number', 'error');
      return;
    }

    setLoading(true);
    try {
      await registerDelivery(deliveryForm);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      showToast(err.message || 'Registration failed', 'error');
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
          {/* Tab Switcher */}
          <div className="flex border-b border-gray-50">
            <button 
              onClick={() => setActiveTab('PARTNER')}
              className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all relative ${activeTab === 'PARTNER' ? 'bg-white text-primary' : 'bg-gray-50 text-gray-400'}`}
            >
              <Store className={`w-6 h-6 ${activeTab === 'PARTNER' ? 'text-primary' : ''}`} />
              <span className="text-xs font-black uppercase tracking-widest">Restaurant</span>
              {activeTab === 'PARTNER' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                />
              )}
            </button>
            <button 
              onClick={() => setActiveTab('DELIVERY')}
              className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all relative ${activeTab === 'DELIVERY' ? 'bg-white text-primary' : 'bg-gray-50 text-gray-400'}`}
            >
              <Bike className={`w-6 h-6 ${activeTab === 'DELIVERY' ? 'text-primary' : ''}`} />
              <span className="text-xs font-black uppercase tracking-widest">Delivery</span>
              {activeTab === 'DELIVERY' && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                />
              )}
            </button>
          </div>

          <div className="p-8 md:p-10">

                {activeTab === 'PARTNER' ? (
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
                ) : (
                  <form onSubmit={handleDeliverySubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                        <input 
                          required
                          type="text" 
                          placeholder="Your Name" 
                          className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                          value={deliveryForm.name}
                          onChange={e => setDeliveryForm({...deliveryForm, name: e.target.value})}
                        />
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
                            value={deliveryForm.email}
                            onChange={e => setDeliveryForm({...deliveryForm, email: e.target.value})}
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
                            value={deliveryForm.phone}
                            onChange={e => setDeliveryForm({...deliveryForm, phone: e.target.value})}
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
                            value={deliveryForm.city}
                            onChange={e => setDeliveryForm({...deliveryForm, city: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle Type</label>
                        <select 
                          className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                          value={deliveryForm.vehicleType}
                          onChange={e => setDeliveryForm({...deliveryForm, vehicleType: e.target.value})}
                        >
                          <option value="Bike">Bike</option>
                          <option value="Scooter">Scooter</option>
                          <option value="Cycle">Cycle</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vehicle Number</label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. DL 10 AB 1234" 
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            value={deliveryForm.vehicleNumber}
                            onChange={e => setDeliveryForm({...deliveryForm, vehicleNumber: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Driving License Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. DL-1234567890123" 
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            value={deliveryForm.drivingLicense}
                            onChange={e => setDeliveryForm({...deliveryForm, drivingLicense: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Join as Partner'}
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </form>
                )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinWithUs;
