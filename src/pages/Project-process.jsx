import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Box,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Download,
    FileText,
    MapPin,
    School,
    Search,
    WalletCards,
    Funnel,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';
import Sidebar from "../components/Sidebar";
import api from '../utils/api';
import { getSessionUser } from '../utils/authSession';
import newLogo from '../assets/new_logo.png';
import { EmptyState, PageHeader, SectionTitle, SkeletonBlock } from '../components/BrandUI';

const TrancheCard = ({ title, count, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="brand-card brand-card-hover brand-focus h-[106px] rounded-[var(--radius-lg)] px-5 text-center"
    >
        <div className="flex h-full flex-col items-center justify-center">
            <p className="text-sm font-bold text-[var(--ink-soft)] md:text-base">{title}</p>
            <p className="mt-3 text-3xl font-extrabold leading-none text-[var(--ink)]">{count.toLocaleString()}</p>
        </div>
    </button>
);

const InfoCard = ({ title, icon: Icon, rows }) => (
    <section className="rounded-[20px] border border-[var(--line)] bg-white p-6 shadow-[0_2px_8px_rgba(13,45,88,0.10)]">
        <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-sky)] text-[var(--brand-navy)]">
                <Icon className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-[var(--ink)]">{title}</h2>
        </div>
        <div>
            {rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-6 border-b border-[var(--line-soft)] py-3 last:border-b-0">
                    <span className="text-sm font-medium text-[var(--ink-soft)]">{label}</span>
                    <span className="text-right text-sm font-extrabold text-[var(--ink)]">{value || 'N/A'}</span>
                </div>
            ))}
        </div>
    </section>
);

const clampPercent = (value) => Math.min(Math.max(Number(value || 0), 0), 100);

const FundProgressBar = ({ value }) => (
    <div className="fund-modal-progress" aria-label={`${value}% complete`}>
        <span style={{ width: `${clampPercent(value)}%` }} />
    </div>
);

const displayOrDash = (value) => value || '-';

const FundTranchePanel = ({ title, trancheValue, liquidationValue, locked = false }) => (
    <section className="fund-modal-panel">
        <div className="fund-modal-panel-title">
            <h4>{title}</h4>
            <span className={locked ? 'is-locked' : 'is-open'}>
                {locked ? 'Locked' : 'Open'}
            </span>
        </div>
        <label>{title}</label>
        <div className={`fund-modal-field ${locked ? 'is-locked' : ''}`}>
            {locked ? 'LOCKED' : `${trancheValue}% ready`}
        </div>
        <label>Liquidation</label>
        <div className={`fund-modal-field ${locked ? 'is-locked' : ''}`}>
            {locked ? 'LOCKED' : `${liquidationValue}% submitted`}
        </div>
    </section>
);

const FundSummaryPanel = ({ tranches }) => (
    <section className="fund-modal-panel">
        <div className="fund-modal-panel-title">
            <h4>Summary</h4>
            <BarChart3Icon />
        </div>
        <div className="fund-modal-summary-list">
            {tranches.map((item) => (
                <div className="fund-modal-summary-row" key={item.label}>
                    <div>
                        <span>{item.label}</span>
                        <strong>{item.value}%</strong>
                    </div>
                    <FundProgressBar value={item.value} />
                </div>
            ))}
        </div>
    </section>
);

