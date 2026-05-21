import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Moon, HelpCircle, LogOut, ChevronRight, ArrowLeft, Mail, Phone, MapPin, Briefcase, Edit2, Check, X, KeyRound, Eye, EyeOff, Delete } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import insightEdLogo from '../assets/InsightEd1.png';

const items = [
    ['Personal Info', 'Manage account details', User, 'blue'],
    ['Security', 'Privacy & passcode', Shield, 'green'],
    ['Notifications', 'Alerts & updates', Bell, 'yellow'],
    ['Appearance', 'Theme settings', Moon, 'purple'],
    ['Help Center', 'Support & guides', HelpCircle, 'pink'],
];

const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-amber-100 text-amber-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-rose-100 text-rose-600',
};

const MobileDialer = ({ passcode, setPasscode, onVerify, verifying, onCancel }) => {
    const handlePress = (num) => {
        if (passcode.length < 8) setPasscode(prev => prev + num);
    };

    const handleDelete = () => {
        setPasscode(prev => prev.slice(0, -1));
    };

    const handleClear = () => {
        setPasscode('');
    };

    const dots = Array.from({ length: Math.max(6, passcode.length) });

    return (
        <div className="w-full mt-4">
            <div className="flex justify-center gap-3 mb-8 h-4">
                {dots.map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < passcode.length ? 'bg-[#0B2D71] scale-110 shadow-sm' : 'bg-slate-200 border border-slate-300'}`}></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-y-4 gap-x-6 mb-8 px-2 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handlePress(num.toString())} className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-100 hover:border-[#0B2D71] hover:bg-[#0B2D71] hover:text-white text-[#0B2D71] text-3xl font-light transition-all shadow-sm flex items-center justify-center active:scale-95">
                        {num}
                    </button>
                ))}
                <button onClick={handleClear} className="w-16 h-16 mx-auto rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center justify-center text-sm uppercase tracking-wider">
                    Clear
                </button>
                <button onClick={() => handlePress('0')} className="w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-100 hover:border-[#0B2D71] hover:bg-[#0B2D71] hover:text-white text-[#0B2D71] text-3xl font-light transition-all shadow-sm flex items-center justify-center active:scale-95">
                    0
                </button>
                <button onClick={handleDelete} className="w-16 h-16 mx-auto rounded-full text-slate-400 hover:text-[#0B2D71] hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-95">
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCancel} className="flex-1 py-4 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors tracking-wide">
                    CANCEL
                </button>
                <button onClick={() => onVerify(passcode)} disabled={verifying || passcode.length === 0} className="flex-1 py-4 rounded-xl bg-[#E53935] text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-[#E53935] tracking-wide shadow-md">
                    {verifying ? 'VERIFYING...' : 'CONFIRM'}
                </button>
            </div>
        </div>
    );
};

const PasscodeModal = ({ onVerify, onCancel, verifying, error }) => {
    const [passcode, setPasscode] = useState('');

    return (
        <div className="fixed inset-0 bg-[#0B2D71]/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[#FBC02D]"></div>

                <div className="w-16 h-16 bg-[#0B2D71]/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#0B2D71]/10">
                    <LogOut className="w-8 h-8 text-[#0B2D71]" />
                </div>
                <h3 className="text-xl font-extrabold text-[#0B2D71] text-center mb-1">Secure Logout</h3>
                <p className="text-sm text-slate-500 text-center mb-6 font-medium">Enter your DepEd system passcode.</p>

                {error && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[#E53935] text-sm font-bold text-center mb-4 bg-red-50 py-2 px-4 rounded-xl border border-red-100">
                        {error}
                    </motion.p>
                )}

                <MobileDialer passcode={passcode} setPasscode={setPasscode} onVerify={onVerify} verifying={verifying} onCancel={onCancel} />
            </motion.div>
        </div>
    );
};

const DetailView = ({ activeView, onBack, user, loading, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                email: user.email || '',
                contact_number: user.contact_number || '',
                password: '',
                passcode: user.passcode || '',
                confirm_passcode: user.passcode || ''
            });
        }
    }, [user, isEditing]);

    const handleSave = async () => {
        // Validate passcode in Security tab
        if (activeView === 'Security') {
            if (formData.passcode !== formData.confirm_passcode) {
                setError("Passcodes do not match.");
                return;
            }
        }

        setSaving(true);
        setError('');
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;
            if (activeView === 'Personal Info') {
                delete payload.password;
                delete payload.passcode;
                delete payload.confirm_passcode;
            } else if (activeView === 'Security') {
                delete payload.confirm_passcode;
                delete payload.first_name;
                delete payload.last_name;
                delete payload.email;
                delete payload.contact_number;
            }

            const res = await fetch(`http://localhost:5000/api/users/${user.uid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                onUpdateUser(data.data);
                setIsEditing(false);
            } else {
                setError(data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div key="detail-view" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-[2rem] shadow-sm p-6 sm:p-8 min-h-[400px] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-[#0B2D71] transition-colors group">
                    <div className="p-2.5 rounded-2xl bg-slate-50 group-hover:bg-[#0B2D71]/5 transition-colors border border-transparent group-hover:border-[#0B2D71]/10">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Return to Menu</span>
                </button>

                {(activeView === 'Personal Info' || activeView === 'Security') && !loading && user && (
                    <button onClick={() => { setIsEditing(!isEditing); setError(''); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' : 'bg-[#0B2D71] text-white hover:bg-[#0B2D71]/90 hover:shadow-md'}`}>
                        {isEditing ? (
                            <><X className="w-4 h-4" /> Cancel Edit</>
                        ) : (
                            <><Edit2 className="w-4 h-4" /> Edit {activeView.split(' ')[0]}</>
                        )}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="w-1.5 h-6 bg-[#E53935] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-[#0B2D71] tracking-tight">
                    {activeView}
                </h2>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-[#E53935] font-bold rounded-xl text-sm border border-red-100 flex items-center justify-center shadow-sm">
                    {error}
                </div>
            )}

            {activeView === 'Personal Info' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="animate-pulse flex flex-col gap-4">
                            <div className="h-16 bg-slate-50 rounded-2xl w-full border border-slate-100"></div>
                            <div className="h-16 bg-slate-50 rounded-2xl w-full border border-slate-100"></div>
                        </div>
                    ) : user ? (
                        isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">First Name</label>
                                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-slate-50 focus:bg-white" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Number</label>
                                    <input type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-slate-50 focus:bg-white" />
                                </div>

                                <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-2">
                                    <button onClick={handleSave} disabled={saving} className="w-full py-4 rounded-xl bg-[#0B2D71] hover:bg-[#0B2D71]/90 text-white font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-lg shadow-[#0B2D71]/20">
                                        {saving ? 'Saving...' : <><Check className="w-5 h-5" /> Save Personal Details</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[#0B2D71]/20 hover:shadow-lg hover:shadow-[#0B2D71]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[#0B2D71] rounded-xl shrink-0 group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="font-extrabold text-slate-800 capitalize text-base truncate">{user.first_name} {user.last_name}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[#0B2D71]/20 hover:shadow-lg hover:shadow-[#0B2D71]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[#0B2D71] rounded-xl shrink-0 group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="font-extrabold text-slate-800 text-base truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[#0B2D71]/20 hover:shadow-lg hover:shadow-[#0B2D71]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[#0B2D71] rounded-xl shrink-0 group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Position</p>
                                        <p className="font-extrabold text-slate-800 capitalize text-base truncate">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[#0B2D71]/20 hover:shadow-lg hover:shadow-[#0B2D71]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[#0B2D71] rounded-xl shrink-0 group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Number</p>
                                        <p className="font-extrabold text-slate-800 text-base truncate">{user.contact_number || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[#0B2D71]/20 hover:shadow-lg hover:shadow-[#0B2D71]/5 transition-all md:col-span-2 group">
                                    <div className="p-3 bg-slate-50 text-[#0B2D71] rounded-xl shrink-0 group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Official Location</p>
                                        <p className="font-extrabold text-slate-800 capitalize text-base truncate">
                                            {[user.barangay, user.city, user.province, user.region].filter(Boolean).join(', ') || 'Location not specified'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="p-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-center">
                            Failed to load user data.
                        </div>
                    )}
                </div>
            )}

            {activeView === 'Security' && (
                <div className="space-y-6">
                    {loading ? (
                        <div className="animate-pulse h-32 bg-slate-50 rounded-2xl w-full border border-slate-100"></div>
                    ) : user ? (
                        isEditing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Password (Optional)</label>
                                    <input type="password" placeholder="Leave blank to keep current password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-white placeholder:font-normal placeholder:text-sm" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Passcode</label>
                                    <div className="relative">
                                        <input type={showPasscode ? "text" : "password"} value={formData.passcode} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, passcode: val }); }} placeholder="Numbers only" className="w-full p-4 pr-12 rounded-xl border border-slate-200 focus:border-[#0B2D71] focus:ring-1 focus:ring-[#0B2D71] outline-none transition-all font-bold text-[#0B2D71] bg-white tracking-[0.2em]" />
                                        <button onClick={() => setShowPasscode(!showPasscode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0B2D71] transition-colors p-1">
                                            {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Passcode</label>
                                    <input type={showPasscode ? "text" : "password"} value={formData.confirm_passcode} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, confirm_passcode: val }); }} placeholder="Must match" className={`w-full p-4 rounded-xl border focus:ring-1 outline-none transition-all font-bold text-[#0B2D71] bg-white tracking-[0.2em] ${formData.confirm_passcode && formData.passcode !== formData.confirm_passcode ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50' : 'border-slate-200 focus:border-[#0B2D71] focus:ring-[#0B2D71]'}`} />
                                </div>

                                <div className="md:col-span-2 pt-6 border-t border-slate-200 mt-2">
                                    <button onClick={handleSave} disabled={saving || (formData.passcode && formData.passcode !== formData.confirm_passcode)} className="w-full py-4 rounded-xl bg-[#0B2D71] hover:bg-[#0B2D71]/90 text-white font-extrabold tracking-wide flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-[#0B2D71]/20">
                                        {saving ? 'Updating Security...' : <><Check className="w-5 h-5" /> Update Security Credentials</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                <div className="p-6 rounded-2xl bg-white flex items-center justify-between border border-slate-200 shadow-sm group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 text-[#0B2D71] rounded-2xl group-hover:bg-[#E53935] group-hover:text-white transition-colors">
                                            <KeyRound className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Passcode</p>
                                            <p className="font-extrabold text-[#0B2D71] text-2xl tracking-[0.3em]">
                                                {showPasscode ? user.passcode : '••••••'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPasscode(!showPasscode)} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
                                        {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="p-6 rounded-2xl bg-white flex items-center gap-5 border border-slate-200 shadow-sm group">
                                    <div className="p-4 bg-slate-50 text-[#0B2D71] rounded-2xl group-hover:bg-[#0B2D71] group-hover:text-white transition-colors">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Password</p>
                                        <p className="font-extrabold text-slate-800 text-lg tracking-[0.2em]">••••••••</p>
                                        <p className="text-xs font-semibold text-emerald-500 mt-1 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> Secured with bcrypt
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : null}
                </div>
            )}

            {activeView !== 'Personal Info' && activeView !== 'Security' && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100 shadow-sm">
                        <Shield className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Settings for {activeView}</h3>
                    <p className="text-slate-500 font-medium text-sm mt-3 max-w-sm leading-relaxed">
                        This section is currently under development. The professional UI framework is in place for future integration.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeView, setActiveView] = useState(null);

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [verifyingLogout, setVerifyingLogout] = useState(false);
    const [logoutError, setLogoutError] = useState('');

    const userId = '01a6595d-9e55-45da-babf-0faa0527914e';

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/${userId}`);
                const data = await res.json();
                setUser(data?.data || data);
            } catch (error) {
                console.error("Failed to fetch user:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const getInitials = () => {
        if (!user) return '??';
        return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
    };

    const handleLogoutSubmit = async (passcode) => {
        setVerifyingLogout(true);
        setLogoutError('');
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}/verify-passcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode })
            });
            const data = await res.json();
            if (data.success) {
                localStorage.clear();
                window.location.href = '/';
            } else {
                setLogoutError(data.message || 'Invalid passcode.');
            }
        } catch (error) {
            setLogoutError('Network error occurred.');
        } finally {
            setVerifyingLogout(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24 overflow-hidden relative font-sans">
            <Sidebar />

            {/* Official DepEd Themed Header */}
            <div className="bg-[#0B2D71] px-6 pt-8 pb-20 rounded-b-[2.5rem] relative overflow-hidden shadow-xl border-b-4 border-[#E53935]">
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FBC02D] rounded-full blur-[100px] opacity-10 -mr-20 -mt-32 pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10 max-w-5xl mx-auto">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-white/10 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner border border-white/20 backdrop-blur-md">
                            {loading ? '...' : getInitials()}
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize tracking-tight drop-shadow-sm">
                                {loading ? 'Loading...' : `${user?.first_name || ''} ${user?.last_name || ''}`}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[#FBC02D] shadow-[0_0_8px_rgba(251,192,45,0.8)]"></span>
                                <p className="text-[#FBC02D] text-sm sm:text-base capitalize font-bold tracking-wide">
                                    {loading ? '...' : (user?.role?.replace('_', ' ') || user?.position || 'Guest')}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <img src={insightEdLogo} alt="InsightEd Logo" className="h-20 object-contain drop-shadow-2xl opacity-95" />
                    </div>
                </div>
            </div>

            <div className="p-5 -mt-10 relative max-w-5xl mx-auto z-20">
                <AnimatePresence mode="wait">
                    {activeView === null ? (
                        <motion.div key="menu-list" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 35 }} className="space-y-4">
                            <div className="bg-white rounded-[2rem] shadow-sm p-4 sm:p-5 space-y-3 border border-slate-100">
                                {items.map(([title, sub, Icon, color]) => (
                                    <button key={title} onClick={() => setActiveView(title)} className="w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-transparent hover:border-[#0B2D71]/10 hover:bg-slate-50 transition-all group hover:shadow-sm" >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[1rem] flex items-center justify-center ${colors[color]} shadow-sm group-hover:scale-105 transition-transform`}>
                                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>

                                            <div className="text-left">
                                                <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{title}</h3>
                                                <p className="text-[12px] sm:text-[13px] font-medium text-slate-400 mt-0.5">{sub}</p>
                                            </div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#0B2D71] group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border border-red-100 hover:border-red-300 hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 rounded-[1rem] bg-red-50 flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[#E53935] group-hover:text-white text-[#E53935] transition-all">
                                        <LogOut className="w-6 h-6" />
                                    </div>

                                    <div className="text-left">
                                        <h3 className="text-base font-extrabold text-[#E53935]">Secure System Logout</h3>
                                        <p className="text-[13px] font-medium text-red-400 mt-0.5">Verify passcode to terminate active session</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-red-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all relative z-10" />
                            </button>
                        </motion.div>
                    ) : (
                        <DetailView key={`view-${activeView}`} activeView={activeView} onBack={() => setActiveView(null)} user={user} loading={loading} onUpdateUser={(updated) => setUser({ ...user, ...updated })} />
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showLogoutModal && (
                    <PasscodeModal onVerify={handleLogoutSubmit} onCancel={() => { setShowLogoutModal(false); setLogoutError(''); }} verifying={verifyingLogout} error={logoutError} />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;