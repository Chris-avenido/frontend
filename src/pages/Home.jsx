import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, Legend } from 'recharts';
import { MapContainer, TileLayer, CircleMarker, Tooltip as LeafletTooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { 
  Briefcase, 
  Wallet, 
  Layers, 
  TrendingUp, 
  Building2,
  PieChart as PieChartIcon,
  Home as HomeIcon,
  FolderKanban,
  Settings,
  Search,
  MapPin
} from 'lucide-react';
import newLogo from '../assets/new_logo.png';
import './Dashboard.css';

const formatCurrency = (value) => (
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(value)
);

const MAP_THEMES = {
  road: { name: 'Road', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', attribution: '&copy; OpenStreetMap contributors' },
  street: { name: 'Street', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  satellite: { name: 'Satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  terrain: { name: 'Terrain', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}', attribution: '&copy; Esri' },
  light: { name: 'Light', url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CARTO' },
  dark: { name: 'Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', attribution: '&copy; CARTO' }
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalProject, setTotalProject] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [tranche1, setTranche1] = useState(0);
  const [tranche2, setTranche2] = useState(0);
  const [tranche3, setTranche3] = useState(0);
  const [naCount, setNaCount] = useState(0);
  const [totalTrancheFund, setTotalTrancheFund] = useState(0);
  const [tranche1Amount, setTranche1Amount] = useState(0);
  const [tranche2Amount, setTranche2Amount] = useState(0);
  const [tranche3Amount, setTranche3Amount] = useState(0);

  const [dailyTrend, setDailyTrend] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [mapTheme, setMapTheme] = useState('dark');

  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedProjectName, setSelectedProjectName] = useState('');
  const [filterOptions, setFilterOptions] = useState({ regions: [], divisions: [], project_names: [] });

  useEffect(() => {
    document.body.classList.add('dashboard-body');
    return () => {
      document.body.classList.remove('dashboard-body');
    };
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          region: selectedRegion,
          division: selectedDivision,
          project_name: selectedProjectName
        }).toString();

        const promises = [api.get(`/projects/all-projects?${queryParams}`)];
        if (filterOptions.regions.length === 0) {
          promises.push(api.get('/projects/process?limit=1'));
        }

        const responses = await Promise.all(promises);
        const projRes = responses[0];
        
        const summary = projRes.data.summary;
        setTotalProject(Number(summary?.total_project || 0));
        setTotalBudget(Number(summary?.approved_budget_for_contract || 0));
        setTranche1(Number(summary?.tranche_1_count || 0));
        setTranche2(Number(summary?.tranche_2_count || 0));
        setTranche3(Number(summary?.tranche_3_count || 0));
        setNaCount(Number(summary?.na_count || 0));
        setTotalTrancheFund(Number(summary?.total_tranche_fund || 0));
        setTranche1Amount(Number(summary?.tranche_1_amount || 0));
        setTranche2Amount(Number(summary?.tranche_2_amount || 0));
        setTranche3Amount(Number(summary?.tranche_3_amount || 0));
        setDailyTrend(projRes.data.dailyTrend || []);
        setMapData(projRes.data.mapData || []);

        if (responses.length > 1) {
          const procRes = responses[1];
          if (procRes.data && procRes.data.filterOptions) {
            setFilterOptions({
              regions: Array.isArray(procRes.data.filterOptions.regions) ? procRes.data.filterOptions.regions : [],
              divisions: Array.isArray(procRes.data.filterOptions.divisions) ? procRes.data.filterOptions.divisions : [],
              project_names: Array.isArray(procRes.data.filterOptions.project_names) ? procRes.data.filterOptions.project_names : []
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedRegion, selectedDivision, selectedProjectName]);

  const pieData = [
    { name: 'Tranche 1', value: tranche1, amount: tranche1Amount },
    { name: 'Tranche 2', value: tranche2, amount: tranche2Amount },
    { name: 'Tranche 3', value: tranche3, amount: tranche3Amount },
    { name: 'N/A', value: naCount, amount: null }
  ];
  const totalPieValue = pieData.reduce((acc, cur) => acc + cur.value, 0);

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percent = totalPieValue > 0 ? ((data.value / totalPieValue) * 100).toFixed(1) : 0;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-black text-[var(--navy)] mb-1 text-sm">{data.name}</p>
          <p className="text-xs font-bold text-slate-600">Count: <span className="text-[var(--navy)]">{data.value}</span></p>
          <p className="text-xs font-bold text-slate-600">Percentage: <span className="text-[var(--navy)]">{percent}%</span></p>
          {data.name !== 'N/A' && (
            <p className="text-xs font-bold text-slate-600 mt-1">Amount: <span className="text-[var(--navy)]">{formatCurrency(data.amount)}</span></p>
          )}
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    if (percent === 0) return null;
    const radius = outerRadius * 1.15; // Put label outside
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
    return (
      <text x={x} y={y} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11" fontWeight="bold">
        {`${name} ${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text)]" style={{ fontFamily: 'var(--font-body)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-32 relative app-scroll">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#0B3A68] to-[#154b82] pt-12 pb-12 px-6 md:px-12 relative overflow-hidden shadow-md">
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="30" fill="currentColor" />
            </svg>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex items-center gap-5 max-w-7xl mx-auto"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1.5 shrink-0 border border-white/20">
              <img src={newLogo} alt="Department of Education Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm" style={{ fontFamily: 'var(--font-heading)' }}>InsightED Infrastructure</h1>
              <p className="text-[#A3C6E8] font-bold text-sm md:text-base mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm" style={{ fontFamily: 'var(--font-body)' }}>Budget Monitoring</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Dashboard */}
        <div className="max-w-7xl mx-auto px-5 md:px-12 mt-8 relative z-20 space-y-10">

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 relative z-30">
            <div className="relative flex-1 md:flex-[2]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)] pointer-events-none" />
              <select
                value={selectedProjectName}
                onChange={(e) => setSelectedProjectName(e.target.value)}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-10 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer appearance-none"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                <option value="">Search by Project Name...</option>
                {filterOptions.project_names.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              {selectedProjectName && (
                <button 
                  onClick={() => setSelectedProjectName('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 transition-colors z-10"
                  title="Clear Project Name"
                >
                  &times;
                </button>
              )}
            </div>
            <select 
              value={selectedRegion} 
              onChange={(e) => setSelectedRegion(e.target.value)} 
              className="h-12 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="">All Regions</option>
              {filterOptions.regions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select 
              value={selectedDivision} 
              onChange={(e) => setSelectedDivision(e.target.value)} 
              className="h-12 flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-bold text-[var(--navy)] focus:outline-none focus:border-[var(--blue)] transition-all cursor-pointer"
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <option value="">All Divisions</option>
              {filterOptions.divisions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            {(selectedRegion || selectedDivision || selectedProjectName) && (
              <button 
                onClick={() => {
                  setSelectedRegion('');
                  setSelectedDivision('');
                  setSelectedProjectName('');
                }}
                className="h-12 px-6 flex-shrink-0 bg-red-50 text-[var(--red)] border border-red-100 rounded-xl text-sm font-bold transition-all hover:bg-red-100"
                title="Clear All Filters"
              >
                Clear
              </button>
            )}
          </div>

          {/* Project Overview */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <PieChart className="w-5 h-5 text-[var(--blue)]" /> 
                Project Overview
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(11,58,104,0.15)' }}
                className="dashboard-card relative overflow-hidden group transition-all duration-300 p-7 flex items-start gap-6"
              >
                <div className="kpi-accent blue absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto"></div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--blue-50)] flex items-center justify-center text-[var(--blue)] shrink-0 relative z-10 shadow-sm border border-[var(--blue-100)]">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="relative z-10 w-full pl-2">
                  <p className="kpi-label">Total Projects</p>
                  <h3 className="kpi-value">{isLoading ? "..." : totalProject.toLocaleString()}</h3>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--blue-600)] bg-[var(--blue-50)] border border-[var(--blue-100)] w-fit px-2.5 py-1 rounded-md uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Active Nationwide</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(217,119,6,0.15)' }}
                className="dashboard-card relative overflow-hidden group transition-all duration-300 p-7 flex items-start gap-6"
              >
                <div className="kpi-accent gold absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto"></div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/20 flex items-center justify-center text-[var(--amber)] shrink-0 relative z-10 shadow-sm border border-[var(--gold)]/30">
                  <Wallet className="w-7 h-7" />
                </div>
                <div className="relative z-10 w-full pl-2">
                  <p className="kpi-label">Total Budget</p>
                  <h3 className="kpi-value text-3xl md:text-4xl truncate">{isLoading ? "..." : formatCurrency(totalBudget)}</h3>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--amber)] bg-[var(--gold)]/10 border border-[var(--gold)]/30 w-fit px-2.5 py-1 rounded-md uppercase tracking-wide">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Allocated Infrastructure Funds</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <motion.hr 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-[var(--line)]" 
          />

          {/* Project Statistics */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-3 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <Layers className="w-5 h-5 text-[var(--blue)]" /> 
                Project Statistics
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Summary Cards */}
              <div className="dashboard-card !items-stretch !gap-0 p-6 flex flex-col relative overflow-hidden transition-all duration-300">
                <h3 className="text-sm font-black text-[var(--navy)] uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex justify-between items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  Total per Tranche
                  <span className="bg-slate-100 text-[var(--muted)] text-[10px] px-2 py-0.5 rounded-full tracking-widest">
                    {isLoading ? "..." : `IN TRANCHE FUND: ${totalTrancheFund}`}
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  {[
                    { title: 'Tranche 1', count: tranche1, amount: tranche1Amount, accent: 'blue' },
                    { title: 'Tranche 2', count: tranche2, amount: tranche2Amount, accent: 'gold' },
                    { title: 'Tranche 3', count: tranche3, amount: tranche3Amount, accent: 'red' },
                    { title: 'N/A', count: naCount, amount: null, accent: 'slate' }
                  ].map((stat, idx) => (
                    <motion.div 
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.4 + (idx * 0.1) }}
                      whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08)' }}
                      className="bg-slate-50 border border-slate-200 rounded-xl relative overflow-hidden transition-all duration-300 p-5 flex flex-col justify-center min-h-[100px] group cursor-default"
                    >
                      <div className={`kpi-accent ${stat.accent} absolute left-0 top-4 bottom-4 w-1.5 rounded-r-md h-auto`}></div>
                      
                      {/* Default State (Count) */}
                      <div className={`pl-3 flex flex-col items-start transition-all duration-300 ${stat.amount !== null ? 'group-hover:opacity-0 group-hover:-translate-y-4' : ''}`}>
                        <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">{stat.title}</span>
                        <span className="text-2xl font-black text-[var(--navy)] tracking-tight">{isLoading ? "..." : stat.count}</span>
                      </div>

                      {/* Hover State (Amount) */}
                      {stat.amount !== null && (
                        <div className="absolute inset-0 pl-8 p-5 flex flex-col justify-center opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none">
                          <span className="text-[9px] font-black text-[var(--muted)] uppercase tracking-widest mb-1">Total Amount</span>
                          <span className="text-sm font-black text-[var(--navy)] tracking-tight truncate">{isLoading ? "..." : formatCurrency(stat.amount)}</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Column: Bar Chart */}
              <div className="dashboard-card !items-stretch !gap-0 p-6 flex flex-col h-[350px] relative overflow-hidden transition-all duration-300">
                <h3 className="text-sm font-black text-[var(--navy)] uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex justify-between items-center" style={{ fontFamily: 'var(--font-heading)' }}>
                  Tranche Distribution
                  <span className="bg-slate-100 text-[var(--muted)] text-[10px] px-2 py-0.5 rounded-full tracking-widest">
                    {isLoading ? "..." : `IN TRANCHE FUND: ${totalTrancheFund}`}
                  </span>
                </h3>
                <div className="flex-1 w-full h-full relative min-h-[250px]">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[var(--blue-100)] border-t-[var(--blue)] rounded-full animate-spin"></div>
                    </div>
                  ) : totalProject === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] font-bold text-sm tracking-widest uppercase">
                      No data found
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Tranche 1', projects: tranche1 },
                            { name: 'Tranche 2', projects: tranche2 },
                            { name: 'Tranche 3', projects: tranche3 },
                            { name: 'N/A', projects: naCount }
                          ]}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                          <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                            labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}
                            itemStyle={{ fontWeight: 700 }}
                          />
                          <Bar dataKey="projects" radius={[6, 6, 0, 0]} maxBarSize={50} minPointSize={5} animationDuration={1000}>
                            {
                              [
                                { name: 'Tranche 1', projects: tranche1 },
                                { name: 'Tranche 2', projects: tranche2 },
                                { name: 'Tranche 3', projects: tranche3 },
                                { name: 'N/A', projects: naCount }
                              ].map((entry, index) => {
                                const colors = ['#0B3A68', '#d97706', '#dc2626', '#94a3b8']; // blue, gold, red, slate
                                return <Cell key={`cell-${index}`} fill={colors[index]} />;
                              })
                            }
                          </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Analytics Visualization */}
          <section className="mt-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="flex items-center gap-3 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <PieChartIcon className="w-5 h-5 text-[var(--blue)]" /> 
                Analytics
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Pie Chart */}
              <div className="dashboard-card !items-stretch !gap-0 p-6 flex flex-col h-[400px] relative overflow-hidden transition-all duration-300">
                <h3 className="text-sm font-black text-[var(--navy)] uppercase tracking-widest mb-6 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  Tranche Percentage Distribution
                </h3>
                <div className="flex-1 w-full h-full relative min-h-[250px]">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[var(--blue-100)] border-t-[var(--blue)] rounded-full animate-spin"></div>
                    </div>
                  ) : totalProject === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] font-bold text-sm tracking-widest uppercase">
                      No data found
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                          label={renderCustomizedLabel}
                        >
                          {
                            pieData.map((entry, index) => {
                              const colors = ['#0B3A68', '#d97706', '#dc2626', '#94a3b8'];
                              return <Cell key={`cell-${index}`} fill={colors[index]} />;
                            })
                          }
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                        <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Right Column: Line Chart */}
              <div className="dashboard-card !items-stretch !gap-0 p-6 flex flex-col h-[400px] relative overflow-hidden transition-all duration-300">
                <h3 className="text-sm font-black text-[var(--navy)] uppercase tracking-widest mb-6 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-heading)' }}>
                  Daily Tranche Assignments
                </h3>
                <div className="flex-1 w-full h-full relative min-h-[250px]">
                  {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-8 h-8 border-4 border-[var(--blue-100)] border-t-[var(--blue)] rounded-full animate-spin"></div>
                    </div>
                  ) : totalProject === 0 || dailyTrend.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] font-bold text-sm tracking-widest uppercase">
                      No data found
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={dailyTrend}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                          dy={10} 
                          tickFormatter={(val) => {
                            if (!val) return '';
                            const d = new Date(val);
                            return `${d.getMonth()+1}/${d.getDate()}`;
                          }}
                        />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px' }}
                          labelStyle={{ fontWeight: 900, color: '#0f172a', marginBottom: '4px' }}
                          itemStyle={{ fontWeight: 700 }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontWeight: 700, fontSize: '12px', paddingTop: '10px' }} />
                        <Line type="monotone" dataKey="tranche_1" name="Tranche 1" stroke="#0B3A68" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="tranche_2" name="Tranche 2" stroke="#d97706" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="tranche_3" name="Tranche 3" stroke="#dc2626" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </section>

          <motion.hr 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border-[var(--line)]" 
          />

          {/* Funding Statistics */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <TrendingUp className="w-5 h-5 text-[var(--blue)]" /> 
                Funding Statistics
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Tranche 1', amount: tranche1Amount, progress: 46, accent: 'blue', fill: 'bg-[var(--blue)]' },
                { title: 'Tranche 2', amount: tranche2Amount, progress: 54, accent: 'gold', fill: 'bg-[var(--gold)]' },
                { title: 'Tranche 3', amount: tranche3Amount, progress: 62, accent: 'red', fill: 'bg-[var(--red)]' },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + (idx * 0.1) }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08)' }}
                  className="dashboard-card relative overflow-hidden transition-all duration-300 flex flex-col justify-between p-6"
                >
                  <div className={`kpi-accent ${stat.accent} absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto`}></div>
                  <div className="pl-3 w-full">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="kpi-label mb-1.5">Total Amount For</p>
                        <h4 className="text-base font-black text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>{stat.title}</h4>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--blue-50)] text-[var(--blue)] border border-[var(--blue-100)]">
                        <Wallet className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mb-6">
                      <span className="kpi-value text-2xl">{isLoading ? "..." : formatCurrency(stat.amount)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-auto pl-3 w-full">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">
                      <span>Utilization Progress</span>
                      <span className="text-[var(--navy)]">{stat.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--blue-100)] rounded-full overflow-hidden border border-[var(--line)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.8 + (idx * 0.1) }}
                        className={`h-full ${stat.fill} rounded-full relative`}
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-[2px]"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Project Map */}
          <section className="mt-8 mb-10">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <MapPin className="w-5 h-5 text-[var(--blue)]" /> 
                Philippines Project Map
              </h2>
              
              {/* Map Theme Toggle */}
              <div className="flex bg-slate-100/50 rounded-xl p-1 border border-slate-200 overflow-x-auto">
                {Object.keys(MAP_THEMES).map(key => (
                  <button
                    key={key}
                    onClick={() => setMapTheme(key)}
                    className={`px-4 py-2 text-[11px] font-bold rounded-lg transition-all ${mapTheme === key ? 'bg-[var(--navy)] text-white shadow-md' : 'text-slate-500 hover:bg-white hover:text-[var(--blue)]'} capitalize tracking-wide whitespace-nowrap`}
                  >
                    {MAP_THEMES[key].name}
                  </button>
                ))}
              </div>
            </motion.div>
            
            <div className="dashboard-card !items-stretch !gap-0 p-1 md:p-1 flex flex-col h-[500px] relative overflow-hidden transition-all duration-300">
              <div className="w-full h-full rounded-lg overflow-hidden relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                       <div className="w-8 h-8 border-4 border-[var(--blue-100)] border-t-[var(--blue)] rounded-full animate-spin"></div>
                    </div>
                  ) : mapData.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50 text-[var(--muted)] font-bold text-sm tracking-widest uppercase z-10">
                      No locations found
                    </div>
                  ) : (
                    <MapContainer center={[12.8797, 121.7740]} zoom={6} style={{ height: '100%', width: '100%' }}>
                      <TileLayer
                        attribution={MAP_THEMES[mapTheme].attribution}
                        url={MAP_THEMES[mapTheme].url}
                      />
                      {mapData.map((project, idx) => {
                        const lat = parseFloat(project.latitude);
                        const lng = parseFloat(project.longitude);
                        if (isNaN(lat) || isNaN(lng)) return null;

                        let statusStr = 'N/A';
                        let pointColor = '#94a3b8'; // slate (N/A)

                        if (project.tf_id) {
                          if (project.tranche_3 > 0) {
                            statusStr = 'Tranche 3';
                            pointColor = '#dc2626'; // red
                          } else if (project.tranche_2 > 0) {
                            statusStr = 'Tranche 2';
                            pointColor = '#d97706'; // gold
                          } else if (project.tranche_1 > 0) {
                            statusStr = 'Tranche 1';
                            pointColor = '#0B3A68'; // blue
                          }
                        }

                        return (
                          <CircleMarker
                            key={`map-marker-${project.project_id}-${idx}`}
                            center={[lat, lng]}
                            radius={5}
                            pathOptions={{
                              fillColor: pointColor,
                              fillOpacity: 0.9,
                              color: 'white',
                              weight: 1.5
                            }}
                          >
                            <LeafletTooltip>
                              <div className="text-xs p-1">
                                <p className="font-bold text-[var(--navy)] mb-0.5">{project.school_name || 'Unknown School'}</p>
                                <p className="text-[10px] text-[var(--muted)] font-bold tracking-wider uppercase mb-1">{project.project_category || 'N/A'}</p>
                                <div className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pointColor }}></span>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--navy)]">{statusStr}</span>
                                </div>
                              </div>
                            </LeafletTooltip>
                          </CircleMarker>
                        );
                      })}
                    </MapContainer>
                  )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Blueprint Requirement) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-6 py-3 pb-safe">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <Link to="/" className="flex flex-col items-center gap-1 text-[var(--blue)]">
            <div className="bg-[var(--blue-50)] p-2.5 rounded-2xl shadow-sm border border-[var(--blue-100)]">
              <HomeIcon className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[11px] font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Home</span>
          </Link>
          <Link to="/projects-list" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors">
            <div className="p-2.5 rounded-2xl hover:bg-[var(--blue-50)]">
              <FolderKanban className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Projects</span>
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

export default Home;
