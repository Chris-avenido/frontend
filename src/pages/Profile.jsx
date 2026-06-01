import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield, Bell, Moon, HelpCircle, LogOut, ChevronRight, ArrowLeft, Mail, Phone, MapPin, Briefcase, Edit2, Check, X, KeyRound, Eye, EyeOff, Delete } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import insightEdLogo from '../assets/new_logo.png';
import { BASE_URL } from '../utils/api';
import { clearSessionUser, getSessionUser } from '../utils/authSession';
const items = [
    ['Personal Info', 'Manage account details', User, 'blue'],
    ['Security', 'Privacy & passcode', Shield, 'green'],
    ['Notifications', 'Alerts & updates', Bell, 'yellow'],
    ['Appearance', 'Theme settings', Moon, 'purple'],
    ['Help Center', 'Support & guides', HelpCircle, 'pink'],
];

const colors = {
    blue: 'bg-[var(--brand-sky)] text-[var(--brand-navy)]',
    green: 'bg-emerald-100 text-emerald-600',
    yellow: 'bg-[var(--brand-gold-soft)] text-[var(--brand-navy)]',
    purple: 'bg-indigo-50 text-indigo-600',
    pink: 'bg-[var(--brand-red-soft)] text-[var(--brand-red)]',
};

const getUserFormData = (user) => ({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    contact_number: user?.contact_number || '',
    password: '',
    passcode: user?.passcode || '',
    confirm_passcode: user?.passcode || ''
});

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
                    <div key={i} className={`w-4 h-4 rounded-full transition-all duration-300 ${i < passcode.length ? 'bg-[var(--brand-navy)] scale-110 shadow-sm' : 'bg-slate-200 border border-slate-300'}`}></div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-y-4 gap-x-6 mb-8 px-2 max-w-[280px] mx-auto">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <button key={num} onClick={() => handlePress(num.toString())} className="brand-focus w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-100 hover:border-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white text-[var(--brand-navy)] text-3xl font-light transition-all shadow-sm flex items-center justify-center active:scale-95">
                        {num}
                    </button>
                ))}
                <button onClick={handleClear} className="w-16 h-16 mx-auto rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 font-bold transition-colors flex items-center justify-center text-sm uppercase tracking-wider">
                    Clear
                </button>
                <button onClick={() => handlePress('0')} className="brand-focus w-16 h-16 mx-auto rounded-full bg-slate-50 border border-slate-100 hover:border-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white text-[var(--brand-navy)] text-3xl font-light transition-all shadow-sm flex items-center justify-center active:scale-95">
                    0
                </button>
                <button onClick={handleDelete} className="brand-focus w-16 h-16 mx-auto rounded-full text-slate-400 hover:text-[var(--brand-navy)] hover:bg-slate-100 transition-colors flex items-center justify-center active:scale-95">
                    <Delete className="w-6 h-6" />
                </button>
            </div>

            <div className="flex gap-3 mt-4">
                <button onClick={onCancel} className="brand-button-secondary brand-focus flex-1 py-4 rounded-xl font-bold tracking-wide">
                    CANCEL
                </button>
                <button onClick={() => onVerify(passcode)} disabled={verifying || passcode.length === 0} className="brand-focus flex-1 py-4 rounded-xl bg-[var(--brand-red)] text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50 tracking-wide shadow-md">
                    {verifying ? 'VERIFYING...' : 'CONFIRM'}
                </button>
            </div>
        </div>
    );
};

