
import React, { useState } from 'react';
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
import { registerPartner } from '../../src/partner/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion } from 'motion/react';

const PartnerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
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
