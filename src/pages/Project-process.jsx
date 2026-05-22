import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Building2, MapPin, Activity, Layers, GraduationCap, Briefcase, Filter, CheckCircle2, Clock } from 'lucide-react';
import Sidebar from "../components/Sidebar";
import api from '../utils/api';

const ProjectProcess = () => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const limit = 9;

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [schoolId, setSchoolId] = useState('');
    const [region, setRegion] = useState('');
    const [division, setDivision] = useState('');

    // Status Counts State
    const [statusCounts, setStatusCounts] = useState({ total: 0, ongoing: 0, completed: 0, not_started: 0 });

    // Modal State
    const [selectedProject, setSelectedProject] = useState(null);

    // Fetch Data Function
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
            const { data, total, statusCounts: counts } = response.data;

            setProjects(data || []);
            setTotalItems(total || 0);
            setTotalPages(Math.ceil((total || 0) / limit));
            if (counts) setStatusCounts(counts);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced Search & Filter Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchProjects(1, searchQuery, statusFilter, schoolId, region, division);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery, statusFilter, schoolId, region, division]);

    // Pagination Handler
    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setPage(newPage);
            fetchProjects(newPage, searchQuery, statusFilter, schoolId, region, division);
            document.getElementById('project-scroll-area').scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '₱ 0.00';
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
    };

    const StatusCard = ({ title, count, icon: Icon, isActive, onClick, colorClass }) => (
        <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`relative overflow-hidden p-5 rounded-3xl border text-left transition-all duration-300 flex-1 min-w-[200px] ${isActive
                ? `bg-white shadow-[0_8px_30px_rgb(0,0,0,0.08)] ${colorClass.border} ring-1 ${colorClass.ring}`
                : 'bg-white/60 hover:bg-white border-slate-200/60 hover:shadow-sm'
                }`}
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${isActive ? colorClass.bg : 'bg-slate-100'}`}>
                    <Icon className={`w-5 h-5 ${isActive ? colorClass.text : 'text-slate-500'}`} />
                </div>
                <span className={`text-2xl font-extrabold ${isActive ? colorClass.textCount : 'text-slate-700'}`}>
                    {count.toLocaleString()}
                </span>
            </div>
            <h3 className={`text-sm font-bold tracking-wide ${isActive ? colorClass.textCount : 'text-slate-500'}`}>
                {title}
            </h3>
        </motion.button>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

            <main id="project-scroll-area" className="flex-1 p-6 md:p-10 lg:p-12 pb-24 md:pb-10 h-screen overflow-y-auto z-10 custom-scrollbar">

                {/* Header Area */}
                <header className="mb-8">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0B3A68] to-[#2563eb] tracking-tight mb-2">
                            Project Allocated
                        </h2>
                        <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl">
                            Detailed status overview of departmental resource allocation and construction phases.
                        </p>
                    </motion.div>
                </header>

                {/* Status Navigation Cards */}
                <div className="flex flex-wrap gap-4 mb-8">
                    <StatusCard
                        title="Total Projects" count={statusCounts.total} icon={Briefcase}
                        isActive={statusFilter === ''} onClick={() => setStatusFilter('')}
                        colorClass={{ border: 'border-blue-200', ring: 'ring-blue-100', bg: 'bg-blue-50', text: 'text-blue-600', textCount: 'text-[#0B3A68]' }}
                    />
                    <StatusCard
                        title="Ongoing Phase" count={statusCounts.ongoing} icon={Activity}
                        isActive={statusFilter === 'ongoing'} onClick={() => setStatusFilter('ongoing')}
                        colorClass={{ border: 'border-amber-200', ring: 'ring-amber-100', bg: 'bg-amber-50', text: 'text-amber-600', textCount: 'text-amber-700' }}
                    />
                    <StatusCard
                        title="Not Yet Started" count={statusCounts.not_started} icon={Clock}
                        isActive={statusFilter === 'not_started'} onClick={() => setStatusFilter('not_started')}
                        colorClass={{ border: 'border-slate-300', ring: 'ring-slate-200', bg: 'bg-slate-100', text: 'text-slate-600', textCount: 'text-slate-700' }}
                    />
                    <StatusCard
                        title="Completed" count={statusCounts.completed} icon={CheckCircle2}
                        isActive={statusFilter === 'completed'} onClick={() => setStatusFilter('completed')}
                        colorClass={{ border: 'border-emerald-200', ring: 'ring-emerald-100', bg: 'bg-emerald-50', text: 'text-emerald-600', textCount: 'text-emerald-700' }}
                    />
                </div>

                {/* Filters Area */}
                <div className="bg-white/60 backdrop-blur-md border border-slate-200/80 p-4 rounded-2xl mb-10 flex flex-col lg:flex-row gap-4 shadow-sm">
                    {/* Search Bar */}
                    <div className="relative flex-1 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-300">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-[#0B3A68]" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium transition-all outline-none"
                            placeholder="Search ID, Project, or School Name..."
                        />
                    </div>

                    {/* Advanced Filters */}
                    <div className="flex flex-wrap lg:flex-nowrap gap-4">
                        <div className="relative min-w-[140px] flex-1">
                            <input type="text" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Filter Region"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium outline-none" />
                        </div>
                        <div className="relative min-w-[140px] flex-1">
                            <input type="text" value={division} onChange={(e) => setDivision(e.target.value)} placeholder="Filter Division"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium outline-none" />
                        </div>
                        <div className="relative min-w-[140px] flex-1">
                            <input type="text" value={schoolId} onChange={(e) => setSchoolId(e.target.value)} placeholder="School ID"
                                className="block w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium outline-none" />
                        </div>
                    </div>
                </div>

                {/* Cards Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-72 bg-slate-200/50 animate-pulse rounded-3xl border border-slate-100"></div>
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-md rounded-3xl border border-dashed border-slate-300">
                        <Search className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">No Projects Found</h3>
                        <p className="text-slate-500 mt-2">Adjust your search or status parameters to find what you're looking for.</p>
                    </motion.div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <motion.div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                            {projects.map((project, index) => (
                                <motion.div
                                    key={project.project_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, delay: index * 0.05 }}
                                    whileHover={{ y: -6 }}
                                    onClick={() => setSelectedProject(project)}
                                    className="group relative bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-[#0B3A68] opacity-0 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:opacity-10 group-hover:scale-150 pointer-events-none"></div>

                                    <div>
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                <Layers className="w-3.5 h-3.5 text-[#0B3A68]" />
                                                Batch {project.batch_of_funds || 'N/A'}
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${project.status_of_construction_phase?.toLowerCase().includes('complete') ? 'bg-emerald-50 text-emerald-600' :
                                                project.status_of_construction_phase?.toLowerCase().includes('progress') ? 'bg-blue-50 text-blue-600' :
                                                    'bg-amber-50 text-amber-600'
                                                }`}>
                                                {project.status_of_construction_phase || 'Pending'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-extrabold text-slate-800 leading-tight mb-3 group-hover:text-[#0B3A68] transition-colors line-clamp-2">
                                            {project.project_name || 'Unnamed Project'}
                                        </h3>

                                        <div className="space-y-2.5 mb-6">
                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                    <GraduationCap className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="font-medium line-clamp-1">{project.school_name || 'No School'} (ID: {project.school_id})</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-600">
                                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <span className="font-medium">{project.region} • {project.division}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto border-t border-slate-50 pt-5">
                                        <div className="flex items-end justify-between mb-4">
                                            <div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Approved Budget</p>
                                                <p className="text-xl font-extrabold text-slate-800">
                                                    {formatCurrency(project.approved_budget_for_contract)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-slate-500 uppercase">Accomplishment</span>
                                                <span className="text-[#0B3A68]">{project.accomplishment_percentage || 0}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${Math.min(100, Math.max(0, project.accomplishment_percentage || 0))}%` }}
                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-[#0B3A68] to-blue-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Pagination Controls */}
                {!isLoading && projects.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/70 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/60 shadow-sm"
                    >
                        <p className="text-sm font-medium text-slate-500">
                            Showing <span className="font-bold text-slate-800">{((page - 1) * limit) + 1}</span> to <span className="font-bold text-slate-800">{Math.min(page * limit, totalItems)}</span> of <span className="font-bold text-slate-800">{totalItems}</span> projects
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0B3A68] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, idx) => {
                                    const pageNum = idx + 1;
                                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm transition-all shadow-sm ${page === pageNum
                                                    ? 'bg-[#0B3A68] text-white border-transparent'
                                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0B3A68]'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                                        return <span key={pageNum} className="w-8 text-center text-slate-400">...</span>;
                                    }
                                    return null;
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page === totalPages}
                                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0B3A68] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Project Details Modal */}
                <AnimatePresence>
                    {selectedProject && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                onClick={() => setSelectedProject(null)}
                                className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-extrabold text-[#0B3A68] mb-1">{selectedProject.project_name || 'Unnamed Project'}</h3>
                                        <p className="text-sm text-slate-500 font-medium">Project ID: {selectedProject.project_id}</p>
                                    </div>
                                    <button onClick={() => setSelectedProject(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                                <div className="p-6 space-y-4 bg-slate-50">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                                        <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Tranche Disbursements</h4>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tranche 1</label>
                                            <input type="number" placeholder="Enter amount" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3A68] focus:border-[#0B3A68] outline-none text-sm font-medium text-slate-800" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tranche 2</label>
                                            <input type="number" placeholder="Enter amount" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3A68] focus:border-[#0B3A68] outline-none text-sm font-medium text-slate-800" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1">Tranche 3</label>
                                            <input type="number" placeholder="Enter amount" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0B3A68] focus:border-[#0B3A68] outline-none text-sm font-medium text-slate-800" />
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6 border-t border-slate-100 bg-white flex justify-end">
                                    <button onClick={() => setSelectedProject(null)} className="px-6 py-2.5 bg-[#0B3A68] hover:bg-[#092a4a] text-white font-bold rounded-xl transition-colors">
                                        Close
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

            </main>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
            <Sidebar />
        </div>
    );
};

export default ProjectProcess;