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
    Settings
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

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans overflow-hidden">
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
                                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm">InsightED Infrastructure</h1>
                                <p className="text-[#A3C6E8] font-bold text-sm md:text-base mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm">Project List</p>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex flex-col items-center justify-center min-w-[160px] shadow-lg"
                        >
                            <p className="text-[#A3C6E8] text-[10px] font-black uppercase tracking-widest mb-1">Total Projects</p>
                            <p className="text-3xl font-black text-white tracking-tight">{isLoading ? "..." : statusCounts.total.toLocaleString()}</p>
                        </motion.div>
                    </div>
                </div>

                {/* Main Content Dashboard */}
                <div className="max-w-7xl mx-auto px-5 md:px-12 -mt-12 relative z-20 space-y-8">
                    
                    {/* Project Statistics / Tranche Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {[
                            { title: 'Tranche 1', count: statusCounts.tranche_1, color: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-100', filter: 'tranche_1' },
                            { title: 'Tranche 2', count: statusCounts.tranche_2, color: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-100', filter: 'tranche_2' },
                            { title: 'Tranche 3', count: statusCounts.tranche_3, color: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-100', filter: 'tranche_3' },
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
                                    className={`bg-white rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all duration-300 cursor-pointer ${isSelected ? 'border-2 ' + stat.border.replace('100', '400') + ' shadow-md' : 'border ' + stat.border}`}
                                >
                                    <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.color}`}></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-2">Total Projects under</p>
                                    <div className="flex justify-between items-end pl-2">
                                        <h4 className={`text-lg font-black ${stat.text} tracking-tight`}>{stat.title}</h4>
                                        <span className="text-4xl font-black text-slate-800 tracking-tight">{isLoading ? "..." : stat.count}</span>
                                    </div>
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-current" style={{ color: stat.color.replace('bg-', '') }}></div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 text-sm font-bold text-slate-800 focus:outline-none focus:border-[#0B3A68] focus:ring-1 focus:ring-[#0B3A68] transition-all"
                                placeholder="Search projects by name or school..."
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`h-12 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${showFilters ? 'bg-[#0B3A68] text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100'}`}
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
                                <select value={region} onChange={(e) => setRegion(e.target.value)} className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#0B3A68]">
                                    <option value="">All Regions</option>
                                    {filterOptions.regions.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <select value={division} onChange={(e) => setDivision(e.target.value)} className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#0B3A68]">
                                    <option value="">All Divisions</option>
                                    {filterOptions.divisions.map((item) => <option key={item} value={item}>{item}</option>)}
                                </select>
                                <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="Filter by School ID" className="h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#0B3A68]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* List of Projects */}
                    <div>
                        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2.5 tracking-tight mb-5">
                            <Layers className="w-5 h-5 text-[#0B3A68]" /> 
                            List of Projects
                        </h2>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-40 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
                                ))}
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="bg-white rounded-2xl p-10 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
                                <Search className="w-12 h-12 text-slate-300 mb-4" />
                                <h3 className="text-lg font-black text-slate-800 mb-1">No Projects Found</h3>
                                <p className="text-sm font-semibold text-slate-500">Adjust your search or filter parameters to find what you're looking for.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence mode="popLayout">
                                    {projects.map((project, index) => (
                                        <motion.article
                                            key={project.project_id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            onClick={() => navigate(`/project-view/${encodeProjectId(project.project_id)}`)}
                                            className="bg-white rounded-2xl p-5 md:p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer relative overflow-hidden group"
                                        >
                                            {/* Top Line: Badges */}
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.project_category && project.project_category.toLowerCase() === 'new' ? 'bg-[#FFF8EB] border-[#FDE1AC] text-[#D97706] border' : getStatusStyle(project.project_category)}`}>
                                                    {project.project_category || 'New'}
                                                </span>
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${project.is_eligible === false ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                                                    {project.is_eligible === false ? 'Not Eligible' : 'Eligible'}
                                                </span>
                                            </div>

                                            {/* Title and Subtitle */}
                                            <div className="mb-6">
                                                <h3 className="text-lg md:text-xl font-black text-[#0B3A68] tracking-tight leading-snug group-hover:text-[#154b82] transition-colors">
                                                    {getProjectTitle(project)} <span className="text-slate-400 font-bold">({project.school_name || 'Maniwaya Elementary School'} | {project.school_id || '123456'})</span>
                                                </h3>
                                                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="truncate">{project.region || 'Region'} | {project.division || 'Division'} | {project.municipality || 'Municipality'} | {project.district || 'Legislative District'}</span>
                                                </div>
                                            </div>

                                            {/* Bottom Badges/Values */}
                                            <div className="flex flex-wrap gap-2.5">
                                                {[
                                                    ['Total Budget', formatCurrency(project.contract_amount)],
                                                    ['Total Funds Released', formatCurrency(project.approved_budget_for_contract)],
                                                    ['Total Liquidation', formatCurrency(project.approved_budget_for_contract * 0.42)],
                                                    [project.latest_tranche_status || getLatestTrancheStatus(project), formatCurrency(getLatestTrancheAmount(project))]
                                                ].map(([label, value]) => (
                                                    <div key={label} className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center gap-2 transition-colors group-hover:bg-slate-100">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}:</span>
                                                        <span className="text-xs font-black text-slate-800">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.article>
                                    ))}
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
                                Showing <span className="text-[#0B3A68]">{((page - 1) * limit) + 1}</span> to <span className="text-[#0B3A68]">{Math.min(page * limit, totalItems)}</span> of <span className="text-[#0B3A68]">{totalItems}</span> projects
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Page {page} of {totalPages}</span>
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
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-6 py-3 pb-safe">
                <div className="flex items-center justify-between max-w-sm mx-auto">
                    <Link to="/" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0B3A68] transition-colors">
                        <div className="p-2.5 rounded-2xl hover:bg-slate-50">
                            <HomeIcon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight">Home</span>
                    </Link>
                    <Link to="/projects-list" className="flex flex-col items-center gap-1 text-[#0B3A68]">
                        <div className="bg-[#EBF2F9] p-2.5 rounded-2xl shadow-sm border border-[#0B3A68]/10">
                            <FolderKanban className="w-6 h-6 fill-current" />
                        </div>
                        <span className="text-[11px] font-black tracking-tight">Projects</span>
                    </Link>
                    <Link to="/profile" className="flex flex-col items-center gap-1 text-slate-400 hover:text-[#0B3A68] transition-colors">
                        <div className="p-2.5 rounded-2xl hover:bg-slate-50">
                            <Settings className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold tracking-tight">Settings</span>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default ProjectProcess;

