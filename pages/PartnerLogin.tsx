
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../context/ToastContext';

const PartnerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login
    setTimeout(() => {
      setLoading(false);
      showToast('Welcome back, Partner!', 'success');
      navigate('/partner/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0d0f17] flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -ml-48 -mb-48"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#fc8019] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/20">
            <Store className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Partner Login</h1>
          <p className="text-gray-400 font-medium">Manage your restaurant with ease</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="partner@restaurant.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="text-sm font-bold text-gray-300">Password</label>
              <Link to="/forgot-password" title="Forgot Password" className="text-xs font-bold text-primary hover:underline">Forgot Password?</Link>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:bg-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/10 text-center">
          <p className="text-gray-400 font-medium">
            New to FoodWagon? {' '}
            <Link to="/partner/register" title="Register" className="text-primary font-black hover:underline">Register Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PartnerLogin;
