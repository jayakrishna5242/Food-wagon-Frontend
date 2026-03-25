
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Store, 
  User, 
  Phone, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  Image as ImageIcon, 
  Star, 
  DollarSign, 
  Info,
  Clock
} from 'lucide-react';
import { registerPartner } from '../services/api';
import { useAuth } from '../context/AuthContext';

const PRESET_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1000",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1000",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000",
  "https://images.unsplash.com/photo-1473093226795-af9932fe5855?q=80&w=1000"
];

const PartnerRegister: React.FC = () => {
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    cuisines: '',
    password: '',
    fssai: '',
    imageUrl: PRESET_IMAGES[0],
    costForTwo: '500'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { login, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user.role === 'PARTNER') navigate('/partner/dashboard');
      else if (user.role === 'DELIVERY') navigate('/delivery/dashboard');
      else navigate('/');
    }
  }, [user, authLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    // Specific masking for numbers
    if (e.target.name === 'phone' || e.target.name === 'fssai') {
      value = value.replace(/\D/g, '');
      if (e.target.name === 'phone') value = value.slice(0, 10);
      if (e.target.name === 'fssai') value = value.slice(0, 14);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const authResponse = await registerPartner(formData);
      login(authResponse.user);
      navigate('/partner/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  // Step Validation
  const isStep1Valid = useMemo(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
    return formData.ownerName.trim().length >= 3 && emailValid && formData.phone.length === 10 && formData.password.length >= 6;
  }, [formData]);

  const isStep2Valid = useMemo(() => {
    return formData.restaurantName.trim().length >= 3 && formData.city.trim().length >= 2 && formData.address.trim().length >= 10 && formData.fssai.length === 14;
  }, [formData]);

  return (
    <div className="min-h-screen bg-[#0d0f17] flex flex-col relative font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-[#fc8019] rounded-full blur-[150px] opacity-10"></div>
         <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px] opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10 flex flex-col items-center">
        
        <div className="w-full max-w-6xl">
           <Link to="/partner" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Partner Portal
           </Link>

           <div className="flex flex-col lg:flex-row gap-12 items-start">
             
             {/* Left: Registration Form */}
             <div className="flex-1 w-full">
                <div className="bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/5">
                    <div className="bg-gray-50/50 px-8 py-8 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Step {step} of 3</h2>
                            <p className="text-sm text-gray-500 font-medium">
                                {step === 1 && "Create your partner account"}
                                {step === 2 && "Tell us about your restaurant location"}
                                {step === 3 && "Finalize your brand identity"}
                            </p>
                        </div>
                        <div className="w-14 h-14 bg-[#fc8019] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                            <Utensils className="text-white w-8 h-8" />
                        </div>
                      </div>

                      {/* Progress Steps Indicator */}
                      <div className="flex items-center gap-2">
                        {[1, 2, 3].map((s) => (
                           <React.Fragment key={s}>
                             <div className={`h-2 rounded-full transition-all duration-500 ${step === s ? 'flex-[3] bg-[#fc8019]' : step > s ? 'flex-1 bg-green-500' : 'flex-1 bg-gray-200'}`}></div>
                             {s < 3 && <div className="w-2 h-2 rounded-full bg-gray-200"></div>}
                           </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 md:p-10">
                      {error && (
                        <div className="mb-6 bg-red-50 text-red-600 text-sm p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                          <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                          {error}
                        </div>
                      )}

                      <form onSubmit={handleRegister} className="space-y-8">
                          
                          {/* STEP 1: ACCOUNT DETAILS */}
                          {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Full Name</label>
                                    <div className="relative">
                                      <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="Rahul Sharma" />
                                      <User className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Phone Number</label>
                                    <div className="relative">
                                      <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="10-digit number" />
                                      <Phone className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Email Address</label>
                                  <div className="relative">
                                    <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="rahul@restaurant.com" />
                                    <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Login Password</label>
                                  <div className="relative">
                                    <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="••••••••" />
                                    <Lock className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                  </div>
                                  <p className="text-[10px] text-gray-400 mt-2 font-medium">Minimum 6 characters required.</p>
                                </div>

                                <button type="button" disabled={!isStep1Valid} onClick={nextStep} className="w-full bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed">
                                  Next: Business Info <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                          )}

                          {/* STEP 2: BUSINESS DETAILS */}
                          {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                <div>
                                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Restaurant Name</label>
                                  <div className="relative">
                                    <input type="text" name="restaurantName" required value={formData.restaurantName} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="The Sizzling Grill" />
                                    <Store className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">City</label>
                                    <div className="relative">
                                      <input type="text" name="city" required value={formData.city} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="Bangalore" />
                                      <MapPin className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                    </div>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest flex items-center justify-between">
                                      FSSAI License No.
                                      <span title="Food Safety and Standards Authority of India license is mandatory.">
                                        <Info className="w-3 h-3 text-gray-300 cursor-help" />
                                      </span>
                                    </label>
                                    <div className="relative">
                                      <input type="text" name="fssai" required value={formData.fssai} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-bold" placeholder="14-digit license number" />
                                      <FileText className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                    </div>
                                    {formData.fssai.length > 0 && formData.fssai.length < 14 && (
                                      <p className="text-[9px] text-orange-500 font-bold mt-1 uppercase">Enter all 14 digits</p>
                                    )}
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Full Outlet Address</label>
                                  <textarea name="address" required value={formData.address} onChange={handleChange} rows={3} className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] focus:ring-4 focus:ring-[#fc8019]/5 transition-all font-medium" placeholder="Shop No. 42, Green Avenue, MG Road..." />
                                </div>

                                <div className="flex gap-4">
                                  <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">Back</button>
                                  <button type="button" disabled={!isStep2Valid} onClick={nextStep} className="flex-[2] bg-gray-900 text-white font-black py-4 rounded-2xl hover:bg-black transition-all flex justify-center items-center gap-2 group disabled:opacity-50">
                                    Next: Branding <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                  </button>
                                </div>
                            </div>
                          )}

                          {/* STEP 3: BRANDING & VISUALS */}
                          {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Cuisines Offered</label>
                                    <input type="text" name="cuisines" required value={formData.cuisines} onChange={handleChange} className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" placeholder="e.g. Italian, Continental" />
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">Separate with commas.</p>
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 tracking-widest">Cost for Two (₹)</label>
                                    <div className="relative">
                                      <input type="number" name="costForTwo" required value={formData.costForTwo} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold" placeholder="500" />
                                      <DollarSign className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-black text-gray-400 uppercase mb-3 tracking-widest">Choose Cover Photo</label>
                                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                                    {PRESET_IMAGES.map((img, idx) => (
                                      <div 
                                        key={idx} 
                                        onClick={() => setFormData({...formData, imageUrl: img})}
                                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-4 transition-all relative group ${formData.imageUrl === img ? 'border-[#fc8019] scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                      >
                                        <img src={img} className="w-full h-full object-cover" alt="Preset" />
                                        {formData.imageUrl === img && (
                                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                            <CheckCircle2 className="text-white w-6 h-6" />
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                  <div className="relative">
                                    <input type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:border-[#fc8019] transition-all font-bold text-xs" placeholder="Or paste image URL here..." />
                                    <ImageIcon className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                                  </div>
                                </div>

                                <div className="flex gap-4">
                                  <button type="button" onClick={prevStep} className="flex-1 bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">Back</button>
                                  <button type="submit" disabled={loading} className="flex-[2] bg-[#fc8019] text-white font-black py-4 rounded-2xl hover:bg-[#e66f0f] transition-all flex justify-center items-center gap-2 group shadow-xl shadow-orange-500/20 active:scale-95">
                                    {loading ? (
                                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                      <>Start Your Kitchen <CheckCircle2 className="w-5 h-5" /></>
                                    )}
                                  </button>
                                </div>
                            </div>
                          )}
                      </form>

                      <div className="mt-8 text-center text-sm text-gray-500 font-medium">
                        Already registered? <Link to="/login" className="text-[#fc8019] font-bold hover:underline">Sign in to dashboard</Link>
                      </div>
                    </div>
                </div>
             </div>

             {/* Right: Live Preview of Restaurant Card */}
             <div className="hidden lg:block w-80 sticky top-24">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                   Live Card Preview <span className="flex-1 h-[1px] bg-gray-800"></span>
                </h3>
                
                <div className="bg-[#1a1c23] rounded-[32px] p-6 shadow-2xl border border-white/5 animate-in fade-in slide-in-from-right-10 duration-700">
                   <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-lg">
                      <img 
                        src={formData.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000"} 
                        className="w-full h-full object-cover transition-all duration-1000" 
                        alt="Preview"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-3 bg-[#fc8019] text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                         New Store
                      </div>
                   </div>

                   <h4 className="text-xl font-black text-white mb-2 truncate">{formData.restaurantName || "Store Name"}</h4>
                   
                   <div className="flex items-center gap-2 mb-3">
                      <div className="bg-green-600 flex items-center gap-1 px-1.5 py-0.5 rounded text-white text-[10px] font-bold">
                         <Star className="w-3 h-3 fill-white" /> 0.0
                      </div>
                      <span className="text-gray-500 text-[10px] font-black">•</span>
                      <div className="flex items-center gap-1 text-gray-400 text-[10px] font-bold">
                         <Clock className="w-3 h-3" /> 30-40 MINS
                      </div>
                   </div>

                   <p className="text-[11px] text-gray-500 font-bold mb-1 truncate">
                      {formData.cuisines || "Cuisines will appear here"}
                   </p>
                   <p className="text-[11px] text-gray-600 font-medium truncate">
                      {formData.city || "City"} • ₹{formData.costForTwo} for two
                   </p>
                   
                   <div className="mt-6 pt-4 border-t border-white/5">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Visibility</span>
                         <span className="text-green-500 text-[10px] font-black uppercase">Published Live</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 bg-white/5 border border-white/10 rounded-2xl p-4">
                   <p className="text-gray-400 text-xs leading-relaxed italic">
                      "Make sure your brand name and cover photo are appetizing. First impressions are everything for your future customers!"
                   </p>
                </div>
             </div>

           </div>
           
           <p className="text-center text-gray-600 text-[11px] mt-12 font-medium">
              © 2024 FoodWagon Partner Ecosystem. By registering, you agree to our <span className="text-gray-400 underline cursor-pointer">Merchant Terms</span>.
           </p>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegister;
