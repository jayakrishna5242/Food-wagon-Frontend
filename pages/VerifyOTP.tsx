
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Utensils, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const PRIMARY = 'bg-[#fc8019]';
const PRIMARY_HOVER = 'hover:bg-[#e66f0f]';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();

  const phoneNumber = location.state?.phone || 'your phone number';
  const userData = location.state?.userData;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    const newOtp = [...otp];
    pastedData.forEach((char, index) => {
      if (!isNaN(Number(char))) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);
    
    // Focus the last filled input or the next empty one
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length < 6) {
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, you'd call verifyOTP(phoneNumber, otpString)
      // For demo purposes, any 6 digit code works
      
      if (userData) {
        login(userData);
        showToast('Verification successful!', 'success');
        navigate('/');
      } else {
        // If we don't have user data (e.g. direct access), just show success and go home
        showToast('Verification successful!', 'success');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      showToast('OTP resent successfully!', 'success');
    } catch (err: any) {
      showToast('Failed to resend OTP. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
      >
        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-8">
            <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#fc8019] rounded-lg flex items-center justify-center">
                <Utensils className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-black">FoodWagon</span>
            </div>
            <div className="w-9" /> {/* Spacer */}
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-black text-black mb-3">Verify Phone Number</h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              We've sent a 6-digit verification code to <br />
              <span className="font-bold text-black">+91 {phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-xl font-bold border-2 rounded-xl focus:border-[#fc8019] focus:ring-4 focus:ring-[#fde2cd] outline-none transition-all bg-gray-50 text-black"
                />
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm font-medium justify-center bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className={`w-full py-4 rounded-xl text-white text-sm font-black uppercase tracking-widest shadow-xl transition transform active:scale-[0.98] flex items-center justify-center gap-2 ${
                  otp.join('').length === 6 ? `${PRIMARY} ${PRIMARY_HOVER} shadow-orange-500/20` : 'bg-gray-300 cursor-not-allowed shadow-none'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Proceed
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-xs text-gray-500 font-medium">
                    Resend code in <span className="text-[#fc8019] font-bold">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-xs text-[#fc8019] font-black hover:underline uppercase tracking-wider"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
          <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest leading-relaxed">
            By proceeding, you agree to FoodWagon's <br />
            <span className="text-gray-600 underline cursor-pointer">Terms of Service</span> & <span className="text-gray-600 underline cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
