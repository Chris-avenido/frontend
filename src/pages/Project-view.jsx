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

const trancheStatusLabels = {
    0: 'New',
    1: 'Tranche 1 Released',
    2: 'Tranche 2 Released',
    3: 'Tranche 3 Released',
    4: 'Completed'
};

const getTrancheStatusLabel = (flag) => trancheStatusLabels[Number(flag || 0)] || 'New';
const hasTrancheAmount = (value) => Number(value || 0) > 0;
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
        <div className="app-shell relative flex min-h-screen flex-col overflow-hidden font-sans text-[var(--ink)]">
            <Sidebar />
            <main className="h-screen flex-1 overflow-y-auto app-scroll">
                <AnimatePresence mode="wait">
                    {project ? (
                        <ProjectDetailView project={project} onBack={() => navigate('/projects-list')} />
                    ) : (
                        <motion.div
                            key="project-view-loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="mx-auto max-w-3xl px-5 py-12"
                        >
                            {isLoading ? (
                                <SkeletonBlock className="h-64" />
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