const BarChart3Icon = () => (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const emptyTrancheFund = {
    tranche_1: 0,
    tranche_2: 0,
    tranche_3: 0,
    tranche_flag: 0,
    remarks: ''
};

const trancheStatusLabels = {
    0: 'New',
    1: 'Tranche 1 Released',
    2: 'Tranche 2 Released',
    3: 'Tranche 3 Released',
    4: 'Completed'
};

const getTrancheStatusLabel = (flag) => trancheStatusLabels[Number(flag || 0)] || 'New';
const hasTrancheAmount = (value) => Number(value || 0) > 0;
const getLatestTrancheStatus = (fund = {}) => {
    if (hasTrancheAmount(fund.tranche_3)) return 'Tranche 3';
    if (hasTrancheAmount(fund.tranche_2)) return 'Tranche 2';
    if (hasTrancheAmount(fund.tranche_1)) return 'Tranche 1';
    return 'No Tranche';
};
const getLatestTrancheAmount = (fund = {}) => {
    const status = fund.latest_tranche_status || getLatestTrancheStatus(fund);

    if (status === 'Tranche 3') return fund.tranche_3;
    if (status === 'Tranche 2') return fund.tranche_2;
    if (status === 'Tranche 1') return fund.tranche_1;
    return 0;
};
const getProjectTitle = (project = {}) => {
    const projectName = project.project_name || '';
    const schoolName = project.school_name || '';
    const schoolId = project.school_id || '';
    const schoolLabel = [schoolName, schoolId].filter(Boolean).join(' | ');

    if (projectName && schoolLabel) return `${projectName} (${schoolLabel})`;
    if (projectName) return projectName;

    return schoolLabel || 'Unknown School';
};

const TrancheManagementModal = ({ isOpen, onClose, project, trancheFund, onSaved, formatCurrency }) => {
    const [formData, setFormData] = useState(() => ({
        tranche_1: trancheFund?.tranche_1 || '',
        tranche_2: trancheFund?.tranche_2 || '',
        tranche_3: trancheFund?.tranche_3 || '',
        tranche_flag: trancheFund?.tranche_flag || 0,
        remarks: trancheFund?.remarks || ''
    }));
    const [isSaving, setIsSaving] = useState(false);

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

    if (!isOpen) return null;

    const tranche1Released = hasTrancheAmount(formData.tranche_1);
    const tranche2Released = hasTrancheAmount(formData.tranche_2);
    const tranche3Released = hasTrancheAmount(formData.tranche_3);
    const tranche2Enabled = tranche1Released;
    const tranche3Enabled = tranche1Released && tranche2Released;
    const currentFlag = tranche1Released && tranche2Released && tranche3Released ? 4 : tranche1Released && tranche2Released ? 2 : tranche1Released ? 1 : 0;

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

    const handleSave = async () => {
        if (hasTrancheAmount(formData.tranche_2) && !hasTrancheAmount(formData.tranche_1)) {
            return Swal.fire({ icon: 'warning', title: 'Tranche 1 Required', text: 'Release Tranche 1 before Tranche 2.', confirmButtonColor: '#0B3A68' });
        }

        if (hasTrancheAmount(formData.tranche_3) && !hasTrancheAmount(formData.tranche_2)) {
            return Swal.fire({ icon: 'warning', title: 'Tranche 2 Required', text: 'Release Tranche 2 before Tranche 3.', confirmButtonColor: '#0B3A68' });
        }

        setIsSaving(true);
        try {
            const sessionUser = getSessionUser();
            const numericUserId = Number(sessionUser?.uid);
            const response = await api.request(`/projects/${project.project_id}/tranches`, {
                method: 'PUT',
                body: JSON.stringify({
                    tranche_1: formData.tranche_1 || 0,
                    tranche_2: formData.tranche_2 || 0,
                    tranche_3: formData.tranche_3 || 0,
                    remarks: formData.remarks,
                    user_id: Number.isFinite(numericUserId) ? numericUserId : 0
                })
            });

            onSaved(response.data);
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

    const trancheSteps = [
        { key: 'tranche_1', title: 'Tranche 1', enabled: true, released: tranche1Released },
        { key: 'tranche_2', title: 'Tranche 2', enabled: tranche2Enabled, released: tranche2Released },
        { key: 'tranche_3', title: 'Tranche 3', enabled: tranche3Enabled, released: tranche3Released }
    ];

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/78 px-4 py-6 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onMouseDown={onClose}
                role="presentation"
            >
                <motion.dialog
                    open
                    aria-modal="true"
                    aria-label="Manage project tranches"
                    className="m-0 max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/20 bg-white p-0 text-left shadow-2xl"
                    initial={{ opacity: 0, y: 18, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    onMouseDown={(event) => event.stopPropagation()}
                >
                    <div className="app-scroll max-h-[92vh] overflow-y-auto">
                        <header className="flex flex-col gap-4 border-b border-[var(--line)] bg-[var(--brand-navy)] px-6 py-5 text-white sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--brand-gold)]">Tranche Management</p>
                                <h2 className="mt-2 truncate text-2xl font-extrabold">{project.project_name || 'Project Fund Release'}</h2>
                            </div>
                            <button type="button" onClick={onClose} className="brand-focus flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label="Close tranche manager">
                                <X className="h-5 w-5" />
                            </button>
                        </header>

                        <div className="space-y-5 p-5 sm:p-6">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-bold text-[var(--ink-soft)]">Sequential release workflow</p>
                                    <p className="mt-1 text-sm font-medium text-[var(--muted)]">Tranche 2 and Tranche 3 unlock only after the previous tranche has a valid amount.</p>
                                </div>
                                <span className="w-fit rounded-lg border border-[var(--brand-gold)]/40 bg-[var(--brand-gold-soft)] px-4 py-2 text-sm font-extrabold text-[var(--brand-navy)]">
                                    {getTrancheStatusLabel(currentFlag)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                {trancheSteps.map(({ key, title, enabled, released }) => (
                                    <section
                                        key={key}
                                        className={`rounded-xl border p-4 shadow-sm transition ${enabled ? 'border-[var(--line)] bg-white' : 'border-slate-200 bg-slate-50 opacity-60'}`}
                                    >
                                        <div className="mb-4 flex items-center justify-between gap-3">
                                            <h3 className="font-extrabold text-[var(--ink)]">{title}</h3>
                                            <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${released ? 'bg-emerald-100 text-emerald-700' : enabled ? 'bg-[var(--brand-gold-soft)] text-[var(--brand-navy)]' : 'bg-slate-200 text-slate-500'}`}>
                                                {released ? 'Released' : enabled ? 'Open' : 'Locked'}
                                            </span>
                                        </div>
                                        <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">Release Amount</label>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={formData[key]}
                                            onChange={(event) => updateAmount(key, event.target.value)}
                                            disabled={!enabled}
                                            placeholder={enabled ? '0.00' : 'Locked'}
                                            className="brand-input mt-2 h-12 rounded-xl px-4 text-base font-extrabold disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                        <p className="mt-3 text-xs font-semibold text-[var(--muted)]">
                                            {released ? formatCurrency(formData[key]) : enabled ? 'Ready for release' : 'Complete the previous tranche first'}
                                        </p>
                                    </section>
                                ))}
                            </div>

                            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4">
                                <label className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">Remarks</label>
                                <textarea
                                    value={formData.remarks}
                                    onChange={(event) => setFormData((prev) => ({ ...prev, remarks: event.target.value }))}
                                    rows="3"
                                    className="brand-input mt-2 min-h-24 rounded-xl p-4 text-sm font-semibold"
                                    placeholder="Optional release notes"
                                />
                            </div>

                            <footer className="flex flex-col-reverse gap-3 border-t border-[var(--line-soft)] pt-5 sm:flex-row sm:justify-end">
                                <button type="button" onClick={onClose} className="brand-button-secondary brand-focus rounded-xl px-6 py-3 font-extrabold">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSave} disabled={isSaving} className="brand-button-primary brand-focus rounded-xl px-6 py-3 font-extrabold disabled:opacity-60">
                                    {isSaving ? 'Saving...' : 'Save Tranches'}
                                </button>
                            </footer>
                        </div>
                    </div>
                </motion.dialog>
            </motion.div>
        </AnimatePresence>
    );
};

const FundDownloadModal = ({ isOpen, onClose, project, budget, certificateProgress }) => {
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

    const certValue = clampPercent(certificateProgress);
    const liquidationValue = clampPercent(certValue >= 50 ? certValue - 20 : 0);
    const tranches = [
        { label: 'Tranche 1', value: clampPercent(certValue + 5) },
        { label: 'Tranche 2', value: certValue >= 50 ? liquidationValue : 0 },
        { label: 'Tranche 3', value: certValue >= 80 ? clampPercent(certValue - 60) : 0 }
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
                    <motion.dialog
                        open
                        aria-modal="true"
                        aria-label="Fund download workflow"
                        className="fund-download-modal"
                        initial={{ opacity: 0, y: 18, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.98 }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div className="fund-modal-body app-scroll">
                            <header className="fund-modal-header">
                                <div>
                                    <p>InsightED Infrastructure</p>
                                    <h2>Fund Management</h2>
                                </div>
                                <div className="fund-modal-header-actions">
                                    <span>Review Details</span>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="fund-modal-close brand-focus"
                                        aria-label="Close fund download workflow"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            </header>

                            <section className="fund-modal-project-card">
                                <h3>{project.project_name || 'Construction of 1STY2CL'}</h3>
                                <p>{project.school_name} | {project.school_id }</p>
                            </section>

                            <section className="fund-modal-total-card">
                                <div className="fund-modal-total">
                                    <span>Total Fund:</span>
                                    <strong>{new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 }).format(budget)}</strong>
                                </div>
                                <div className="fund-modal-meta">
                                    <p>Contractor: <strong>{displayOrDash(project.contractor_name)}</strong></p>
                                    <p>PCAB License: <strong>{displayOrDash(project.pcab_license_number)}</strong></p>
                                </div>
                            </section>

                            <section className="fund-modal-work-grid">
                                <FundTranchePanel title="Tranche 1" trancheValue={tranches[0].value} liquidationValue={tranches[0].value} />
                                <FundTranchePanel title="Tranche 2" trancheValue={tranches[1].value} liquidationValue={tranches[1].value} locked={certValue < 50} />
                                <FundTranchePanel title="Tranche 3" trancheValue={tranches[2].value} liquidationValue={tranches[2].value} locked={certValue < 80} />
                                <FundSummaryPanel tranches={tranches} />
                            </section>

                            <footer className="fund-modal-actions">
                                <button type="button" className="brand-button-primary brand-focus" onClick={onClose}>
                                    Close
                                </button>
                            </footer>
                        </div>
                    </motion.dialog>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const ProjectDetailView = ({ project, onBack }) => {
    const [isFundModalOpen, setIsFundModalOpen] = useState(false);
    const [isTrancheModalOpen, setIsTrancheModalOpen] = useState(false);
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
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="min-h-screen bg-[#f4f9fd] pb-32"
        >
            <header className="h-auto border-b border-[var(--line)] bg-[#f7fbff] md:h-[65px]">
                <div className="mx-auto flex max-w-[1490px] flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between md:py-0">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={onBack}
                            className="brand-focus flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-gold-soft)] text-[var(--brand-navy)] transition hover:bg-[var(--brand-gold)]/30"
                            aria-label="Back to project list"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white">
                            <img src={newLogo} alt="InsightED logo" className="h-9 w-9 object-contain" />
                        </div>
                        <div>
                            <h1 className="text-base font-extrabold text-[var(--ink)]">InsightED Infrastructure</h1>
                            <p className="mt-1 text-xs font-medium text-[var(--muted)]">Project View</p>
                        </div>
                    </div>

                    <div className="flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800 shadow-sm">
                        <CheckCircle2 className="h-4 w-4" />
                        Eligible
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-[1140px] px-5 py-[30px]">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_264px]">
                    <section className="rounded-[20px] border border-[var(--line)] bg-white px-5 py-5 shadow-[0_2px_8px_rgba(13,45,88,0.10)]">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[var(--ink-soft)]">Project</p>
                        <h2 className="text-lg font-extrabold text-[var(--ink)]">{project.project_name || 'Construction of 1STY2CL'}</h2>
                        <p className="mt-2 text-sm font-medium text-[var(--ink-soft)]">
                            {project.school_name || 'Mariwaya Elementary School'} · {project.school_id || '123456'}
                        </p>
                    </section>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <button className="brand-focus flex h-[90px] flex-col items-center justify-center rounded-[20px] border border-[#b9c8dc] bg-white text-[var(--brand-navy)] shadow-[0_2px_8px_rgba(13,45,88,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(13,45,88,0.12)]">
                            <FileText className="mb-2 h-5 w-5" />
                            <span className="text-sm font-extrabold">View MOA</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsFundModalOpen(true)}
                            className="brand-focus flex h-[90px] flex-col items-center justify-center rounded-[20px] border border-[var(--brand-gold)] bg-white text-amber-800 shadow-[0_2px_8px_rgba(239,173,36,0.14)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(239,173,36,0.20)]"
                        >
                            <Download className="mb-2 h-5 w-5" />
                            <span className="text-sm font-extrabold">Fund Download</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsTrancheModalOpen(true)}
                            className="brand-focus flex h-[90px] flex-col items-center justify-center rounded-[20px] border border-[var(--brand-navy)]/20 bg-white text-[var(--brand-navy)] shadow-[0_2px_8px_rgba(13,45,88,0.08)] transition hover:-translate-y-0.5 hover:border-[var(--brand-gold)] hover:shadow-[0_8px_20px_rgba(13,45,88,0.12)]"
                        >
                            <WalletCards className="mb-2 h-5 w-5" />
                            <span className="text-sm font-extrabold">Manage Tranches</span>
                        </button>
                    </div>
                </div>

                <div className="mt-[22px] grid grid-cols-1 gap-6 lg:grid-cols-2">
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
                certificateProgress={project.accomplishment_percentage || 15}
            />
            {isTrancheModalOpen && (
                <TrancheManagementModal
                    isOpen={isTrancheModalOpen}
                    onClose={() => setIsTrancheModalOpen(false)}
                    project={project}
                    trancheFund={trancheFund}
                    onSaved={setTrancheFund}
                    formatCurrency={formatCurrency}
                />
            )}
        </motion.div>
    );
};

const ProjectProcess = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 9;

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [region, setRegion] = useState('');
    const [division, setDivision] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const [statusCounts, setStatusCounts] = useState({ total: 0, tranche_1: 0, tranche_2: 0, tranche_3: 0 });
    const [filterOptions, setFilterOptions] = useState({ regions: [], divisions: [] });
    const [selectedProject, setSelectedProject] = useState(null);

    const fetchProjects = async (currentPage, search, status, school, reg, div) => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage,
                limit,
                search: search || '',
                status: status || '',
                school_id: school || '',
                region: reg || '',
                division: div || ''
            }).toString();

            const response = await api.get(`/projects/process?${queryParams}`);
            const { data, total, statusCounts: counts, filterOptions: options } = response.data;

            setProjects(data || []);
            setTotalItems(total || 0);
            setTotalPages(Math.ceil((total || 0) / limit));
            if (counts) setStatusCounts(counts);
            if (options) {
                setFilterOptions({
                    regions: Array.isArray(options.regions) ? options.regions : [],
                    divisions: Array.isArray(options.divisions) ? options.divisions : []
                });
            }
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchProjects(1, searchQuery, statusFilter, schoolId, region, division);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, schoolId, region, division]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            fetchProjects(newPage, searchQuery, statusFilter, schoolId, region, division);
            document.getElementById('project-scroll-area').scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return 'PHP 0.00';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const getStatusStyle = (status) => {
        const normalizedStatus = String(status ?? '').toLowerCase();

        if (normalizedStatus.includes('complete')) {
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        }

        if (normalizedStatus.includes('progress') || normalizedStatus.includes('active') || normalizedStatus.includes('ongoing')) {
            return 'border-[var(--brand-navy)]/20 bg-[var(--brand-sky)] text-[var(--brand-navy)]';
        }

        return 'border-[var(--brand-gold)]/35 bg-[var(--brand-gold-soft)] text-[var(--brand-navy)]';
    };

    return (
        <div className="app-shell relative flex min-h-screen flex-col overflow-hidden font-sans text-[var(--ink)]">
            <Sidebar />
            <main id="project-scroll-area" className="h-screen flex-1 overflow-y-auto pb-28 app-scroll">
                <AnimatePresence mode="wait">
                    {selectedProject ? (
                        <ProjectDetailView project={selectedProject} onBack={() => setSelectedProject(null)} />
                    ) : (
                        <motion.div
                            key="project-list-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                <PageHeader
                    eyebrow="Infrastructure Registry"
                    title="Project List"
                    subtitle="Search, filter, and review project records with consistent academic finance context."
                    action={
                        <div className="brand-card flex h-[92px] w-full flex-col items-center justify-center rounded-[var(--radius-lg)] px-5 md:w-[176px]">
                            <p className="brand-kicker">Total Projects</p>
                            <p className="mt-2 text-4xl font-extrabold leading-none text-[var(--ink)]">{statusCounts.total.toLocaleString()}</p>
                        </div>
                    }
                />

                <div className="mx-auto max-w-7xl px-5 py-7 sm:px-7 lg:px-8">
                    <div className="grid grid-cols-1 gap-[18px] md:grid-cols-3">
                        <TrancheCard
                            title="Total Projects under Tranche 1"
                            count={statusCounts.tranche_1}
                            onClick={() => setStatusFilter(statusFilter === 'tranche_1' ? '' : 'tranche_1')}
                        />
                        <TrancheCard
                            title="Total Projects under Tranche 2"
                            count={statusCounts.tranche_2}
                            onClick={() => setStatusFilter(statusFilter === 'tranche_2' ? '' : 'tranche_2')}
                        />
                        <TrancheCard
                            title="Total Projects under Tranche 3"
                            count={statusCounts.tranche_3}
                            onClick={() => setStatusFilter(statusFilter === 'tranche_3' ? '' : 'tranche_3')}
                        />
                    </div>

                    <div className="mt-7 flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="brand-input h-14 rounded-[var(--radius-md)] pl-14 pr-4 text-base font-semibold md:text-lg"
                                placeholder="Search projects..."
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilters((value) => !value)}
                            className="brand-button-secondary brand-focus flex h-14 items-center justify-center gap-3 rounded-[var(--radius-md)] px-6 text-base font-extrabold md:w-[120px]"
                        >
                            <Funnel className="h-5 w-5" />
                            <span>Filter</span>
                        </button>
                    </div>

                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="brand-card mt-3 grid grid-cols-1 gap-3 rounded-[var(--radius-lg)] p-4 md:grid-cols-3"
                        >
                            <select value={region} onChange={(e) => setRegion(e.target.value)}
                                className="brand-input h-12 rounded-[var(--radius-sm)] px-4 text-sm font-semibold">
                                <option value="">All Regions</option>
                                {filterOptions.regions.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <select value={division} onChange={(e) => setDivision(e.target.value)}
                                className="brand-input h-12 rounded-[var(--radius-sm)] px-4 text-sm font-semibold">
                                <option value="">All Divisions</option>
                                {filterOptions.divisions.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                            <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="School ID"
                                className="brand-input h-12 rounded-[var(--radius-sm)] px-4 text-sm font-semibold" />
                        </motion.div>
                    )}

                    <div className="mt-7">
                        <SectionTitle title="List of Projects"/>
                    </div>

                    {isLoading ? (
                        <div className="mt-4 space-y-[14px]">
                            {[...Array(4)].map((_, i) => (
                                <SkeletonBlock key={i} className="h-48" />
                            ))}
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="mt-4">
                            <EmptyState icon={Search} title="No Projects Found" description="Adjust your search or filter parameters to find what you're looking for." />
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            <motion.div className="mt-4 space-y-[14px]">
                                {projects.map((project, index) => (
                                    <motion.article
                                        key={project.project_id}
                                        initial={{ opacity: 0, y: 14 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98 }}
                                        transition={{ duration: 0.25, delay: index * 0.03 }}
                                        onClick={() => setSelectedProject(project)}
                                        className="brand-card brand-card-hover cursor-pointer rounded-[var(--radius-lg)] px-5 py-5 md:px-6 md:py-6"
                                    >
                                        <div className="flex items-start justify-between gap-3 sm:gap-4">
                                            <div className="min-w-0 flex-1">
                                                <span className={`mb-3 inline-flex max-w-full shrink-0 truncate whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold sm:px-4 sm:text-sm ${getStatusStyle(project.accomplishment_status)}`}>
                                                    {project.accomplishment_status || 'Active'}
                                                </span>
                                                <h3 className="text-lg font-extrabold leading-snug text-[var(--ink)] md:text-xl">
                                                    {getProjectTitle(project)}
                                                </h3>
                                                <div className="mt-4 flex items-center gap-3 text-base font-bold text-[var(--ink-soft)]">
                                                    <MapPin className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                                                    <span className="truncate">{project.region || 'No Region'} | {project.division || 'No Division'} | {project.municipality || 'No Municipality'} | {project.district || 'No District'} </span>
                                                </div>
                                            </div>
                                            <span className={`inline-flex max-w-[46%] shrink-0 truncate whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-bold sm:max-w-[280px] sm:px-4 sm:text-sm ${getStatusStyle(project.status_of_construction_phase)}`}>
                                                {project.status_of_construction_phase || 'Active'}
                                            </span>
                                        </div>

                                        <div className="mt-5 border-t border-[var(--line-soft)] pt-4">
                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                {[
                                                    ['Total Budget', formatCurrency(project.contract_amount)],
                                                    ['Total Funds Released', formatCurrency(project.approved_budget_for_contract)],
                                                    ['Total Liquidation', formatCurrency(project.approved_budget_for_contract)],
                                                    [project.latest_tranche_status || getLatestTrancheStatus(project), formatCurrency(getLatestTrancheAmount(project))]
                                                ].map(([label, value]) => (
                                                    <div
                                                        key={label}
                                                        className="rounded-xl border border-[var(--line)] bg-[var(--surface-soft)] p-4 shadow-sm transition hover:border-[var(--brand-navy)]/20 hover:bg-white hover:shadow-md"
                                                    >
                                                        <p className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--muted)]">
                                                            {label}
                                                        </p>
                                                        <p className="mt-2 break-words text-base font-extrabold text-[var(--ink)] md:text-lg">
                                                            {value}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.article>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}

                    {!isLoading && projects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="brand-card mt-5 flex flex-col items-center justify-between gap-4 rounded-[var(--radius-lg)] px-5 py-4 sm:flex-row"
                        >
                            <p className="text-sm font-semibold text-slate-500">
                                Showing <span className="font-bold text-slate-800">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-slate-800">{Math.min(page * limit, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> projects
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="brand-button-secondary brand-focus rounded-lg p-2 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="px-3 text-sm font-bold text-[var(--ink-soft)]">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="brand-button-secondary brand-focus rounded-lg p-2 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProjectProcess;
