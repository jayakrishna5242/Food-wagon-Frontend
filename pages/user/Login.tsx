
import React, { useMemo, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginUser, registerUser } from '../../services/api';
import { X, Utensils, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const PRIMARY = 'bg-[#fc8019]';
const PRIMARY_HOVER = 'hover:bg-[#e66f0f]';

// Stricter Email Regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
// Password must contain at least one letter and one number
const PWD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form States
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [usePhone, setUsePhone] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referral, setReferral] = useState('');
  const [showReferral, setShowReferral] = useState(false);

  // Validation States
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from || '/';

  // Field Validations
  const emailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);
  const phoneValid = useMemo(() => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  }, [phone]);
  const passwordValid = useMemo(() => PWD_REGEX.test(password), [password]);
  const passwordsMatch = useMemo(() => password === confirmPassword, [password, confirmPassword]);
  const nameValid = useMemo(() => name.trim().length >= 3, [name]);

  const step1Valid = useMemo(() => nameValid && emailValid && phoneValid, [nameValid, emailValid, phoneValid]);
  const step2Valid = useMemo(() => passwordValid && passwordsMatch, [passwordValid, passwordsMatch]);

  const formValid = useMemo(() => {
    if (isLogin) {
      return usePhone ? phoneValid && password.length >= 6 : emailValid && password.length >= 6;
    } else {
      return step1Valid && step2Valid;
    }
  }, [isLogin, usePhone, emailValid, phoneValid, step1Valid, step2Valid, password]);

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleNextStep = () => {
    if (step1Valid) {
      setSignupStep(2);
    } else {
      setTouched({ name: true, email: true, phone: true });
    }
  };

  const handlePrevStep = () => {
    setSignupStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Final check before submission
    if (!formValid) {
      setTouched({
        name: true,
        email: true,
        phone: true,
        password: true,
        confirmPassword: true
      });
      setError('Please fix the errors in the form.');
      return;
    }

    setLoading(true);
    try {
      let authResponse;
      const identifier = usePhone ? phone : email;

      if (isLogin) {
        authResponse = await loginUser(identifier, password);
        
        // Check verification status for partners and delivery boys
        if ((authResponse.user.role === 'PARTNER' || authResponse.user.role === 'DELIVERY') && !authResponse.user.isVerified) {
          // Allow login but they will be restricted in the dashboard
          // Or we can prevent login entirely. The user said "until then they can only view their profile and details"
          // This implies they CAN login but have limited access.
          // My dashboard updates already handle this.
        }
        
        showToast(`Welcome back, ${authResponse.user.name}!`, 'success');
      } else {
        authResponse = await registerUser(name.trim(), email.trim(), phone.trim(), password);
        showToast(`Account created successfully! Welcome to FoodWagon.`, 'success');
      }
      
      login(authResponse.user);
      
      // Role-based redirection
      if (authResponse.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (authResponse.user.role === 'PARTNER') {
        navigate('/partner/dashboard');
      } else if (authResponse.user.role === 'DELIVERY') {
        navigate('/delivery/dashboard');
      } else {
        navigate(from);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setSignupStep(1);
    setError('');
    setShowReferral(false);
    setTouched({});
    setPassword('');
    setConfirmPassword('');
  };

  const inputClass = (field: string, isValid: boolean) => {
    const base = 'w-full px-4 py-3 border rounded-md outline-none text-sm text-black transition focus:ring-2 focus:ring-[#fde2cd]';
    if (touched[field] && !isValid) {
      return `${base} border-red-500 bg-red-50`;
    }
    if (touched[field] && isValid) {
      return `${base} border-green-500 focus:border-green-500`;
    }
    return `${base} border-gray-200 focus:border-[#fc8019]`;
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      <div className="w-full lg:w-[42%] flex flex-col p-6 md:p-10 lg:p-16">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#fc8019] rounded-xl flex items-center justify-center shadow-md">
              <Utensils className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="font-extrabold text-xl md:text-2xl tracking-tight text-black">
              FoodWagon
            </span>
          </Link>
          <Link
            to="/"
            aria-label="Close"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 md:w-6 md:h-6 text-black" />
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <h1 className="text-2xl md:text-4xl font-extrabold text-black mb-1 md:mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-xs md:text-sm text-[#4b5563] mb-4 md:mb-6">
            {isLogin
              ? 'Sign in to order from your favourite restaurants.'
              : `Step ${signupStep} of 2: ${signupStep === 1 ? 'Personal details' : 'Security details'}`}
          </p>

          <div className="mt-2 md:mt-4 bg-white rounded-2xl shadow-xl border border-[#f3f4f6] p-5 md:p-7">
            {!isLogin && (
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#fc8019] transition-all duration-500 ease-out"
                    style={{ width: signupStep === 1 ? '50%' : '100%' }}
                  ></div>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                  {signupStep}/2 Steps
                </span>
              </div>
            )}

            <div aria-live="polite" className="min-h-[1.2rem]">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm p-3 border border-red-100 rounded mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isLogin ? (
                <>
                  <div className="flex items-center gap-3 text-xs font-semibold text-gray-700">
                    <span className="text-[11px] uppercase text-gray-500">Method</span>
                    <button
                      type="button"
                      onClick={() => {setUsePhone(false); setTouched({});}}
                      className={`px-3 py-1.5 rounded-full border text-xs transition ${!usePhone ? 'bg-[#fff4eb] border-[#f97316] text-[#b45309]' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => {setUsePhone(true); setTouched({});}}
                      className={`px-3 py-1.5 rounded-full border text-xs transition ${usePhone ? 'bg-[#fff4eb] border-[#f97316] text-[#b45309]' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                      Phone
                    </button>
                  </div>

                  {!usePhone ? (
                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-black mb-1">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onBlur={() => handleBlur('email')}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className={inputClass('email', emailValid)}
                      />
                      {touched.email && !emailValid && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">Please enter a valid email address.</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-black mb-1">
                        Phone number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={phone}
                        onBlur={() => handleBlur('phone')}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit number"
                        required
                        className={inputClass('phone', phoneValid)}
                      />
                      {touched.phone && !phoneValid && (
                        <p className="text-[10px] text-red-500 mt-1 font-bold">Enter a valid 10-digit phone number.</p>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <label htmlFor="password" className="block text-xs font-semibold text-black mb-1">
                      Password
                    </label>
                    <div className="flex items-center relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onBlur={() => handleBlur('password')}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        className={inputClass('password', password.length >= 6)}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-800"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#fc8019] focus:ring-[#fc8019]"
                      />
                      <span className="text-xs text-[#334155] font-medium">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-xs text-[#fc8019] font-bold hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !formValid}
                    className={`w-full py-3.5 rounded-md text-white text-sm font-black uppercase tracking-wider shadow-lg transition transform active:scale-[0.98] ${
                      formValid ? `${PRIMARY} ${PRIMARY_HOVER} shadow-orange-500/20` : 'bg-gray-300 cursor-not-allowed shadow-none'
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Checking...
                      </span>
                    ) : 'Login'}
                  </button>
                </>
              ) : (
                <>
                  {signupStep === 1 ? (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div>
                        <label htmlFor="name" className="block text-xs font-semibold text-black mb-1">
                          Full name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onBlur={() => handleBlur('name')}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter your name"
                          required
                          className={inputClass('name', nameValid)}
                        />
                        {touched.name && !nameValid && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">Please enter at least 3 characters.</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-black mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onBlur={() => handleBlur('email')}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          required
                          className={inputClass('email', emailValid)}
                        />
                        {touched.email && !emailValid && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">Please enter a valid email address.</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-xs font-semibold text-black mb-1">
                          Phone number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onBlur={() => handleBlur('phone')}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit number"
                          required
                          className={inputClass('phone', phoneValid)}
                        />
                        {touched.phone && !phoneValid && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">Enter a valid 10-digit phone number.</p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleNextStep}
                        disabled={!step1Valid}
                        className={`w-full py-3.5 rounded-md text-white text-sm font-black uppercase tracking-wider shadow-lg transition transform active:scale-[0.98] ${
                          step1Valid ? `${PRIMARY} ${PRIMARY_HOVER} shadow-orange-500/20` : 'bg-gray-300 cursor-not-allowed shadow-none'
                        }`}
                      >
                        Next Step
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                      <div className="relative">
                        <label htmlFor="password" className="block text-xs font-semibold text-black mb-1">
                          Create Password
                        </label>
                        <div className="flex items-center relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onBlur={() => handleBlur('password')}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                            className={inputClass('password', passwordValid)}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            className="absolute right-3 inline-flex items-center justify-center p-1 text-gray-400 hover:text-gray-800"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {touched.password && !passwordValid && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">At least 8 chars with 1 letter and 1 number.</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-black mb-1">
                          Confirm Password
                        </label>
                        <input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onBlur={() => handleBlur('confirmPassword')}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          className={inputClass('confirmPassword', passwordsMatch && confirmPassword.length > 0)}
                        />
                        {touched.confirmPassword && !passwordsMatch && (
                          <p className="text-[10px] text-red-500 mt-1 font-bold">Passwords do not match.</p>
                        )}
                      </div>

                      <div>
                        {!showReferral ? (
                          <button
                            type="button"
                            onClick={() => setShowReferral(true)}
                            className="text-xs text-[#fc8019] font-semibold hover:underline"
                          >
                            Have a referral code?
                          </button>
                        ) : (
                          <>
                            <label className="block text-xs font-semibold text-black mb-1 mt-1">
                              Referral code (optional)
                            </label>
                            <input
                              type="text"
                              value={referral}
                              onChange={(e) => setReferral(e.target.value)}
                              placeholder="Enter referral code"
                              className="w-full px-4 py-3 border border-gray-200 rounded-md outline-none text-sm text-black transition focus:border-[#fc8019]"
                            />
                          </>
                        )}
                      </div>

                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 py-3.5 rounded-md border border-gray-200 text-gray-600 text-sm font-black uppercase tracking-wider hover:bg-gray-50 transition"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !formValid}
                          className={`flex-[2] py-3.5 rounded-md text-white text-sm font-black uppercase tracking-wider shadow-lg transition transform active:scale-[0.98] ${
                            formValid ? `${PRIMARY} ${PRIMARY_HOVER} shadow-orange-500/20` : 'bg-gray-300 cursor-not-allowed shadow-none'
                          }`}
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Creating...
                            </span>
                          ) : 'Create account'}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2 text-center">
                <p className="text-sm text-[#4b5563] font-medium">
                  {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-[#fc8019] font-black hover:underline ml-1"
                  >
                    {isLogin ? 'Sign up' : 'Login'}
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden lg:block lg:w-[58%] relative">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=2070&auto=format&fit=crop"
            className="w-full h-full object-cover brightness-90"
            alt="Delicious food"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-l from-black/55 to-transparent" />
        <div className="absolute left-20 bottom-28 text-white max-w-lg">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight drop-shadow-lg mb-4">
            Order food & groceries
          </h2>
          <p className="text-xl mt-1 font-medium drop-shadow-md opacity-90 leading-relaxed">
            From the best restaurants in town to your doorstep, within minutes.
          </p>
          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => navigate('/')}
              className="px-8 py-4 rounded-xl bg-white text-black font-black shadow-xl hover:bg-gray-100 transition-all flex items-center gap-2 group"
            >
              Explore restaurants
              <CheckCircle2 className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
