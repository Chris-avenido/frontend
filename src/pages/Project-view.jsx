import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    Download,
    FileText,
    MapPin,
    School,
    Search,
    WalletCards,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { getSessionUser } from '../utils/authSession';
import newLogo from '../assets/new_logo.png';
import { EmptyState, SkeletonBlock } from '../components/BrandUI';

const InfoCard = ({ title, icon: Icon, rows }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
        <div className="mb-6 flex items-center gap-3 relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EBF2F9] text-[#0B3A68] shadow-sm border border-[#0B3A68]/10">
                <Icon className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-black text-[#0B3A68] tracking-tight">{title}</h2>
        </div>
        <div className="relative z-10 space-y-4">
            {rows.map(([label, value]) => (
                <div key={label} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-6 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-black text-slate-800 text-left sm:text-right">{value || 'N/A'}</span>
                </div>
            ))}
        </div>
    </motion.section>
);

const clampPercent = (value) => Math.min(Math.max(Number(value || 0), 0), 100);

const displayOrDash = (value) => value || '-';
const hasTrancheAmount = (value) => Number(value || 0) > 0;

const FundDownloadModal = ({ isOpen, onClose, project, budget, trancheFund, onSaved, formatCurrency }) => {
    const [formData, setFormData] = useState({
        tranche_1: '',
        tranche_1_liquidated: '',
        tranche_2: '',
        tranche_2_liquidated: '',
        tranche_3: '',
        tranche_3_liquidated: ''
    });
    const [isConfirmed, setIsConfirmed] = useState({
        is_tranche_1_confirmed: false,
        is_tranche_2_confirmed: false,
        is_tranche_3_confirmed: false
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (trancheFund) {
            setFormData({
                tranche_1: trancheFund.tranche_1 || '',
                tranche_1_liquidated: trancheFund.tranche_1_liquidated || '',
                tranche_2: trancheFund.tranche_2 || '',
                tranche_2_liquidated: trancheFund.tranche_2_liquidated || '',
                tranche_3: trancheFund.tranche_3 || '',
                tranche_3_liquidated: trancheFund.tranche_3_liquidated || ''
            });
            setIsConfirmed({
                is_tranche_1_confirmed: !!trancheFund.is_tranche_1_confirmed,
                is_tranche_2_confirmed: !!trancheFund.is_tranche_2_confirmed,
                is_tranche_3_confirmed: !!trancheFund.is_tranche_3_confirmed
            });
        }
    }, [trancheFund, isOpen]);

    useEffect(() => {
        if (!isOpen) return undefined;
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const calcTranchePerc = (released, liquidated) => {
        if (!released || !liquidated || Number(released) <= 0) return 0;
        return clampPercent((Number(liquidated) / Number(released)) * 100);
    };

    const tranche1Perc = calcTranchePerc(formData.tranche_1, formData.tranche_1_liquidated);
    const tranche2Perc = calcTranchePerc(formData.tranche_2, formData.tranche_2_liquidated);

    const tranche1Released = hasTrancheAmount(formData.tranche_1);
    const tranche2Released = hasTrancheAmount(formData.tranche_2);

    const tranche2Enabled = tranche1Perc >= 100 && isConfirmed.is_tranche_1_confirmed;
    const tranche3Enabled = tranche2Perc >= 100 && isConfirmed.is_tranche_2_confirmed;

    const updateAmount = (field, value) => {
        if (value !== '' && !/^\d*\.?\d{0,2}$/.test(value)) return;
        setFormData((prev) => {
            const next = { ...prev, [field]: value };
            if (field === 'tranche_1' && !hasTrancheAmount(value)) {
                next.tranche_2 = '';
                next.tranche_3 = '';
            }
            if (field === 'tranche_2' && !hasTrancheAmount(value)) {
                next.tranche_3 = '';
            }
            return next;
        });
    };

    const performSave = async (overrides = {}) => {
        const sessionUser = getSessionUser();
        const numericUserId = Number(sessionUser?.uid);

        const payload = {
            tranche_1: formData.tranche_1 || 0,
            tranche_1_liquidated: formData.tranche_1_liquidated || 0,
            tranche_2: formData.tranche_2 || 0,
            tranche_2_liquidated: formData.tranche_2_liquidated || 0,
            tranche_3: formData.tranche_3 || 0,
            tranche_3_liquidated: formData.tranche_3_liquidated || 0,
            is_tranche_1_confirmed: isConfirmed.is_tranche_1_confirmed,
            is_tranche_2_confirmed: isConfirmed.is_tranche_2_confirmed,
            is_tranche_3_confirmed: isConfirmed.is_tranche_3_confirmed,
            user_id: Number.isFinite(numericUserId) ? numericUserId : 0,
            ...overrides
        };

        const response = await api.request(`/projects/${project.project_id}/tranches`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        return response.data;
    };

    const handleSave = async () => {
        if (hasTrancheAmount(formData.tranche_2) && (!isConfirmed.is_tranche_1_confirmed || tranche1Perc < 100)) {
            return Swal.fire({ icon: 'warning', title: 'Tranche 1 Required', text: 'Confirm Tranche 1 and reach 100% liquidation before Tranche 2.', confirmButtonColor: '#0B3A68' });
        }
        if (hasTrancheAmount(formData.tranche_3) && (!isConfirmed.is_tranche_2_confirmed || tranche2Perc < 100)) {
            return Swal.fire({ icon: 'warning', title: 'Tranche 2 Required', text: 'Confirm Tranche 2 and reach 100% liquidation before Tranche 3.', confirmButtonColor: '#0B3A68' });
        }

        setIsSaving(true);
        try {
            const data = await performSave();
            if (onSaved) onSaved(data);
            Swal.fire({
                icon: 'success',
                title: 'Tranches Updated',
                text: 'Project fund releases were saved successfully.',
                timer: 1600,
                showConfirmButton: false
            });
            onClose();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Unable to Save',
                text: error.message || 'Please review the tranche values and try again.',
                confirmButtonColor: '#D31F35'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmTranche = (key, title, confirmKey) => {
        Swal.fire({
            title: `Confirm ${title}`,
            text: `Are you sure you want to lock in the amount and liquidation baseline for ${title}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0B3A68',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Confirm & Lock'
        }).then(async (result) => {
            if (result.isConfirmed) {
                setIsSaving(true);
                try {
                    const data = await performSave({ [confirmKey]: true });
                    if (onSaved) onSaved(data);
                    setIsConfirmed(prev => ({ ...prev, [confirmKey]: true }));
                    Swal.fire({
                        icon: 'success',
                        title: 'Locked!',
                        text: `${title} has been confirmed.`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unable to Lock',
                        text: error.message || 'Please review the values and try again.',
                        confirmButtonColor: '#D31F35'
                    });
                } finally {
                    setIsSaving(false);
                }
            }
        });
    };

    const trancheSteps = [
        { key: 'tranche_1', confirmKey: 'is_tranche_1_confirmed', title: 'Tranche 1', enabled: true, requirementText: 'Reach 100% to unlock Tranche 2' },
        { key: 'tranche_2', confirmKey: 'is_tranche_2_confirmed', title: 'Tranche 2', enabled: tranche2Enabled, requirementText: 'Reach 100% to unlock Tranche 3' },
        { key: 'tranche_3', confirmKey: 'is_tranche_3_confirmed', title: 'Tranche 3', enabled: tranche3Enabled, requirementText: '' }
    ];


    const summaryTranches = [
        { label: 'Tranche 1', value: calcTranchePerc(formData.tranche_1, formData.tranche_1_liquidated) },
        { label: 'Tranche 2', value: calcTranchePerc(formData.tranche_2, formData.tranche_2_liquidated) },
        { label: 'Tranche 3', value: calcTranchePerc(formData.tranche_3, formData.tranche_3_liquidated) }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/78 px-4 py-6 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    onMouseDown={onClose}
                    role="presentation"
                >
                    <motion.div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Fund download workflow"
                        className="m-0 max-h-[96vh] w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/20 bg-white p-0 text-left shadow-2xl flex flex-col"
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <header className="flex flex-col gap-1 border-b border-slate-100 bg-white px-8 py-6 shrink-0 relative z-20">
                            <p className="text-sm font-bold text-slate-500 tracking-tight">InsightED Infrastructure</p>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-[#0B3A68]">Fund Management</h2>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="brand-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                                    aria-label="Close fund download workflow"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </header>

                        <div className="app-scroll overflow-y-auto p-6 md:p-8 flex-1 bg-[#F8FAFC]">
                            <div className="mx-auto max-w-4xl space-y-6">

                                {/* Project Info Pill */}
                                <div className="flex justify-center">
                                    <div className="bg-white rounded-full border border-slate-200 shadow-sm px-8 py-4 text-center">
                                        <h3 className="text-sm md:text-base font-black text-[#0B3A68] tracking-tight">{project.project_name || 'Construction of 1STY2CL'}</h3>
                                        <p className="mt-0.5 text-[11px] md:text-xs font-bold text-slate-500 uppercase tracking-wider">{project.school_name} | {project.school_id}</p>
                                    </div>
                                </div>

                                {/* Total Fund Box */}
                                <section className="bg-white rounded-3xl border border-slate-200 shadow-sm px-6 py-8 md:px-10 md:py-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#EBF2F9] rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>

                                    <div className="flex flex-col items-center justify-center mb-8 md:mb-10 relative z-10">
                                        <div className="flex items-baseline gap-3 md:gap-4">
                                            <span className="text-xl md:text-2xl font-bold text-slate-500">Total Fund:</span>
                                            <span className="text-4xl md:text-5xl lg:text-[56px] font-black text-[#0B3A68] tracking-tight leading-none">
                                                {new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(budget)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs md:text-sm font-bold text-slate-500 relative z-10">
                                        <p>Contractor: <span className="text-slate-800 font-black">{displayOrDash(project.contractor_name)}</span></p>
                                        <p>PCAB License: <span className="text-slate-800 font-black">{displayOrDash(project.pcab_license_number)}</span></p>
                                    </div>
                                </section>

                                {/* 2x2 Grid for Tranches & Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {trancheSteps.map(({ key, confirmKey, title, enabled, requirementText }) => {
                                        const isTrancheConfirmed = isConfirmed[confirmKey];
                                        const isValid = hasTrancheAmount(formData[key]);

                                        return (
                                            <section key={key} aria-disabled={!enabled} className={`bg-white rounded-3xl border ${enabled ? 'border-slate-200 shadow-sm' : 'border-slate-100 opacity-60 pointer-events-none'} p-6 relative flex flex-col`}>

                                                {/* Top Right Badges */}
                                                <div className="absolute top-6 right-6 flex flex-col items-end gap-2">
                                                    {/* Liquidation Percentage Box */}
                                                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl pl-3 pr-2 py-1.5 bg-slate-50 shadow-sm">
                                                        <span className="text-[8px] font-black text-slate-400 leading-[1.1] uppercase tracking-widest text-right w-16">Liquidation Percentage</span>
                                                        <div className="bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-[#0B3A68] text-base md:text-lg min-w-[50px] md:min-w-[60px] text-center shadow-sm">
                                                            {enabled ? `${calcTranchePerc(formData[key], formData[`${key}_liquidated`]).toFixed(0)}%` : ''}
                                                        </div>
                                                    </div>

                                                    {/* Eligibility Pill */}
                                                    {requirementText && (
                                                        <div className="border border-slate-200 rounded-full px-3 py-1 bg-white shadow-sm">
                                                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                                                {requirementText}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Tranche Content */}
                                                <div className="pt-2 flex-1">
                                                    <h4 className="text-lg font-black text-[#0B3A68] mb-12">{title}</h4>

                                                    <div className="space-y-5">
                                                        <div>
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Released Amount</label>
                                                            {enabled ? (
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    disabled={isTrancheConfirmed || !enabled}
                                                                    value={formData[key]}
                                                                    onChange={(e) => updateAmount(key, e.target.value)}
                                                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-black text-[#0B3A68] focus:ring-2 focus:ring-[#0B3A68]/20 focus:border-[#0B3A68] focus:outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                                                                    placeholder="Enter amount..."
                                                                />
                                                            ) : (
                                                                <div className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 tracking-widest uppercase">
                                                                    LOCKED
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Liquidated Amount</label>
                                                            {enabled ? (
                                                                <input
                                                                    type="text"
                                                                    inputMode="decimal"
                                                                    disabled={!enabled}
                                                                    value={formData[`${key}_liquidated`]}
                                                                    onChange={(e) => updateAmount(`${key}_liquidated`, e.target.value)}
                                                                    className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all shadow-sm disabled:bg-slate-50 disabled:text-slate-500"
                                                                    placeholder="Enter liquidated amount..."
                                                                />
                                                            ) : (
                                                                <div className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xs font-black text-slate-400 tracking-widest uppercase">
                                                                    LOCKED
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Confirm Button Area */}
                                                {enabled && !isTrancheConfirmed && (
                                                    <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end">
                                                        <button
                                                            onClick={() => handleConfirmTranche(key, title, confirmKey)}
                                                            disabled={!isValid || isSaving}
                                                            className="px-5 py-2.5 bg-slate-800 text-white font-bold text-xs rounded-xl disabled:opacity-50 transition-all hover:bg-slate-900 shadow-sm"
                                                        >
                                                            Confirm {title}
                                                        </button>
                                                    </div>
                                                )}
                                                {enabled && isTrancheConfirmed && (
                                                    <div className="mt-6 border-t border-slate-100 pt-5 flex justify-end">
                                                        <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Confirmed & Locked</span>
                                                    </div>
                                                )}
                                            </section>
                                        );
                                    })}

                                    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
                                        <h4 className="text-lg font-black text-[#0B3A68] mb-6">Summary</h4>
                                        <div className="space-y-6 flex-1 flex flex-col justify-center bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                            {summaryTranches.map((item) => (
                                                <div key={item.label}>
                                                    <div className="flex justify-between items-end mb-2">
                                                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                                        <span className="text-sm font-black text-[#0B3A68]">{item.value.toFixed(0)}%</span>
                                                    </div>
                                                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden border border-slate-300 shadow-inner">
                                                        <div className="h-full bg-gradient-to-r from-[#0B3A68] to-[#154b82] transition-all duration-500 ease-out" style={{ width: `${item.value}%` }}></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </div>

                        <footer className="border-t border-slate-100 bg-white px-8 py-5 flex justify-end gap-3 shrink-0 relative z-20">
                            <button type="button" onClick={onClose} className="h-12 px-6 rounded-xl font-bold text-sm bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors">
                                Cancel
                            </button>
                            <button type="button" onClick={handleSave} disabled={isSaving} className="h-12 px-8 rounded-xl font-black text-sm bg-[#0B3A68] text-white shadow-md hover:bg-[#154b82] transition-colors disabled:opacity-60 disabled:hover:bg-[#0B3A68]">
                                {isSaving ? 'Saving...' : 'Save Updates'}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ProjectDetailView = ({ project, onBack }) => {
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [trancheFund, setTrancheFund] = useState(null);

    const formatCurrency = (amount) => {
        if (!amount) return 'PHP 0.00';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const budget = Number(project.approved_budget_for_contract || 4250000);
    const disbursed = budget * 0.5;
    const liquidated = budget * 0.42;
    const balance = budget - disbursed;

    useEffect(() => {
        const fetchTrancheFund = async () => {
            try {
                const response = await api.get(`/projects/${project.project_id}/tranches`);
                setTrancheFund(response.data || null);
            } catch (error) {
                console.error('Failed to fetch tranche data', error);
                setTrancheFund(null);
            }
        };

        fetchTrancheFund();
    }, [project.project_id]);

    return (
        <div className="pb-32">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-[#0B3A68] to-[#154b82] pt-12 pb-24 px-6 md:px-12 relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
                    <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="50" fill="currentColor" />
                        <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="50" cy="50" r="30" fill="currentColor" />
                    </svg>
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        <button
                            type="button"
                            onClick={onBack}
                            className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/20 shrink-0"
                            aria-label="Back to project list"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1.5 shrink-0 border border-white/20">
                            <img src={newLogo} alt="InsightED logo" className="w-full h-full object-contain drop-shadow-sm" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight drop-shadow-sm">InsightED Infrastructure</h1>
                            <p className="text-[#A3C6E8] font-bold text-xs md:text-sm mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm">Project View</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 rounded-2xl py-3 px-6 flex items-center gap-3 shadow-lg self-start md:self-auto"
                    >
                        <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                        <span className="text-emerald-50 font-black tracking-widest uppercase text-sm">Eligible</span>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 md:px-12 -mt-12 relative z-20 space-y-6">

                {/* Top Row: Project Info & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-5">
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#EBF2F9] to-transparent rounded-bl-full -mr-8 -mt-8 opacity-60 pointer-events-none"></div>
                        <h2 className="text-xl md:text-2xl font-black text-[#0B3A68] tracking-tight leading-snug relative z-10">
                            {project.project_name || 'Construction of 1STY2CL'}
                        </h2>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest relative z-10">
                            <School className="w-4 h-4 text-slate-400" />
                            <span>{project.school_name || 'Maniwaya Elementary School'}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-400">{project.school_id || '123456'}</span>
                        </div>
                    </motion.section>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-4"
                    >
                        <button className="flex-1 lg:w-[150px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#0B3A68]/30 hover:shadow-md transition-all group p-5">
                            <div className="w-12 h-12 rounded-2xl bg-[#EBF2F9] text-[#0B3A68] flex items-center justify-center mb-3 group-hover:bg-[#0B3A68] group-hover:text-white transition-colors shadow-sm">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 tracking-widest uppercase">View MOA</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsFundModalOpen(true)}
                            className="flex-1 lg:w-[150px] flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-[#8A1538]/30 hover:shadow-md transition-all group p-5"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-[#FDF0F2] text-[#8A1538] flex items-center justify-center mb-3 group-hover:bg-[#8A1538] group-hover:text-white transition-colors shadow-sm">
                                <Download className="w-6 h-6" />
                            </div>
                            <span className="text-[11px] font-black text-slate-700 tracking-widest uppercase text-center">Fund Download</span>
                        </button>
                    </motion.div>
                </div>

                {/* 2x2 Grid of Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                        title="Project Location Data"
                        icon={MapPin}
                        rows={[
                            ['Region', project.region || 'Region IV-A'],
                            ['Province', project.province || 'Laguna'],
                            ['Municipality', project.municipality || project.division || 'Mariwaya'],
                            ['Barangay', project.barangay || 'San Isidro'],
                            ['Coordinates', project.coordinates || "14.17° N, 121.24° E"]
                        ]}
                    />
                    <InfoCard
                        title="School Data"
                        icon={School}
                        rows={[
                            ['School Name', project.school_name || 'Mariwaya Elementary'],
                            ['School ID', project.school_id || '123456'],
                            ['Enrollment', project.enrollment || '842 students'],
                            ['Classrooms', project.classrooms || '24'],
                            ['Principal', project.principal || 'Ms. Liwayway Cruz']
                        ]}
                    />
                    <InfoCard
                        title="Procurement Data"
                        icon={Box}
                        rows={[
                            ['Mode', project.procurement_mode || 'Public Bidding'],
                            ['Contractor', project.contractor || 'BuildRight Inc.'],
                            ['Contract Date', project.contract_date || 'Mar 12, 2025'],
                            ['Duration', project.duration || '180 days'],
                            ['Status', project.status_of_construction_phase || 'Ongoing']
                        ]}
                    />
                    <InfoCard
                        title="Finance Data"
                        icon={WalletCards}
                        rows={[
                            ['Allocated', formatCurrency(budget)],
                            ['Disbursed', formatCurrency(disbursed)],
                            ['Liquidated', formatCurrency(liquidated)],
                            ['Balance', formatCurrency(balance)],
                            ['Utilization', `${project.accomplishment_percentage || 50}%`]
                        ]}
                    />
                </div>
            </div>

            <FundDownloadModal
                isOpen={isFundModalOpen}
                onClose={() => setIsFundModalOpen(false)}
                project={project}
                budget={budget}
                trancheFund={trancheFund}
                onSaved={setTrancheFund}
                formatCurrency={formatCurrency}
            />
        </div>
    );
};

export const ProjectView = () => {
    const navigate = useNavigate();
    const { projectToken } = useParams();
    const [project, setProject] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            setIsLoading(true);
            setLoadError('');
            try {
                const response = await api.get(`/project-view/${projectToken}`);
                setProject(response.data || null);
            } catch (error) {
                console.error('Failed to fetch project view', error);
                setProject(null);
                setLoadError(error.message || 'Unable to load the selected project.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProject();
    }, [projectToken]);

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto app-scroll relative">
                <AnimatePresence mode="wait">
                    {project ? (
                        <ProjectDetailView project={project} onBack={() => navigate('/projects-list')} />
                    ) : (
                        <motion.div
                            key="project-view-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mx-auto max-w-3xl px-5 py-12 flex justify-center items-center h-full"
                        >
                            {isLoading ? (
                                <div className="w-full space-y-6">
                                    <SkeletonBlock className="h-40 rounded-2xl" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <SkeletonBlock className="h-64 rounded-2xl" />
                                        <SkeletonBlock className="h-64 rounded-2xl" />
                                    </div>
                                </div>
                            ) : (
                                <EmptyState
                                    icon={Search}
                                    title="Project Not Found"
                                    description={loadError || 'The selected project could not be loaded.'}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProjectView;
