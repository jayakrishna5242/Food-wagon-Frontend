
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
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="absolute top-6 left-6 z-50">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-dark text-white pt-20 pb-32 md:pt-32 md:pb-48 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
              Grow your business with <span className="text-primary">FoodWagon</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium mb-10 leading-relaxed">
              Join thousands of restaurants and delivery partners who are reaching more customers and earning more every day.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Verified Partners</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Fast Growth</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-xs font-bold">
                <Globe className="w-4 h-4 text-primary" />
                <span>Wide Network</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-6 -mt-20 md:-mt-32 pb-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Benefits */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white p-8 rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100">
              <h2 className="text-2xl font-black text-dark mb-8 tracking-tight">Why join us?</h2>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-black text-dark mb-1">Quick Onboarding</h4>
                    <p className="text-sm text-gray-400 font-medium">Get started in less than 24 hours with our streamlined process.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-dark mb-1">Increased Revenue</h4>
                    <p className="text-sm text-gray-400 font-medium">Reach new customers and increase your daily orders by up to 40%.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-black text-dark mb-1">Secure Payments</h4>
                    <p className="text-sm text-gray-400 font-medium">Weekly payouts directly to your bank account with full transparency.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="bg-primary p-8 rounded-[32px] text-white shadow-xl shadow-primary/20">
              <p className="text-lg font-bold italic mb-6 leading-relaxed">
                "Joining FoodWagon was the best decision for my restaurant. Our sales doubled within the first three months!"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div>
                  <p className="font-black text-sm">Rajesh Kumar</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Owner, Spice Garden</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Registration Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
              {/* Tab Switcher */}
              <div className="flex border-b border-gray-50">
                <button 
                  onClick={() => setActiveTab('PARTNER')}
                  className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all ${activeTab === 'PARTNER' ? 'bg-white border-b-4 border-primary' : 'bg-gray-50 text-gray-400'}`}
                >
                  <Store className={`w-6 h-6 ${activeTab === 'PARTNER' ? 'text-primary' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Restaurant Partner</span>
                </button>
                <button 
                  onClick={() => setActiveTab('DELIVERY')}
                  className={`flex-1 py-6 flex flex-col items-center gap-2 transition-all ${activeTab === 'DELIVERY' ? 'bg-white border-b-4 border-primary' : 'bg-gray-50 text-gray-400'}`}
                >
                  <Bike className={`w-6 h-6 ${activeTab === 'DELIVERY' ? 'text-primary' : ''}`} />
                  <span className="text-xs font-black uppercase tracking-widest">Delivery Partner</span>
                </button>
              </div>

              <div className="p-8 md:p-12">
                <h3 className="text-2xl font-black text-dark mb-2 tracking-tight">
                  {activeTab === 'PARTNER' ? 'Register your Restaurant' : 'Join as a Delivery Partner'}
                </h3>
                <p className="text-sm text-gray-400 font-medium mb-10">Fill in the details below to get started.</p>

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
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Area / Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                          <input 
                            required
                            type="text" 
                            placeholder="e.g. Connaught Place" 
                            className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                            value={partnerForm.location}
                            onChange={e => setPartnerForm({...partnerForm, location: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cuisines (Comma separated)</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g. North Indian, Chinese, Fast Food" 
                        className="w-full bg-gray-50 border-none rounded-2xl py-3.5 px-6 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        value={partnerForm.cuisines}
                        onChange={e => setPartnerForm({...partnerForm, cuisines: e.target.value})}
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Restaurant Image</label>
                      
                      {/* Default Images Selection */}
                      <div className="grid grid-cols-5 gap-3">
                        {DEFAULT_RESTAURANT_IMAGES.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setPartnerForm({ ...partnerForm, imageUrl: img.url })}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${partnerForm.imageUrl === img.url ? 'border-primary scale-95' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <img 
                              src={img.url} 
                              alt={img.name} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {partnerForm.imageUrl === img.url && (
                              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <Globe className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                        <input 
                          type="url" 
                          placeholder="Or paste custom image URL here" 
                          className="w-full bg-gray-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                          value={partnerForm.imageUrl}
                          onChange={e => setPartnerForm({...partnerForm, imageUrl: e.target.value})}
                        />
                      </div>
                      
                      {partnerForm.imageUrl && (
                        <div className="mt-2 rounded-2xl overflow-hidden border border-gray-100 aspect-video max-h-40">
                          <img 
                            src={partnerForm.imageUrl} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop';
                            }}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Location Coordinates</label>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-gray-50 rounded-2xl py-3.5 px-4 text-xs font-bold text-gray-400 flex items-center">
                            {partnerForm.latitude ? `${partnerForm.latitude.toFixed(4)}, ${partnerForm.longitude.toFixed(4)}` : 'Not set'}
                          </div>
                          <button 
                            type="button"
                            onClick={handleGetLocation}
                            className="bg-dark text-white px-4 rounded-2xl text-xs font-bold hover:bg-gray-800 transition-colors"
                          >
                            Get GPS
                          </button>
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={loading}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Register Restaurant'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
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

                    <button 
                      disabled={loading}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Join as Partner'}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinWithUs;
