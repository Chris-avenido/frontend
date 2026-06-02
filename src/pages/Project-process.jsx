import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Search,
    Funnel
} from 'lucide-react';
import Sidebar from "../components/Sidebar";
import api from '../utils/api';
import { EmptyState, PageHeader, SectionTitle, SkeletonBlock } from '../components/BrandUI';

const encodeProjectId = (projectId) => {
    const encoded = window.btoa(String(projectId));
    return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

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
const ProjectProcess = () => {
    const navigate = useNavigate();
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
                    <motion.div
                            key="project-list-view"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }}
                        >
                <PageHeader
                    eyebrow="InsightED Infrastructure"
                    title="Project List"
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
                                        onClick={() => navigate(`/project-view/${encodeProjectId(project.project_id)}`)}
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
                </AnimatePresence>
            </main>
        </div>
    );
};

export default ProjectProcess;

