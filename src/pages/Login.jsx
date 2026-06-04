import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronRight, User, MapPin, Building2, Briefcase, Phone, Hash, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../utils/api';
import { clearSessionUser, isAllowedRole, setSessionUser } from '../utils/authSession';
import logo from '../assets/new_logo.png';
import {
  getBarangaysByCityMunicipality,
  getCitiesMunicipalitiesByProvince,
  getCitiesMunicipalitiesByRegion,
  getProvincesByRegion,
  getRegions
} from '../utils/philippinesAddress';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginMethod, setLoginMethod] = useState('password');

  // Registration State
  const [regData, setRegData] = useState({
    first_name: '', last_name: '', email: '', password: '', confirm_password: '',
    contact_number: '', region: '', division: '', province: '',
    city: '', barangay: '', office: 'finance', position: '', 
    account_category: '', passcode: '', verification_code: ''
  });
  const [addressCodes, setAddressCodes] = useState({
    region: '', province: '', city: '', barangay: ''
  });
  const [addressOptions, setAddressOptions] = useState({
    regions: [], provinces: [], cities: [], barangays: []
  });
  const [isAddressLoading, setIsAddressLoading] = useState(false);

  // UI State
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000;

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const loadRegions = async () => {
      setIsAddressLoading(true);
      try {
        const regions = await getRegions();
        setAddressOptions(prev => ({ ...prev, regions }));
      } catch (error) {
        console.error('Failed to load regions', error);
        Swal.fire({
          icon: 'error',
          title: 'Address List Unavailable',
          text: 'Unable to load Philippine address selections. Please check your connection.',
          confirmButtonColor: '#0B3A68',
          customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
      } finally {
        setIsAddressLoading(false);
      }
    };

    loadRegions();
  }, []);

  const handleRegionChange = async (e) => {
    const regionCode = e.target.value;
    const selectedRegion = addressOptions.regions.find(item => item.code === regionCode);

    setRegData(prev => ({
      ...prev,
      region: selectedRegion?.name || '',
      division: '',
      province: '',
      city: '',
      barangay: ''
    }));
    setAddressCodes({ region: regionCode, province: '', city: '', barangay: '' });
    setAddressOptions(prev => ({ ...prev, provinces: [], cities: [], barangays: [] }));

    if (!regionCode) return;

    setIsAddressLoading(true);
    try {
      const provinces = await getProvincesByRegion(regionCode);
      const cities = provinces.length === 0 ? await getCitiesMunicipalitiesByRegion(regionCode) : [];
      setAddressOptions(prev => ({ ...prev, provinces, cities, barangays: [] }));
    } catch (error) {
      console.error('Failed to load provinces/cities', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleProvinceChange = async (e) => {
    const provinceCode = e.target.value;
    const selectedProvince = addressOptions.provinces.find(item => item.code === provinceCode);

    setRegData(prev => ({
      ...prev,
      province: selectedProvince?.name || '',
      city: '',
      barangay: ''
    }));
    setAddressCodes(prev => ({ ...prev, province: provinceCode, city: '', barangay: '' }));
    setAddressOptions(prev => ({ ...prev, cities: [], barangays: [] }));

    if (!provinceCode) return;

    setIsAddressLoading(true);
    try {
      const cities = await getCitiesMunicipalitiesByProvince(provinceCode);
      setAddressOptions(prev => ({ ...prev, cities, barangays: [] }));
    } catch (error) {
      console.error('Failed to load cities/municipalities', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleCityChange = async (e) => {
    const cityCode = e.target.value;
    const selectedCity = addressOptions.cities.find(item => item.code === cityCode);

    setRegData(prev => ({
      ...prev,
      city: selectedCity?.name || '',
      barangay: ''
    }));
    setAddressCodes(prev => ({
      ...prev,
      city: cityCode,
      barangay: ''
    }));
    setAddressOptions(prev => ({ ...prev, barangays: [] }));

    if (!selectedCity) return;

    setIsAddressLoading(true);
    try {
      const barangays = await getBarangaysByCityMunicipality(selectedCity.code);
      setAddressOptions(prev => ({ ...prev, barangays }));
    } catch (error) {
      console.error('Failed to load barangays', error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  const handleBarangayChange = (e) => {
    const barangayCode = e.target.value;
    const selectedBarangay = addressOptions.barangays.find(item => item.code === barangayCode);
    setRegData(prev => ({ ...prev, barangay: selectedBarangay?.name || '' }));
    setAddressCodes(prev => ({ ...prev, barangay: barangayCode }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      if (!email || !password) {
        return Swal.fire({
          icon: 'warning',
          title: 'Missing Fields',
          text: 'Please enter both email and password.',
          confirmButtonColor: '#0B3A68',
          customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
      }

      setIsLoading(true);
      Swal.fire({
        title: 'Authenticating...',
        text: 'Establishing secure connection',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
      });

      try {
        const response = await api.post('/users/login', { email, password, loginMethod });
        const authenticatedUser = response.data.user;

        if (!isAllowedRole(authenticatedUser?.role)) {
          clearSessionUser();
          throw new Error('Only Finance and Super User accounts can access this portal.');
        }

        setSessionUser(authenticatedUser);
        localStorage.setItem('expiryTime', expiryTime);
        localStorage.setItem('division', authenticatedUser.division || '');

        Swal.fire({
          icon: 'success',
          title: 'Authentication Verified',
          text: 'Welcome back to the Finance Portal.',
          timer: 1500,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
        });

        setTimeout(() => navigate('/home'), 1500);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: error.message || 'Invalid credentials provided.',
          confirmButtonColor: '#D31F35',
          customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      if (currentStep < 4) return;
      
      const { first_name, last_name, email: regEmail, password: regPassword, confirm_password, verification_code } = regData;
      if (!first_name || !last_name || !regEmail || !regPassword || !verification_code) {
        return Swal.fire({
          icon: 'warning',
          title: 'Missing Required Fields',
          text: 'Please complete all required fields (Name, Email, Password, Verification Code).',
          confirmButtonColor: '#0B3A68',
          customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
      }

      if (verification_code !== (import.meta.env.VITE_VERIFICATION_CODE || '6registration9')) {
        return Swal.fire({
          icon: 'error',
          title: 'Invalid Verification Code',
          text: 'The admin verification code is incorrect.',
          confirmButtonColor: '#D31F35',
          customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
      }

      if (regPassword !== confirm_password) {
        return Swal.fire({
          icon: 'warning',
          title: 'Password Mismatch',
          text: 'Password and Confirm Password must match.',
          confirmButtonColor: '#0B3A68',
          customClass: { popup: 'rounded-2xl shadow-2xl' }
        });
      }

      setIsLoading(true);
      Swal.fire({
        title: 'Registering...',
        text: 'Creating your administrative account',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
        customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
      });

      try {
        await api.post('/users/register', regData);
        Swal.fire({
          icon: 'success',
          title: 'Registration Successful',
          text: 'Your account has been created. Please log in.',
          timer: 2000,
          showConfirmButton: false,
          customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
        });
        setTimeout(() => toggleAuthMode(), 2000);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          text: error.response?.data?.message || error.message || 'An error occurred during registration.',
          confirmButtonColor: '#D31F35',
          customClass: { popup: 'rounded-2xl shadow-2xl font-sans' }
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setCurrentStep(1);
    setEmail('');
    setPassword('');
    setRegData({
      first_name: '', last_name: '', email: '', password: '', confirm_password: '',
      contact_number: '', region: '', division: '', province: '',
      city: '', barangay: '', office: 'finance', position: '', 
      account_category: '', passcode: '', verification_code: ''
    });
    setAddressCodes({ region: '', province: '', city: '', barangay: '' });
    setAddressOptions(prev => ({ ...prev, provinces: [], cities: [], barangays: [] }));
  };

  const isFilled = (value) => String(value ?? '').trim().length > 0;

  const isStepComplete = () => {
    if (currentStep === 1) {
      return ['first_name', 'last_name', 'email', 'contact_number'].every(field => isFilled(regData[field]));
    }

    if (currentStep === 2) {
      const provinceComplete = addressOptions.provinces.length === 0 || isFilled(regData.province);
      return isFilled(regData.region) && isFilled(regData.division) && provinceComplete && isFilled(regData.city);
    }

    if (currentStep === 3) {
      return ['barangay', 'office', 'position', 'account_category'].every(field => isFilled(regData[field]));
    }

    return ['password', 'confirm_password', 'passcode', 'verification_code'].every(field => isFilled(regData[field]));
  };

  const nextStep = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!isStepComplete()) return;
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const renderSelect = (id, label, value, onChange, icon, options, isReg = false, disabled = false) => {
    const Icon = icon;
    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={id} className="block text-xs font-extrabold text-[var(--ink-soft)] uppercase tracking-wider ml-1">
          {label}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
            <Icon className={`h-4 w-4 ${focusedField === id ? 'text-[var(--brand-navy)]' : 'text-slate-400'}`} />
          </div>
          <select
            id={id}
            name={isReg ? id : undefined}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            disabled={disabled}
            className="brand-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold appearance-none"
          >
            <option value="" disabled>Select {label}</option>
            {options.map((opt, idx) => (
              <option key={opt.code || opt.value || idx} value={opt.code || opt.value || opt}>
                {opt.name || opt.label || opt}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    );
  };

  const renderInput = (id, label, type, value, onChange, icon, placeholder, isReg = false, autocomplete) => {
    const Icon = icon;

    // Auto-determine autocomplete attribute based on ID and form context
    let autoValue = autocomplete;
    if (!autoValue) {
      if (id === 'password') {
        autoValue = isReg ? 'new-password' : 'current-password';
      } else if (id === 'confirm_password' || id === 'passcode') {
        autoValue = 'new-password';
      } else if (id === 'email') {
        autoValue = 'email';
      } else if (id === 'first_name') {
        autoValue = 'given-name';
      } else if (id === 'last_name') {
        autoValue = 'family-name';
      } else if (id === 'contact_number') {
        autoValue = 'tel';
      }
    }

    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={id} className="block text-xs font-extrabold text-[var(--ink-soft)] uppercase tracking-wider ml-1">
          {label}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
            <Icon className={`h-4 w-4 ${focusedField === id ? 'text-[var(--brand-navy)]' : 'text-slate-400'}`} />
          </div>
          <input
            id={id}
            name={isReg ? id : undefined}
            type={id === 'password' && showPassword ? 'text' : type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            autoComplete={autoValue}
            className="brand-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm font-semibold"
            placeholder={placeholder}
          />
          {id === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="brand-focus absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-[var(--brand-navy)] transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden py-8 font-sans sm:py-10">
      <div className="absolute inset-0 z-0 opacity-80">
        <div className="absolute left-[-12%] top-[-24%] h-[760px] w-[760px] rounded-full bg-[var(--brand-navy)]/10 blur-[110px]" />
        <div className="absolute bottom-[-22%] right-[-12%] h-[600px] w-[600px] rounded-full bg-[var(--brand-gold)]/20 blur-[95px]" />
      </div>

      <div className={`brand-card w-full ${isLogin ? 'max-w-[1040px]' : 'max-w-[1220px]'} relative z-10 mx-4 flex flex-col items-stretch overflow-hidden rounded-[var(--radius-xl)] bg-white/82 backdrop-blur-xl transition-all duration-500 ease-in-out ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`academic-grid hidden md:flex ${isLogin ? 'md:w-1/2' : 'md:w-1/3'} relative flex-col justify-between overflow-hidden bg-[var(--brand-navy)] p-12 text-white`}
        >
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--brand-gold)]/24 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 h-1.5 w-full bg-[var(--brand-gold)]"></div>
          <div className="relative z-10">
            <motion.div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white shadow-sm">
                <img src={logo} alt="InsightED Logo" className="h-14 w-14 object-contain" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-white">InsightED</span>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-gold)]">Infrastructure Intelligence</p>
              </div>
            </motion.div>
          </div>
          <motion.div layout className="relative z-10 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              {isLogin ? 'Academic' : 'Join the'} <br />
              <span className="text-[var(--brand-gold)]">
                {isLogin ? 'Finance Portal' : 'Insight Network'}
              </span>
            </h1>
            <p className="text-blue-100/85 text-lg max-w-md font-medium leading-relaxed">
              {isLogin
                ? 'A trusted workspace for monitoring school infrastructure funding, progress, and accountability.'
                : 'Secure your administrative access to monitor and manage departmental resource allocation.'}
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {['Transparent', 'Academic', 'Secure', 'Insightful'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white/90 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </motion.div>
          <div className="relative z-10 text-xs text-blue-100/60 uppercase tracking-widest font-semibold">
            (c) 2026 Department of Education
          </div>
        </motion.div>

        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`app-scroll relative flex max-h-[90vh] w-full flex-col justify-center overflow-y-auto bg-white p-6 sm:p-8 md:p-12 lg:p-14 ${isLogin ? 'md:w-1/2' : 'md:w-2/3'}`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-form' : 'register-form'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-9 flex flex-col items-center">
                <img src={logo} alt="InsightED Logo" className="mb-5 h-20 w-auto object-contain drop-shadow-sm md:h-24" />
                <p className="brand-kicker mb-2">{isLogin ? 'Secure Access' : `Account Setup - Step ${currentStep} of 4`}</p>
                <h2 className="text-center text-3xl font-extrabold tracking-tight text-[var(--ink)]">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="mt-2 max-w-md text-center text-sm font-medium leading-6 text-[var(--muted)]">
                  {isLogin ? 'Please authenticate your administrative account.' : 'Register your details to request system access. Ensure all information is accurate.'}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleAuthSubmit} noValidate>
                {isLogin ? (
                  <>
                    {renderInput('email', 'Email Address', 'email', email, (e) => setEmail(e.target.value), Mail, 'juan.delacruz@deped.gov.ph')}
                    {loginMethod === 'password' 
                      ? renderInput('password', 'Password', 'password', password, (e) => setPassword(e.target.value), Lock, '********')
                      : renderInput('password', '6-Digit Passcode', 'password', password, (e) => setPassword(e.target.value), KeyRound, '123456')}
                    
                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => setLoginMethod(prev => prev === 'password' ? 'passcode' : 'password')} className="brand-focus text-xs font-bold text-[var(--brand-navy)] hover:text-[var(--brand-navy-deep)]">
                        {loginMethod === 'password' ? 'Login via Passcode instead' : 'Login via Password instead'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center group cursor-pointer">
                        <div className="relative flex items-center justify-center w-4 h-4 mr-2">
                          <input type="checkbox" className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded cursor-pointer checked:bg-[var(--brand-navy)] checked:border-[var(--brand-navy)] transition-all" />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Remember device</span>
                      </label>
                      <a href="#" className="brand-focus text-sm font-bold text-[var(--brand-red)] hover:text-red-700 transition-colors">Forgot credentials?</a>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStep === 1 && (
                      <>
                        <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                          <h3 className="brand-kicker">Step 1: Personal Information</h3>
                        </div>
                        {renderInput('first_name', 'First Name', 'text', regData.first_name, handleRegChange, User, 'Juan', true)}
                        {renderInput('last_name', 'Last Name', 'text', regData.last_name, handleRegChange, User, 'Dela Cruz', true)}
                        {renderInput('email', 'Email Address', 'email', regData.email, handleRegChange, Mail, 'juan@deped.gov.ph', true)}
                        {renderInput('contact_number', 'Contact Number', 'text', regData.contact_number, handleRegChange, Phone, '09123456789', true)}
                      </>
                    )}
                    
                    {currentStep === 2 && (
                      <>
                        <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                          <h3 className="brand-kicker">Step 2: Location</h3>
                        </div>
                        {renderSelect('region', 'Region', addressCodes.region, handleRegionChange, MapPin, addressOptions.regions, true, isAddressLoading)}
                        {renderInput('division', 'Division', 'text', regData.division, handleRegChange, Building2, 'Enter division', true)}
                        {renderSelect('province', 'Province', addressCodes.province, handleProvinceChange, MapPin, addressOptions.provinces, true, !addressCodes.region || isAddressLoading || addressOptions.provinces.length === 0)}
                        {renderSelect('city', 'City/Municipality', addressCodes.city, handleCityChange, MapPin, addressOptions.cities, true, !addressCodes.region || isAddressLoading || (addressOptions.provinces.length > 0 && !addressCodes.province))}
                      </>
                    )}

                    {currentStep === 3 && (
                      <>
                        <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                          <h3 className="brand-kicker">Step 3: Role & Assignment</h3>
                        </div>
                        {renderSelect('barangay', 'Barangay', addressCodes.barangay, handleBarangayChange, MapPin, addressOptions.barangays, true, !addressCodes.city || isAddressLoading)}
                        {renderSelect('office', 'Office / Role', regData.office, handleRegChange, Building2, ['finance'], true)}
                        {renderSelect('position', 'Position', regData.position, handleRegChange, Briefcase, ['Accountant I', 'Accountant II', 'Accountant III', 'Admin Officer'], true)}
                        {renderInput('account_category', 'Account Category', 'text', regData.account_category, handleRegChange, Hash, 'Regular', true)}
                      </>
                    )}

                    {currentStep === 4 && (
                      <>
                        <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                          <h3 className="brand-kicker">Step 4: Security</h3>
                        </div>
                        {renderInput('password', 'Password', 'password', regData.password, handleRegChange, Lock, '********', true)}
                        {renderInput('confirm_password', 'Confirm Password', 'password', regData.confirm_password, handleRegChange, Lock, '********', true)}
                        {renderInput('passcode', '6-Digit Passcode', 'password', regData.passcode, handleRegChange, KeyRound, '123456', true)}
                        {renderInput('verification_code', 'Admin Verification Code', 'text', regData.verification_code, handleRegChange, ShieldCheck, 'Enter Code', true)}
                      </>
                    )}
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-4">
                  {isLogin ? (
                    <button type="submit" disabled={isLoading} className="brand-button-primary brand-focus group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-4 text-sm font-extrabold disabled:opacity-70">
                      <span className="relative z-10">Secure Authentication</span>
                      <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                      <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      {currentStep > 1 && (
                        <button type="button" onClick={prevStep} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors">
                          Back
                        </button>
                      )}
                      {currentStep < 4 ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          disabled={!isStepComplete()}
                          className="brand-button-primary brand-focus flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-bold disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                        >
                          Next <ChevronRight className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isLoading || !isStepComplete()}
                          className="brand-button-primary brand-focus flex-1 rounded-xl py-4 font-bold disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none"
                        >
                          Submit Registration
                        </button>
                      )}
                    </div>
                  )}
                </motion.div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                <p className="text-sm font-medium text-slate-500">
                  {isLogin ? 'Unauthorized access is strictly prohibited. ' : 'Already have an administrative account? '}
                  <button onClick={toggleAuthMode} className="brand-focus font-bold text-[var(--brand-gold)] hover:text-amber-600 transition-colors">
                    {isLogin ? 'Request Authorization' : 'Secure Sign In'}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default Login;
