import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Search,
    Funnel,
    Layers,
    Home as HomeIcon,
    FolderKanban,
    Settings,
    LayoutGrid,
    List,
    ArrowRight,
    Clock,
    CheckCircle2,
    Building2
} from 'lucide-react';
import Sidebar from "../components/Sidebar";
import api from '../utils/api';
import {
    encodeProjectId,
    getLatestTrancheStatus,
    getLatestTrancheAmount,
    getProjectTitle,
    getStatusStyle
} from '../features/projects/utils/projectHelpers';
import { formatCurrency } from '../shared/utils/formatters';
import newLogo from '../assets/new_logo.png';
import './Dashboard.css';

const ProjectProcess = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table');
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
        document.body.classList.add('dashboard-body');
        const timer = setTimeout(() => {
            setPage(1);
            fetchProjects(1, searchQuery, statusFilter, schoolId, region, division);
        }, 500);
        return () => {
            clearTimeout(timer);
            document.body.classList.remove('dashboard-body');
        };
    }, [searchQuery, statusFilter, schoolId, region, division]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            fetchProjects(newPage, searchQuery, statusFilter, schoolId, region, division);
            document.getElementById('project-scroll-area').scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className="flex h-screen overflow-hidden text-[var(--text)]" style={{ fontFamily: 'var(--font-body)' }}>
            <Sidebar />
            <main id="project-scroll-area" className="flex-1 overflow-y-auto pb-32 relative app-scroll">

                {/* Header Section */}
                <div className="bg-gradient-to-br from-[#0B3A68] to-[#154b82] pt-12 pb-24 px-6 md:px-12 relative overflow-hidden shadow-md">
                    {/* Subtle background pattern */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
                        <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="50" fill="currentColor" />
                            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
                            <circle cx="50" cy="50" r="30" fill="currentColor" />
                        </svg>
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className="flex items-center gap-5"
                        >
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1.5 shrink-0 border border-white/20">
                                <img src={newLogo} alt="Department of Education Logo" className="w-full h-full object-contain drop-shadow-sm" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm" style={{ fontFamily: 'var(--font-heading)' }}>InsightED Infrastructure</h1>
                                <p className="text-[#A3C6E8] font-bold text-sm md:text-base mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm" style={{ fontFamily: 'var(--font-body)' }}>Project List</p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[160px] shadow-lg"
                        >
                            <p className="text-[#A3C6E8] text-[10px] font-black uppercase tracking-widest mb-1" style={{ fontFamily: 'var(--font-body)' }}>Total Projects</p>
                            <p className="text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>{isLoading ? "..." : statusCounts.total.toLocaleString()}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content Dashboard */}
                <div className="max-w-7xl mx-auto px-5 md:px-12 -mt-12 relative z-20 space-y-8">

                    {/* Project Statistics / Tranche Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { title: 'Tranche 1', count: statusCounts.tranche_1, accent: 'blue', filter: 'tranche_1' },
                            { title: 'Tranche 2', count: statusCounts.tranche_2, accent: 'gold', filter: 'tranche_2' },
                            { title: 'Tranche 3', count: statusCounts.tranche_3, accent: 'red', filter: 'tranche_3' },
                        ].map((stat, idx) => {
                            const isSelected = statusFilter === stat.filter;
                            return (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 + (idx * 0.1) }}
                                    onClick={() => setStatusFilter(isSelected ? '' : stat.filter)}
                                    whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08)' }}
                                    className={`dashboard-card relative overflow-hidden transition-all duration-300 p-6 flex flex-col justify-between cursor-pointer ${isSelected ? 'ring-2 ring-[var(--gold)] shadow-md' : ''}`}
                                >
                                    <div className={`kpi-accent ${stat.accent} absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto`}></div>
                                    <div className="pl-3 w-full">
                                        <p className="kpi-label mb-3">Total Projects under</p>
                                        <div className="flex justify-between items-end">
                                            <h4 className="text-lg font-black text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>{stat.title}</h4>
                                            <span className="kpi-value">{isLoading ? "..." : stat.count}</span>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[var(--gold)]"></div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)] focus:ring-1 focus:ring-[var(--blue)] transition-all"
                                placeholder="Search projects by name or school..."
                                style={{ fontFamily: 'var(--font-body)' }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${showFilters ? 'bg-[var(--blue)] text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                        >
                            <Funnel className="w-4 h-4" />
                            Filter
                        </button>
                    </div>

                    {/* Expanded Filters */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -10 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -10 }}
                                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4"
                            >
                                <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)]">
                                    <option value="">All Regions</option>
                                    {filterOptions.regions.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <select value={division} onChange={(e) => setDivision(e.target.value)} className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)]">
                                    <option value="">All Divisions</option>
                                    {filterOptions.divisions.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="Filter by School ID" className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* List of Projects */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                                <Layers className="w-5 h-5 text-[var(--blue)]" />
                                List of Projects
                            </h2>
                            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                                <button
                                    onClick={() => setViewMode('card')}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'card' ? 'bg-[var(--blue)] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                    title="Card View"
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setViewMode('table')}
                                    className={`p-2 rounded-lg flex items-center justify-center transition-all ${viewMode === 'table' ? 'bg-[var(--blue)] text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                    title="Table View"
                                >
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                                <Search className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-black text-slate-800 mb-1" style={{ fontFamily: 'var(--font-heading)' }}>No Projects Found</h3>
                                <p className="text-sm font-semibold text-slate-500">Adjust your search or filter parameters to find what you're looking for.</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : ''}>
                                <AnimatePresence mode="popLayout">
                                    {viewMode === 'card' ? (
                                        projects.map((project, index) => (
                                            <motion.article
                                                key={project.project_id}
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                onClick={() => navigate(`/project-view/${encodeProjectId(project.project_id)}`)}
                                                className="dashboard-card group relative flex flex-col p-6 md:p-8 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all cursor-pointer"
                                            >
                                                {/* Top Line: Avatar and Badges */}
                                                {/* Top Line: Avatar and Badges */}
                                                <div className="flex justify-between items-start mb-6 w-full">
                                                    <div className="w-[60px] h-[60px] bg-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(7,89,133,0.12)] border border-[var(--blue-100)] text-[var(--blue)] shrink-0">
                                                        <Building2 className="w-7 h-7 stroke-[1.5]" />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-[var(--gold)] text-white">
                                                            OIC
                                                        </span>
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.is_eligible === false ? 'bg-red-50 text-[var(--red)]' : 'bg-[#ecfdf5] text-[#10b981]'}`}>
                                                            {project.is_eligible === false ? 'INACTIVE' : 'ACTIVE'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Title and Subtitle */}
                                                <div className="mb-8">
                                                    <h3 className="text-[20px] font-black italic text-[var(--navy)] tracking-tight leading-tight mb-2 group-hover:text-[var(--blue)] transition-colors line-clamp-2" style={{ fontFamily: 'var(--font-heading)' }}>
                                                        [ STAGING ] {getProjectTitle(project).toUpperCase()}
                                                    </h3>
                                                    <div className="text-[10px] font-black text-[var(--blue)] uppercase tracking-widest flex items-center gap-1.5">
                                                        <span className="truncate">{project.school_name?.toUpperCase() || 'ASSISTANT SCHOOLS DIVISION SUPERINTENDENT'}</span>
                                                        <Clock className="w-3 h-3 text-[var(--muted)] shrink-0" />
                                                    </div>
                                                </div>

                                                {/* Key-Values */}
                                                <div className="space-y-4 mb-8 w-full">
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest shrink-0">STRAND</span>
                                                        <span className="text-[11px] font-bold text-[var(--navy)] text-right ml-4">{project.region || 'Region VII'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest shrink-0">OFFICE</span>
                                                        <span className="text-[11px] font-bold text-[var(--navy)] text-right ml-4">{project.division || 'Regional Office'}</span>
                                                    </div>
                                                </div>

                                                {/* Action Pills */}
                                                <div className="flex flex-wrap gap-2 mb-8 mt-auto">
                                                    <div className="bg-[#fff7ed] text-[#ea580c] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                                        <Layers className="w-3 h-3" />
                                                        REASSIGN
                                                    </div>
                                                    <div className="bg-red-50 text-[var(--red)] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                                        <Clock className="w-3 h-3" />
                                                        VACATE
                                                    </div>
                                                    <div className="bg-[#ecfdf5] text-[#10b981] px-3 py-1.5 rounded-md flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        SUCCEED
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-0 mt-auto">
                                                    <span className="text-[10px] font-black italic text-slate-300 uppercase tracking-widest group-hover:text-[var(--blue)] transition-colors flex items-center gap-1.5">
                                                        FULL PROFILE <ArrowRight className="w-3 h-3" />
                                                    </span>
                                                    <div className="w-8 h-8 rounded-full bg-[var(--blue-50)] flex items-center justify-center text-[var(--muted)] group-hover:bg-[var(--blue-100)] transition-colors">
                                                        <Clock className="w-3.5 h-3.5" />
                                                    </div>
                                                </div>
                                            </motion.article>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto w-full"
                                        >
                                            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
                                                        <th className="px-5 py-4">Project Details</th>
                                                        <th className="px-5 py-4">Location & District</th>
                                                        <th className="px-5 py-4 text-center">Status</th>
                                                        <th className="px-5 py-4 text-right">Budget & Released</th>
                                                        <th className="px-5 py-4 text-right">Latest Tranche</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {projects.map((project, index) => (
                                                        <tr
                                                            key={project.project_id}
                                                            onClick={() => navigate(`/project-view/${encodeProjectId(project.project_id)}`)}
                                                            className="hover:bg-slate-50 cursor-pointer group transition-colors"
                                                        >
                                                            <td className="px-5 py-4 max-w-[300px] truncate">
                                                                <div className="flex flex-col gap-1.5">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${project.project_category && project.project_category.toLowerCase() === 'new' ? 'bg-[#FFF8EB] border-[#FDE1AC] text-[#D97706] border' : getStatusStyle(project.project_category)}`}>
                                                                            {project.project_category || 'New'}
                                                                        </span>
                                                                        <span className="font-black text-[var(--navy)] text-sm group-hover:text-[var(--blue)] transition-colors truncate" style={{ fontFamily: 'var(--font-heading)' }}>{getProjectTitle(project)}</span>
                                                                    </div>
                                                                    <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                                                                        <span className="truncate">{project.school_name || 'Maniwaya Elementary School'}</span>
                                                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                        <span>{project.school_id || '123456'}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <div className="flex flex-col gap-1">
                                                                    <span className="text-[11px] font-bold text-[var(--navy)]">{project.region || 'Region'} | {project.division || 'Division'}</span>
                                                                    <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">{project.municipality || 'Municipality'} | {project.district || 'District'}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-center">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${project.is_eligible === false ? 'border-red-200 bg-red-50 text-[var(--red)]' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                                                    {project.is_eligible === false ? 'Not Eligible' : 'Eligible'}
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                <div className="font-black text-sm text-[var(--navy)]">{formatCurrency(project.contract_amount)}</div>
                                                                <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">Released: {formatCurrency(project.approved_budget_for_contract)}</div>
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                <div className="font-black text-sm text-[var(--blue)]">{formatCurrency(getLatestTrancheAmount(project))}</div>
                                                                <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest mt-0.5">{project.latest_tranche_status || getLatestTrancheStatus(project)}</div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {!isLoading && projects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                            className="bg-white border border-slate-200 shadow-sm mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:flex-row"
                        >
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                                Showing <span className="text-[var(--blue)]">{((page - 1) * limit) + 1}</span> to <span className="text-[var(--blue)]">{Math.min(page * limit, totalItems)}</span> of <span className="text-[var(--blue)]">{totalItems}</span> projects
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-[11px] font-black text-[var(--navy)] uppercase tracking-widest">Page {page} of {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </main>

            {/* Mobile Bottom Navigation Bar */}
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-6 py-3 pb-safe">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    <Link to="/home" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors">
                        <div className="p-2.5 rounded-2xl hover:bg-[var(--blue-50)]">
                            <HomeIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Home</span>
                    </Link>
                    <Link to="/projects-list" className="flex flex-col items-center gap-1 text-[var(--blue)]">
                        <div className="bg-[var(--blue-50)] p-2.5 rounded-2xl shadow-sm border border-[var(--blue-100)]">
                            <FolderKanban className="w-6 h-6 fill-current" />
                        </div>
                        <span className="text-[11px] font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Projects</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors">
                        <div className="p-2.5 rounded-2xl hover:bg-[var(--blue-50)]">
                            <Settings className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default ProjectProcess;
