import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ChevronRight, User, MapPin, Building2, Briefcase, Phone, Hash, KeyRound } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../utils/api';
import logo from '../assets/InsightEd1.png';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Registration State
  const [regData, setRegData] = useState({
    first_name: '', last_name: '', email: '', password: '', 
    contact_number: '', region: '', division: '', province: '', 
    city: '', barangay: '', office: '', position: '', 
    account_category: '', passcode: '', verification_code: ''
  });

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const expiryTime = new Date().getTime() + 3 * 60 * 60 * 1000;

  const handleRegChange = (e) => {
    setRegData({ ...regData, [e.target.name]: e.target.value });
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
        const response = await api.post('/users/login', { email, password });
        localStorage.setItem('expiryTime', expiryTime);
        localStorage.setItem('user', response.data.user.uid);
        localStorage.setItem('role', response.data.user.role);
        localStorage.setItem('division', response.data.user.division);

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
      const { first_name, last_name, email: regEmail, password: regPassword, verification_code } = regData;
      if (!first_name || !last_name || !regEmail || !regPassword || !verification_code) {
        return Swal.fire({
          icon: 'warning',
          title: 'Missing Required Fields',
          text: 'Please complete all required fields (Name, Email, Password, Verification Code).',
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
    setEmail('');
    setPassword('');
    setRegData({
      first_name: '', last_name: '', email: '', password: '', 
      contact_number: '', region: '', division: '', province: '', 
      city: '', barangay: '', office: '', position: '', 
      account_category: '', passcode: '', verification_code: ''
    });
  };

  const renderInput = (id, label, type, value, onChange, icon, placeholder, isReg = false) => {
    const Icon = icon;
    return (
      <div className="space-y-1.5 w-full">
        <label htmlFor={id} className="block text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
          {label}
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
            <Icon className={`h-4 w-4 ${focusedField === id ? 'text-[#0B3A68]' : 'text-slate-400'}`} />
          </div>
          <input
            id={id}
            name={isReg ? id : undefined}
            type={id === 'password' && showPassword ? 'text' : type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocusedField(id)}
            onBlur={() => setFocusedField(null)}
            className="block w-full pl-10 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#0B3A68]/20 focus:border-[#0B3A68] text-sm text-slate-800 font-medium transition-all duration-300 outline-none shadow-sm hover:border-slate-300"
            placeholder={placeholder}
          />
          {id === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center justify-center text-slate-400 hover:text-[#0B3A68] transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden font-sans selection:bg-[#0B3A68] selection:text-white py-10">
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-gradient-to-br from-[#0B3A68]/10 to-transparent rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-[#FDC115]/15 to-transparent rounded-full blur-[80px]" />
        <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] bg-gradient-to-l from-[#D31F35]/5 to-transparent rounded-full blur-[60px]" />
      </div>

      <div className={`w-full ${isLogin ? 'max-w-[1000px]' : 'max-w-[1200px]'} mx-auto p-4 relative z-10 flex flex-col items-stretch shadow-2xl rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl border border-white/50 transition-all duration-500 ease-in-out ${isLogin ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
        
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`hidden md:flex ${isLogin ? 'md:w-1/2' : 'md:w-1/3'} bg-gradient-to-br from-[#0B3A68] to-[#06213D] p-12 flex-col justify-between relative overflow-hidden text-white`}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <motion.div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-xl backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-[#FDC115]" />
              </div>
              <span className="text-xl font-bold tracking-wider uppercase text-white/90">InsightED</span>
            </motion.div>
          </div>
          <motion.div layout className="relative z-10 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
              {isLogin ? 'Finance' : 'Join the'} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FDC115] to-[#fde08b]">
                {isLogin ? 'Command Center' : 'Network'}
              </span>
            </h1>
            <p className="text-blue-100/80 text-lg max-w-md font-light leading-relaxed">
              {isLogin
                ? 'Enterprise-grade financial oversight and resource allocation for the Department of Education.'
                : 'Secure your administrative access to monitor and manage departmental resource allocation.'}
            </p>
          </motion.div>
          <div className="relative z-10 text-xs text-blue-200/50 uppercase tracking-widest font-semibold">
            © 2026 Department of Education
          </div>
        </motion.div>

        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`w-full ${isLogin ? 'md:w-1/2' : 'md:w-2/3'} bg-white p-8 md:p-14 lg:p-16 flex flex-col justify-center relative max-h-[90vh] overflow-y-auto custom-scrollbar`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login-form' : 'register-form'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center mb-10">
                <img src={logo} alt="InsightEd Logo" className="h-16 md:h-20 lg:h-24 w-auto object-contain mb-6 drop-shadow-md" />
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm font-medium text-slate-500 mt-2 text-center">
                  {isLogin ? 'Please authenticate your administrative account.' : 'Register your details to request system access. Ensure all information is accurate.'}
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleAuthSubmit}>
                {isLogin ? (
                  <>
                    {renderInput('email', 'Email Address', 'email', email, (e) => setEmail(e.target.value), Mail, 'juan.delacruz@deped.gov.ph')}
                    {renderInput('password', 'Password', 'password', password, (e) => setPassword(e.target.value), Lock, '••••••••')}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center group cursor-pointer">
                        <div className="relative flex items-center justify-center w-4 h-4 mr-2">
                          <input type="checkbox" className="peer appearance-none w-4 h-4 border-2 border-slate-300 rounded cursor-pointer checked:bg-[#0B3A68] checked:border-[#0B3A68] transition-all" />
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none">
                            <path d="M3 8L6 11L11 3.5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"></path>
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Remember device</span>
                      </label>
                      <a href="#" className="text-sm font-bold text-[#D31F35] hover:text-[#a01627] transition-colors">Forgot credentials?</a>
                    </div>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mb-2">
                      <h3 className="text-sm font-bold text-[#0B3A68] uppercase tracking-wider">Personal Information</h3>
                    </div>
                    {renderInput('first_name', 'First Name', 'text', regData.first_name, handleRegChange, User, 'Juan', true)}
                    {renderInput('last_name', 'Last Name', 'text', regData.last_name, handleRegChange, User, 'Dela Cruz', true)}
                    {renderInput('email', 'Email Address', 'email', regData.email, handleRegChange, Mail, 'juan@deped.gov.ph', true)}
                    {renderInput('contact_number', 'Contact Number', 'text', regData.contact_number, handleRegChange, Phone, '09123456789', true)}
                    
                    <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
                      <h3 className="text-sm font-bold text-[#0B3A68] uppercase tracking-wider">Location & Assignment</h3>
                    </div>
                    {renderInput('region', 'Region', 'text', regData.region, handleRegChange, MapPin, 'NCR', true)}
                    {renderInput('division', 'Division', 'text', regData.division, handleRegChange, Building2, 'Manila', true)}
                    {renderInput('province', 'Province', 'text', regData.province, handleRegChange, MapPin, 'Metro Manila', true)}
                    {renderInput('city', 'City/Municipality', 'text', regData.city, handleRegChange, MapPin, 'Manila City', true)}
                    {renderInput('barangay', 'Barangay', 'text', regData.barangay, handleRegChange, MapPin, 'Brgy 1', true)}
                    
                    <div className="col-span-1 md:col-span-2 border-b border-slate-100 pb-2 mt-4 mb-2">
                      <h3 className="text-sm font-bold text-[#0B3A68] uppercase tracking-wider">Role & Security</h3>
                    </div>
                    {renderInput('office', 'Office', 'text', regData.office, handleRegChange, Building2, 'Finance Division', true)}
                    {renderInput('position', 'Position', 'text', regData.position, handleRegChange, Briefcase, 'Accountant I', true)}
                    {renderInput('account_category', 'Account Category', 'text', regData.account_category, handleRegChange, Hash, 'Regular', true)}
                    {renderInput('password', 'Password', 'password', regData.password, handleRegChange, Lock, '••••••••', true)}
                    {renderInput('passcode', '6-Digit Passcode', 'password', regData.passcode, handleRegChange, KeyRound, '123456', true)}
                    {renderInput('verification_code', 'Admin Verification Code', 'text', regData.verification_code, handleRegChange, ShieldCheck, 'Enter Code', true)}
                  </div>
                )}

                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-4">
                  <button type="submit" disabled={isLoading} className="group w-full flex items-center justify-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-[0_8px_16px_-6px_rgba(11,58,104,0.3)] text-sm font-bold text-white bg-gradient-to-r from-[#0B3A68] to-[#092a4a] hover:shadow-[0_12px_20px_-8px_rgba(11,58,104,0.4)] hover:to-[#0B3A68] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0B3A68] transition-all duration-300 overflow-hidden relative">
                    <span className="relative z-10">{isLogin ? 'Secure Authentication' : 'Submit Registration'}</span>
                    <ChevronRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                  </button>
                </motion.div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
                <p className="text-sm font-medium text-slate-500">
                  {isLogin ? 'Unauthorized access is strictly prohibited. ' : 'Already have an administrative account? '}
                  <button onClick={toggleAuthMode} className="font-bold text-[#FDC115] hover:text-[#d4a00a] transition-colors focus:outline-none">
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