const PasscodeModal = ({ onVerify, onCancel, verifying, error }) => {
    const [passcode, setPasscode] = useState('');

    return (
        <div className="fixed inset-0 bg-[var(--brand-navy)]/65 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-t-[2.5rem] sm:rounded-[var(--radius-xl)] p-8 w-full max-w-sm shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-[var(--brand-gold)]"></div>

                <div className="w-16 h-16 bg-[var(--brand-sky)] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[var(--line)]">
                    <LogOut className="w-8 h-8 text-[var(--brand-navy)]" />
                </div>
                <h3 className="text-xl font-extrabold text-[var(--brand-navy)] text-center mb-1">Secure Logout</h3>
                <p className="text-sm text-slate-500 text-center mb-6 font-medium">Enter your DepEd system passcode.</p>

                {error && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[var(--brand-red)] text-sm font-bold text-center mb-4 bg-[var(--brand-red-soft)] py-2 px-4 rounded-xl border border-red-100">
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
    const [formData, setFormData] = useState(() => getUserFormData(user));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [showPasscode, setShowPasscode] = useState(false);

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

            const res = await fetch(`${BASE_URL}/users/${user.uid}`, {
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
            console.error('Failed to update profile', err);
            setError('Network error occurred');
        } finally {
            setSaving(false);
        }
    };

    return (
        <motion.div key="detail-view" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -50, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="bg-white rounded-[2rem] shadow-sm p-6 sm:p-8 min-h-[400px] border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <button onClick={onBack} className="brand-focus flex items-center gap-3 text-slate-400 hover:text-[var(--brand-navy)] transition-colors group">
                    <div className="p-2.5 rounded-2xl bg-slate-50 group-hover:bg-[var(--brand-sky)] transition-colors border border-transparent group-hover:border-[var(--line)]">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-sm tracking-wide">Return to Menu</span>
                </button>

                {(activeView === 'Personal Info' || activeView === 'Security') && !loading && user && (
                    <button onClick={() => { setFormData(getUserFormData(user)); setIsEditing(!isEditing); setError(''); }} className={`brand-focus flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-bold shadow-sm ${isEditing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200' : 'bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-deep)] hover:shadow-md'}`}>
                        {isEditing ? (
                            <><X className="w-4 h-4" /> Cancel Edit</>
                        ) : (
                            <><Edit2 className="w-4 h-4" /> Edit {activeView.split(' ')[0]}</>
                        )}
                    </button>
                )}
            </div>

            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div className="w-1.5 h-6 bg-[var(--brand-gold)] rounded-full"></div>
                <h2 className="text-2xl font-extrabold text-[var(--brand-navy)] tracking-tight">
                    {activeView}
                </h2>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-[var(--brand-red-soft)] text-[var(--brand-red)] font-bold rounded-xl text-sm border border-red-100 flex items-center justify-center shadow-sm">
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
                                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} className="brand-input w-full p-4 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Last Name</label>
                                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} className="brand-input w-full p-4 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="brand-input w-full p-4 rounded-xl font-bold" />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Contact Number</label>
                                    <input type="text" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} className="brand-input w-full p-4 rounded-xl font-bold" />
                                </div>

                                <div className="md:col-span-2 pt-6 border-t border-slate-100 mt-2">
                                    <button onClick={handleSave} disabled={saving} className="brand-button-primary brand-focus w-full py-4 rounded-xl font-extrabold tracking-wide flex items-center justify-center gap-2 disabled:opacity-70">
                                        {saving ? 'Saving...' : <><Check className="w-5 h-5" /> Save Personal Details</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[var(--brand-navy)]/20 hover:shadow-lg hover:shadow-[var(--brand-navy)]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[var(--brand-navy)] rounded-xl shrink-0 group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="font-extrabold text-slate-800 capitalize text-base truncate">{user.first_name} {user.last_name}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[var(--brand-navy)]/20 hover:shadow-lg hover:shadow-[var(--brand-navy)]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[var(--brand-navy)] rounded-xl shrink-0 group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</p>
                                        <p className="font-extrabold text-slate-800 text-base truncate">{user.email}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[var(--brand-navy)]/20 hover:shadow-lg hover:shadow-[var(--brand-navy)]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[var(--brand-navy)] rounded-xl shrink-0 group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role / Position</p>
                                        <p className="font-extrabold text-slate-800 capitalize text-base truncate">{user.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[var(--brand-navy)]/20 hover:shadow-lg hover:shadow-[var(--brand-navy)]/5 transition-all group">
                                    <div className="p-3 bg-slate-50 text-[var(--brand-navy)] rounded-xl shrink-0 group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Number</p>
                                        <p className="font-extrabold text-slate-800 text-base truncate">{user.contact_number || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div className="p-5 rounded-2xl bg-white flex items-start gap-4 border border-slate-100 hover:border-[var(--brand-navy)]/20 hover:shadow-lg hover:shadow-[var(--brand-navy)]/5 transition-all md:col-span-2 group">
                                    <div className="p-3 bg-slate-50 text-[var(--brand-navy)] rounded-xl shrink-0 group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
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
                                    <input type="password" placeholder="Leave blank to keep current password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="brand-input w-full p-4 rounded-xl font-bold placeholder:font-normal placeholder:text-sm" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">New Passcode</label>
                                    <div className="relative">
                                        <input type={showPasscode ? "text" : "password"} value={formData.passcode} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, passcode: val }); }} placeholder="Numbers only" className="brand-input w-full p-4 pr-12 rounded-xl font-bold tracking-[0.2em]" />
                                        <button onClick={() => setShowPasscode(!showPasscode)} className="brand-focus absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[var(--brand-navy)] transition-colors p-1">
                                            {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirm Passcode</label>
                                    <input type={showPasscode ? "text" : "password"} value={formData.confirm_passcode} onChange={(e) => { const val = e.target.value; if (val === '' || /^\d+$/.test(val)) setFormData({ ...formData, confirm_passcode: val }); }} placeholder="Must match" className={`brand-input w-full p-4 rounded-xl font-bold tracking-[0.2em] ${formData.confirm_passcode && formData.passcode !== formData.confirm_passcode ? 'border-red-400 bg-red-50' : ''}`} />
                                </div>

                                <div className="md:col-span-2 pt-6 border-t border-slate-200 mt-2">
                                    <button onClick={handleSave} disabled={saving || (formData.passcode && formData.passcode !== formData.confirm_passcode)} className="brand-button-primary brand-focus w-full py-4 rounded-xl font-extrabold tracking-wide flex items-center justify-center gap-2 disabled:opacity-50">
                                        {saving ? 'Updating Security...' : <><Check className="w-5 h-5" /> Update Security Credentials</>}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-5">
                                <div className="p-6 rounded-2xl bg-white flex items-center justify-between border border-slate-200 shadow-sm group">
                                    <div className="flex items-center gap-5">
                                        <div className="p-4 bg-slate-50 text-[var(--brand-navy)] rounded-2xl group-hover:bg-[var(--brand-red)] group-hover:text-white transition-colors">
                                            <KeyRound className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">System Passcode</p>
                                            <p className="font-extrabold text-[var(--brand-navy)] text-2xl tracking-[0.3em]">
                                                {showPasscode ? user.passcode : '******'}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowPasscode(!showPasscode)} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-200 text-slate-500 transition-colors">
                                        {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                <div className="p-6 rounded-2xl bg-white flex items-center gap-5 border border-slate-200 shadow-sm group">
                                    <div className="p-4 bg-slate-50 text-[var(--brand-navy)] rounded-2xl group-hover:bg-[var(--brand-navy)] group-hover:text-white transition-colors">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Password</p>
                                        <p className="font-extrabold text-slate-800 text-lg tracking-[0.2em]">********</p>
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

    const sessionUser = getSessionUser();
    const userId = sessionUser?.uid;

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${BASE_URL}/users/${userId}`);
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
            const res = await fetch(`${BASE_URL}/users/${userId}/verify-passcode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode })
            });
            const data = await res.json();
            if (data.success) {
                clearSessionUser();
                window.location.href = '/';
            } else {
                setLogoutError(data.message || 'Invalid passcode.');
            }
        } catch (error) {
            console.error('Failed to verify logout passcode', error);
            setLogoutError('Network error occurred.');
        } finally {
            setVerifyingLogout(false);
        }
    };

    return (
        <div className="app-shell min-h-screen pb-28 overflow-hidden relative font-sans">
            <Sidebar />

            <main className="flex-1">
            <div className="academic-grid bg-[var(--brand-navy)] px-5 pt-8 pb-20 rounded-b-[2.5rem] relative overflow-hidden shadow-xl border-b-4 border-[var(--brand-gold)] sm:px-6">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--brand-gold)] rounded-full blur-[100px] opacity-16 -mr-20 -mt-32 pointer-events-none"></div>

                <div className="flex items-center justify-between relative z-10 max-w-5xl mx-auto">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.5rem] bg-white/12 flex items-center justify-center text-white text-3xl font-extrabold shadow-inner border border-white/20 backdrop-blur-md">
                            {loading ? '...' : getInitials()}
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold text-white capitalize tracking-tight drop-shadow-sm">
                                {loading ? 'Loading...' : `${user?.first_name || ''} ${user?.last_name || ''}`}
                            </h1>
                            <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-[var(--brand-gold)] shadow-[0_0_8px_rgba(239,173,36,0.8)]"></span>
                                <p className="text-[var(--brand-gold)] text-sm sm:text-base capitalize font-bold tracking-wide">
                                    {loading ? '...' : (user?.role?.replace('_', ' ') || user?.position || 'Guest')}
                                </p>
                            </div>
                            <p className="mt-2 max-w-xl text-sm font-medium text-blue-100/75">Manage your account, security settings, and platform preferences.</p>
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
                                    <button key={title} onClick={() => setActiveView(title)} className="brand-focus w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border border-transparent hover:border-[var(--brand-navy)]/10 hover:bg-slate-50 transition-all group hover:shadow-sm" >
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-[1rem] flex items-center justify-center ${colors[color]} shadow-sm group-hover:scale-105 transition-transform`}>
                                                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                            </div>

                                            <div className="text-left">
                                                <h3 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">{title}</h3>
                                                <p className="text-[12px] sm:text-[13px] font-medium text-slate-400 mt-0.5">{sub}</p>
                                            </div>
                                        </div>

                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[var(--brand-navy)] group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>

                            <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-between p-6 rounded-[2rem] bg-white border border-red-100 hover:border-red-300 hover:shadow-md transition-all group overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-red-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 rounded-[1rem] bg-[var(--brand-red-soft)] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:bg-[var(--brand-red)] group-hover:text-white text-[var(--brand-red)] transition-all">
                                        <LogOut className="w-6 h-6" />
                                    </div>

                                    <div className="text-left">
                                        <h3 className="text-base font-extrabold text-[var(--brand-red)]">Secure System Logout</h3>
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
            </main>
        </div>
    );
};

export default Profile;
